import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { clinics, clinicUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import SettingsClient from "@/components/settings-client";

export const metadata: Metadata = {
  title: "Parametres",
  description: "Configurez votre clinique et votre profil.",
};

export default async function SettingsPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId));

  if (!clinic) return null;

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

  const dictionary = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{dictionary.navigation.settings}</h1>
        <p className="mt-1 text-sm text-gray-500">{dictionary.settings.subtitle}</p>
      </div>

      <SettingsClient
        clinic={clinic}
        doctorProfile={{
          specialty: doctorProfile?.specialty ?? null,
          ordreRegistrationNumber: doctorProfile?.ordreRegistrationNumber ?? null,
        }}
        dict={dictionary}
      />
    </div>
  );
}
