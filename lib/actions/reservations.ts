"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { reservations, consultations, patients } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, and, count } from "drizzle-orm";

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

const CreateReservationSchema = z.object({
  patientId: z.string().uuid("Invalid patient"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional().refine(
    (val) => !val || isValidTime(val),
    { message: "Time must be in HH:MM format (00:00 - 23:59)" }
  ),
  type: z.enum(["consultation", "checkup", "emergency"]).default("consultation"),
  status: z.enum(["scheduled", "done", "cancelled"]).default("scheduled"),
});

const UpdateReservationSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional().refine(
    (val) => !val || isValidTime(val),
    { message: "Time must be in HH:MM format (00:00 - 23:59)" }
  ),
  type: z.enum(["consultation", "checkup", "emergency"]).optional(),
  status: z.enum(["scheduled", "done", "cancelled"]).optional(),
});

export async function createReservation(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  const parsed = CreateReservationSchema.safeParse({
    patientId: formData.get("patientId"),
    date: formData.get("date"),
    time: formData.get("time") || undefined,
    type: formData.get("type") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.patientId?.[0] || "Invalid data" };
  }

  // Validate patient belongs to this clinic
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(and(eq(patients.id, parsed.data.patientId), eq(patients.clinicId, authUser.clinicId)));

  if (!patient) return { error: "Patient not found in this clinic" };

  await db.insert(reservations).values({
    clinicId: authUser.clinicId,
    patientId: parsed.data.patientId,
    date: new Date(parsed.data.date),
    time: parsed.data.time || null,
    type: parsed.data.type,
    status: parsed.data.status,
  });

  revalidatePath("/secretary/reservations");
  revalidatePath("/doctor/reservations");
  return { success: true as const };
}

export async function updateReservation(id: string, formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  const parsed = UpdateReservationSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time") || undefined,
    type: formData.get("type") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.date) updateData.date = new Date(parsed.data.date);
  if (parsed.data.time !== undefined) updateData.time = parsed.data.time || null;
  if (parsed.data.type) updateData.type = parsed.data.type;
  if (parsed.data.status) updateData.status = parsed.data.status;

  await db
    .update(reservations)
    .set(updateData)
    .where(
      and(
        eq(reservations.id, id),
        eq(reservations.clinicId, authUser.clinicId)
      )
    );

  revalidatePath("/secretary/reservations");
  revalidatePath("/doctor/reservations");
  revalidatePath("/doctor/patients", "layout");
  return { success: true as const };
}

export async function cancelReservation(id: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  await db
    .update(reservations)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(reservations.id, id),
        eq(reservations.clinicId, authUser.clinicId)
      )
    );

  revalidatePath("/secretary/reservations");
  revalidatePath("/doctor/reservations");
  return { success: true as const };
}

export async function deleteReservation(id: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  try {
    const [consultationCount] = await db
      .select({ value: count() })
      .from(consultations)
      .where(and(eq(consultations.reservationId, id), eq(consultations.clinicId, authUser.clinicId)));

    if ((consultationCount?.value ?? 0) > 0) {
      return { error: "Cannot delete reservation: it has an associated consultation." };
    }

    await db
      .delete(reservations)
      .where(
        and(
          eq(reservations.id, id),
          eq(reservations.clinicId, authUser.clinicId)
        )
      );

    revalidatePath("/secretary/reservations");
    revalidatePath("/doctor/reservations");
    return { success: true as const };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "23503") {
      return { error: "Cannot delete reservation: referenced by other data." };
    }
    return { error: "An unexpected error occurred while deleting the reservation." };
  }
}
