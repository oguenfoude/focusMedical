import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { consultations, ordonnances, patients, clinics, clinicUsers, reservations } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ConsultationEditor } from "@/components/consultation-editor";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { notFound, redirect } from "next/navigation";

export default async function EditConsultationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const authUser = await getAuthUser();
  if (!authUser) return null;
  if (authUser.role !== "doctor") redirect("/secretary");

  // Fetch consultation
  const [consultation] = await db
    .select()
    .from(consultations)
    .where(
      and(
        eq(consultations.id, params.id),
        eq(consultations.clinicId, authUser.clinicId)
      )
    );

  if (!consultation) notFound();

  // Fetch patient
  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(
        eq(patients.id, consultation.patientId),
        eq(patients.clinicId, authUser.clinicId)
      )
    );

  if (!patient) notFound();

  // Fetch linked ordonnance
  const [ordonnance] = await db
    .select()
    .from(ordonnances)
    .where(and(eq(ordonnances.consultationId, consultation.id), eq(ordonnances.clinicId, authUser.clinicId)));

  // Fetch linked reservation if exists
  let linkedReservation: { id: string; date: Date; time: string | null } | null = null;
  if (consultation.reservationId) {
    const [res] = await db
      .select({ id: reservations.id, date: reservations.date, time: reservations.time })
      .from(reservations)
      .where(
        and(
          eq(reservations.id, consultation.reservationId),
          eq(reservations.clinicId, authUser.clinicId)
        )
      );
    linkedReservation = res ?? null;
  }

  // Fetch clinic
  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId));

  if (!clinic) notFound();

  // Resolve authoring doctor name and profile
  let doctorName: string | null = null;
  let doctorSpecialty: string | null = null;
  let doctorOrdreNumber: string | null = null;
  if (consultation.clinicUserId) {
    const [doc] = await db
      .select({
        fullName: clinicUsers.fullName,
        specialty: clinicUsers.specialty,
        ordreRegistrationNumber: clinicUsers.ordreRegistrationNumber,
      })
      .from(clinicUsers)
      .where(
        and(
          eq(clinicUsers.id, consultation.clinicUserId),
          eq(clinicUsers.clinicId, authUser.clinicId)
        )
      );
    doctorName = doc?.fullName ?? null;
    doctorSpecialty = doc?.specialty ?? null;
    doctorOrdreNumber = doc?.ordreRegistrationNumber ?? null;
  }

  // Fetch last prescription for this patient (excluding current consultation)
  const [lastOrd] = await db
    .select({ content: ordonnances.content })
    .from(ordonnances)
    .innerJoin(consultations, eq(ordonnances.consultationId, consultations.id))
    .where(
      and(
        eq(consultations.patientId, consultation.patientId),
        eq(consultations.clinicId, authUser.clinicId)
      )
    )
    .orderBy(desc(ordonnances.createdAt))
    .limit(1);

  const dictionary = await getDictionary();

  return (
    <ConsultationEditor
      patient={patient}
      clinic={{
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        logoUrl: clinic.logoUrl,
        prescriptionTemplate: clinic.prescriptionTemplate,
        prePrintedTemplate: clinic.prePrintedTemplate,
      }}
      doctorName={doctorName}
      doctorSpecialty={doctorSpecialty}
      doctorOrdreNumber={doctorOrdreNumber}
      reservation={linkedReservation ? { id: linkedReservation.id, date: linkedReservation.date.toISOString(), time: linkedReservation.time } : null}
      consultation={{
        id: consultation.id,
        date: consultation.date.toISOString(),
        descriptionMalade: consultation.descriptionMalade,
        rapport: consultation.rapport,
        diagnostique: consultation.diagnostique,
        vitalSigns: consultation.vitalSigns,
        ordonnanceContent: ordonnance?.content || null,
        reservationId: consultation.reservationId,
        priceItems: consultation.priceItems,
      }}
      lastPrescriptionContent={lastOrd?.content ?? null}
      dict={dictionary}
    />
  );
}
