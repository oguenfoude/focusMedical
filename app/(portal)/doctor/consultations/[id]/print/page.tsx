import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { consultations, ordonnances, patients, clinics, clinicUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { notFound, redirect } from "next/navigation";
import { PrintPageClient } from "@/components/prescriptions/PrintPageClient";
import { computeAgeFromDob, isDobFormat } from "@/lib/utils";
import type { TemplateId } from "@/components/prescriptions";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: "Imprimer l'ordonnance" };
}

export default async function PrintPrescriptionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const authUser = await getAuthUser();
  if (!authUser) return null;
  if (authUser.role !== "doctor") redirect("/secretary");

  const clinicId = authUser.clinicId;

  const [consultation] = await db
    .select()
    .from(consultations)
    .where(and(eq(consultations.id, params.id), eq(consultations.clinicId, clinicId)));

  if (!consultation) notFound();

  const [patient, clinic, [ordonnance]] = await Promise.all([
    db.select().from(patients).where(and(eq(patients.id, consultation.patientId), eq(patients.clinicId, clinicId))),
    db.select().from(clinics).where(eq(clinics.id, clinicId)),
    db.select().from(ordonnances).where(and(eq(ordonnances.consultationId, consultation.id), eq(ordonnances.clinicId, clinicId))),
  ]);

  if (!patient[0] || !clinic[0]) notFound();

  const patientData = patient[0];
  const clinicData = clinic[0];

  let doctorName: string | null = null;
  let doctorSpecialty: string | null = null;
  let doctorOrdreNumber: string | null = null;
  if (consultation.clinicUserId) {
    const [doc] = await db
      .select({ fullName: clinicUsers.fullName, specialty: clinicUsers.specialty, ordreRegistrationNumber: clinicUsers.ordreRegistrationNumber })
      .from(clinicUsers)
      .where(and(eq(clinicUsers.id, consultation.clinicUserId), eq(clinicUsers.clinicId, clinicId)));
    doctorName = doc?.fullName ?? null;
    doctorSpecialty = doc?.specialty ?? null;
    doctorOrdreNumber = doc?.ordreRegistrationNumber ?? null;
  }

  const dictionary = await getDictionary();

  const ageDisplay = patientData.age
    ? isDobFormat(patientData.age)
      ? `${computeAgeFromDob(patientData.age)} ${dictionary.common.yearsOld}`
      : `${patientData.age} ${dictionary.common.yearsOld}`
    : "";

  const templateId = (clinicData.prescriptionTemplate as TemplateId) || "standard";

  return (
    <PrintPageClient
      data={{
        clinic: { name: clinicData.name, address: clinicData.address, phone: clinicData.phone, logoUrl: clinicData.logoUrl },
        doctorName,
        doctorSpecialty,
        doctorOrdreNumber,
        patient: { fullName: patientData.fullName, age: ageDisplay, gender: patientData.gender, height: patientData.heightCm, weight: patientData.weightKg },
        consultationDate: consultation.date.toLocaleDateString(),
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
