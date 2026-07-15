import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { transactions, patients, consultations } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { FinancesClient } from "@/components/finances-client";

export const metadata: Metadata = {
  title: "Finances",
  description: "Suivez les revenus et transactions de votre cabinet.",
};

export default async function FinancesPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  // Fetch all transactions for this clinic with patient and consultation info
  const transactionList = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      note: transactions.note,
      consultationId: transactions.consultationId,
      patientId: transactions.patientId,
      patientName: patients.fullName,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(patients, eq(transactions.patientId, patients.id))
    .where(eq(transactions.clinicId, authUser.clinicId))
    .orderBy(desc(transactions.createdAt));

  // Summary: this month and all time
  const [monthResult] = await db
    .select({ value: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      sql`${transactions.clinicId} = ${authUser.clinicId} AND ${transactions.createdAt} >= date_trunc('month', now())`
    );

  const [allResult] = await db
    .select({ value: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(eq(transactions.clinicId, authUser.clinicId));

  const dictionary = await getDictionary();

  return (
    <FinancesClient
      transactions={transactionList.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        note: t.note,
        consultationId: t.consultationId,
        patientId: t.patientId,
        patientName: t.patientName || null,
        createdAt: t.createdAt.toISOString(),
      }))}
      summary={{
        thisMonth: monthResult?.value ?? 0,
        allTime: allResult?.value ?? 0,
      }}
      dict={dictionary}
    />
  );
}
