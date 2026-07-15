import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { patients, clinics, reservations, clinicUsers, ordonnances, consultations } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ConsultationEditor } from "@/components/consultation-editor";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { notFound, redirect } from "next/navigation";

export default async function NewConsultationPage(props: {
  searchParams: Promise<{ patientId?: string; reservationId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const authUser = await getAuthUser();
  if (!authUser) return null;
  if (authUser.role !== "doctor") redirect("/secretary");

  if (!searchParams.patientId) {
    redirect("/doctor/patients");
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(
        eq(patients.id, searchParams.patientId),
        eq(patients.clinicId, authUser.clinicId)
      )
    );

  if (!patient) notFound();

  // Fetch linked reservation if provided
  let reservation: { id: string; date: Date; time: string | null } | null = null;
  if (searchParams.reservationId) {
    const [res] = await db
      .select({ id: reservations.id, date: reservations.date, time: reservations.time })
      .from(reservations)
      .where(
        and(
          eq(reservations.id, searchParams.reservationId),
          eq(reservations.clinicId, authUser.clinicId)
        )
      );
    reservation = res ?? null;
  }

  // Fetch clinic
  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId));

  if (!clinic) notFound();

  // Fetch doctor profile
  const [doctorProfile] = await db
    .select({
      specialty: clinicUsers.specialty,
      ordreRegistrationNumber: clinicUsers.ordreRegistrationNumber,
    })
    .from(clinicUsers)
    .where(
      and(
        eq(clinicUsers.clinicId, authUser.clinicId),
        eq(clinicUsers.authUserId, authUser.authUserId)
      )
    );

  // Fetch last prescription for this patient (Upgrade 3)
  const [lastOrd] = await db
    .select({ content: ordonnances.content })
    .from(ordonnances)
    .innerJoin(consultations, eq(ordonnances.consultationId, consultations.id))
    .where(
      and(
        eq(consultations.patientId, searchParams.patientId),
        eq(consultations.clinicId, authUser.clinicId)
      )
    )
    .orderBy(desc(ordonnances.createdAt))
    .limit(1);

  const dictionary = await getDictionary();

  return (
    <ConsultationEditor
      patient={patient}
      reservation={reservation ? { id: reservation.id, date: reservation.date.toISOString(), time: reservation.time } : null}
      clinic={{
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        logoUrl: clinic.logoUrl,
        prescriptionTemplate: clinic.prescriptionTemplate,
        prePrintedTemplate: clinic.prePrintedTemplate,
      }}
      doctorName={authUser.fullName}
      doctorSpecialty={doctorProfile?.specialty ?? null}
      doctorOrdreNumber={doctorProfile?.ordreRegistrationNumber ?? null}
      lastPrescriptionContent={lastOrd?.content ?? null}
      dict={dictionary}
    />
  );
}
