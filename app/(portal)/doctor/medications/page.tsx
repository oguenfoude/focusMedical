import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { medications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { MedicationsClient } from "@/components/medications-client";

export default async function MedicationsPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const medicationList = await db
    .select()
    .from(medications)
    .where(eq(medications.clinicId, authUser.clinicId))
    .orderBy(desc(medications.createdAt));

  const dictionary = await getDictionary();

  return <MedicationsClient medications={medicationList} dict={dictionary} />;
}
