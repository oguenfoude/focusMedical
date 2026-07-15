"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, and, sql } from "drizzle-orm";

const CreateTransactionSchema = z.object({
  patientId: z.string().uuid().optional(),
  consultationId: z.string().uuid().optional(),
  type: z.string().min(1, "Le type est obligatoire"),
  amount: z.coerce.number().int().min(1, "Le montant doit être positif"),
  note: z.string().optional(),
});

export async function createTransaction(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  const parsed = CreateTransactionSchema.safeParse({
    patientId: formData.get("patientId") || undefined,
    consultationId: formData.get("consultationId") || undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  await db.insert(transactions).values({
    clinicId: authUser.clinicId,
    patientId: parsed.data.patientId || null,
    consultationId: parsed.data.consultationId || null,
    type: parsed.data.type,
    amount: parsed.data.amount,
    note: parsed.data.note || null,
  });

  revalidatePath("/doctor/finances");
  revalidatePath("/doctor/patients");
  return { success: true as const };
}

export async function deleteTransaction(id: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  const [existing] = await db
    .select({ consultationId: transactions.consultationId })
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.clinicId, authUser.clinicId)))
    .limit(1);

  if (!existing) return { error: "Transaction introuvable" };

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.clinicId, authUser.clinicId)));

  revalidatePath("/doctor/finances");
  revalidatePath("/doctor/patients");
  return { success: true as const };
}

export async function getTransactionsSummary(clinicId: string) {
  const [monthResult] = await db
    .select({ value: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.clinicId, clinicId),
        sql`${transactions.createdAt} >= date_trunc('month', now())`
      )
    );

  const [allResult] = await db
    .select({ value: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(eq(transactions.clinicId, clinicId));

  return {
    thisMonth: monthResult?.value ?? 0,
    allTime: allResult?.value ?? 0,
  };
}
