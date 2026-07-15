"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { consultations, ordonnances, reservations, patients, transactions, clinics } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";

interface SaveConsultationInput {
  consultationId?: string;
  patientId: string;
  reservationId?: string;
  date: string;
  descriptionMalade?: string;
  rapport?: string;
  diagnostique?: string;
  vitalSigns?: string;
  ordonnanceContent?: string;
  priceItems?: string;
}

export async function saveConsultation(
  data: SaveConsultationInput
): Promise<{ success: true; consultationId: string } | { error: string }> {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden: only doctors can save consultations" };

  // Validate patient belongs to this clinic
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(and(eq(patients.id, data.patientId), eq(patients.clinicId, authUser.clinicId)));

  if (!patient) return { error: "Patient not found in this clinic" };

  // Edit mode — update existing consultation (no transaction needed for edits)
  if (data.consultationId) {
    const [existing] = await db
      .select({ id: consultations.id })
      .from(consultations)
      .where(
        and(
          eq(consultations.id, data.consultationId),
          eq(consultations.clinicId, authUser.clinicId)
        )
      );

    if (!existing) return { error: "Consultation not found" };

    const [existingFull] = await db
      .select()
      .from(consultations)
      .where(
        and(
          eq(consultations.id, data.consultationId),
          eq(consultations.clinicId, authUser.clinicId)
        )
      );

    await db
      .update(consultations)
      .set({
        date: new Date(data.date),
        descriptionMalade: data.descriptionMalade !== undefined ? data.descriptionMalade || null : existingFull?.descriptionMalade ?? null,
        rapport: data.rapport !== undefined ? data.rapport || null : existingFull?.rapport ?? null,
        diagnostique: data.diagnostique !== undefined ? data.diagnostique || null : existingFull?.diagnostique ?? null,
        vitalSigns: data.vitalSigns !== undefined ? data.vitalSigns || null : existingFull?.vitalSigns ?? null,
        priceItems: data.priceItems !== undefined ? data.priceItems || null : existingFull?.priceItems ?? null,
      })
      .where(and(eq(consultations.id, data.consultationId), eq(consultations.clinicId, authUser.clinicId)));

    // Upsert ordonnance
    if (data.ordonnanceContent !== undefined) {
      if (data.ordonnanceContent.trim()) {
        const [existingOrd] = await db
          .select({ id: ordonnances.id })
          .from(ordonnances)
          .where(and(eq(ordonnances.consultationId, data.consultationId!), eq(ordonnances.clinicId, authUser.clinicId)));

        if (existingOrd) {
          await db
            .update(ordonnances)
            .set({ content: data.ordonnanceContent })
            .where(and(eq(ordonnances.id, existingOrd.id), eq(ordonnances.clinicId, authUser.clinicId)));
        } else {
          await db.insert(ordonnances).values({
            clinicId: authUser.clinicId,
            consultationId: data.consultationId!,
            content: data.ordonnanceContent,
          });
        }
      } else {
        await db
          .delete(ordonnances)
          .where(and(eq(ordonnances.consultationId, data.consultationId!), eq(ordonnances.clinicId, authUser.clinicId)));
      }
    }

    revalidatePath(`/doctor/patients/${data.patientId}`);
    revalidatePath("/doctor/reservations");
    return { success: true, consultationId: data.consultationId };
  }

  // Create mode — atomic transaction for new consultation + ordonnance + transaction + reservation
  const result = await db.transaction(async (tx) => {
    // Resolve reservation
    let resolvedReservationId: string;

    if (data.reservationId) {
      const [reservation] = await tx
        .select({ id: reservations.id })
        .from(reservations)
        .where(
          and(
            eq(reservations.id, data.reservationId),
            eq(reservations.clinicId, authUser.clinicId)
          )
        );

      if (!reservation) throw new Error("Reservation not found in this clinic");

      await tx
        .update(reservations)
        .set({ status: "done" })
        .where(and(eq(reservations.id, data.reservationId), eq(reservations.clinicId, authUser.clinicId)));

      resolvedReservationId = data.reservationId;
    } else {
      const [newReservation] = await tx
        .insert(reservations)
        .values({
          clinicId: authUser.clinicId,
          patientId: data.patientId,
          date: new Date(),
          status: "done",
        })
        .returning({ id: reservations.id });

      resolvedReservationId = newReservation.id;
    }

    // Insert consultation
    const [newConsultation] = await tx
      .insert(consultations)
      .values({
        clinicId: authUser.clinicId,
        patientId: data.patientId,
        reservationId: resolvedReservationId,
        clinicUserId: authUser.clinicUsersId,
        date: new Date(data.date),
        descriptionMalade: data.descriptionMalade || null,
        rapport: data.rapport || null,
        diagnostique: data.diagnostique || null,
        vitalSigns: data.vitalSigns || null,
        priceItems: data.priceItems || null,
      })
      .returning({ id: consultations.id });

    // Compute price
    const [patientRow] = await tx
      .select({ price: patients.price })
      .from(patients)
      .where(eq(patients.id, data.patientId));

    const [clinicRow] = await tx
      .select({ visitePrice: clinics.visitePrice })
      .from(clinics)
      .where(eq(clinics.id, authUser.clinicId));

    const amount = patientRow?.price ?? clinicRow?.visitePrice ?? 2500;

    // Insert transaction
    await tx.insert(transactions).values({
      clinicId: authUser.clinicId,
      patientId: data.patientId,
      consultationId: newConsultation.id,
      type: "income",
      amount,
      note: `Consultation pour patient`,
    });

    // Upsert ordonnance
    if (data.ordonnanceContent !== undefined && data.ordonnanceContent.trim()) {
      await tx.insert(ordonnances).values({
        clinicId: authUser.clinicId,
        consultationId: newConsultation.id,
        content: data.ordonnanceContent,
      });
    }

    return newConsultation.id;
  });

  revalidatePath(`/doctor/patients/${data.patientId}`);
  revalidatePath("/doctor/reservations");

  return { success: true, consultationId: result };
}

export async function deleteConsultation(id: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  try {
    // Delete linked ordonnances first (FK constraint)
    await db
      .delete(ordonnances)
      .where(
        and(
          eq(ordonnances.consultationId, id),
          eq(ordonnances.clinicId, authUser.clinicId)
        )
      );

    await db
      .delete(consultations)
      .where(
        and(
          eq(consultations.id, id),
          eq(consultations.clinicId, authUser.clinicId)
        )
      );

    revalidatePath("/doctor/patients", "layout");
    return { success: true as const };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "23503") {
      return { error: "Cannot delete consultation: referenced by other data." };
    }
    return { error: "An unexpected error occurred while deleting the consultation." };
  }
}
