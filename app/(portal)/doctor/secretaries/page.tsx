import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { clinicUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import SecretariesClient from "@/components/secretaries-client";

export default async function SecretariesPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const secretaries = await db
    .select()
    .from(clinicUsers)
    .where(and(eq(clinicUsers.clinicId, authUser.clinicId), eq(clinicUsers.role, "secretary")))
    .orderBy(clinicUsers.createdAt);

  const dictionary = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{dictionary.secretaries.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dictionary.secretaries.subtitle}</p>
      </div>

      <SecretariesClient initialSecretaries={secretaries} dict={dictionary} />
    </div>
  );
}
