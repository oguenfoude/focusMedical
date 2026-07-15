import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { consultations, ordonnances, patients, clinics, clinicUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { notFound, redirect } from "next/navigation";
import { PrintPageClient } from "@/components/prescriptions/PrintPageClient";
import { computeAgeFromDob, isDobFormat } from "@/lib/utils";
import type { TemplateId } from "@/components/prescriptions";

export default async function PrintPrescriptionPage(props: {
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

  // Fetch clinic
  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId));

  if (!clinic) notFound();

  // Fetch ordonnance (optional — null is OK)
  const [ordonnance] = await db
    .select()
    .from(ordonnances)
    .where(
      and(
        eq(ordonnances.consultationId, consultation.id),
        eq(ordonnances.clinicId, authUser.clinicId)
      )
    );

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

  const dictionary = await getDictionary();

  // Format age for PDF
  const ageDisplay = patient.age
    ? isDobFormat(patient.age)
      ? `${computeAgeFromDob(patient.age)} ${dictionary.common.yearsOld}`
      : `${patient.age} ${dictionary.common.yearsOld}`
    : "";

  // Format consultation date
  const formattedDate = consultation.date.toLocaleDateString();

  const templateId = (clinic.prescriptionTemplate as TemplateId) || "standard";

  return (
    <PrintPageClient
      data={{
        clinic: {
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          logoUrl: clinic.logoUrl,
        },
        doctorName,
        doctorSpecialty,
        doctorOrdreNumber,
        patient: {
          fullName: patient.fullName,
          age: ageDisplay,
          gender: patient.gender,
          height: patient.heightCm,
          weight: patient.weightKg,
        },
        consultationDate: formattedDate,
        diagnostique: consultation.diagnostique,
        ordonnanceContent: ordonnance?.content ?? null,
        labels: {
          doctor: dictionary.ordonnances.printA5.doctor,
          patient: dictionary.ordonnances.printA5.patient,
          age: dictionary.ordonnances.printA5.age,
          date: dictionary.ordonnances.printA5.date,
          diagnosis: dictionary.ordonnances.printA5.diagnosis,
          prescription: dictionary.ordonnances.printA5.prescription,
          signature: dictionary.ordonnances.printA5.signature,
          noPrescription: dictionary.ordonnances.printA5.noPrescription,
          specialty: dictionary.ordonnances.printA5.specialty,
          ordreNumber: dictionary.ordonnances.printA5.ordreNumber,
          gender: dictionary.ordonnances.printA5.gender,
          height: dictionary.ordonnances.printA5.height,
          weight: dictionary.ordonnances.printA5.weight,
        },
      }}
      templateId={templateId}
      dict={dictionary}
    />
  );
}
