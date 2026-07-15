import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { medicines } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { MedicationsClient } from "@/components/medications-client";

export default async function MedicationsPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [medicineList, countResult] = await Promise.all([
    db
      .select()
      .from(medicines)
      .where(eq(medicines.isActive, true))
      .orderBy(desc(medicines.brandName))
      .limit(200),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(medicines)
      .where(eq(medicines.isActive, true)),
  ]);

  const totalCount = countResult[0]?.count ?? 0;
  const dictionary = await getDictionary();

  return (
    <MedicationsClient
      medicines={medicineList}
      totalCount={totalCount}
      dict={dictionary}
    />
  );
}
