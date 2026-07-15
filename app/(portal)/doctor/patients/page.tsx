import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { patients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PatientsClient } from "@/components/patients-client";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Patients",
  description: "Gerez les dossiers de vos patients.",
};

export default async function DoctorPatientsPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const patientList = await db
    .select()
    .from(patients)
    .where(eq(patients.clinicId, authUser.clinicId))
    .orderBy(desc(patients.createdAt));

  const dictionary = await getDictionary();

  return <PatientsClient patients={patientList} dict={dictionary} role="doctor" />;
}
