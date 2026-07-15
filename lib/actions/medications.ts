"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { medications } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, and, ilike, or } from "drizzle-orm";

const CreateMedicationSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  defaultDosage: z.string().optional(),
  note: z.string().optional(),
});

const UpdateMedicationSchema = CreateMedicationSchema;

export async function createMedication(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  const parsed = CreateMedicationSchema.safeParse({
    name: formData.get("name"),
    defaultDosage: formData.get("defaultDosage") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  await db.insert(medications).values({
    clinicId: authUser.clinicId,
    name: parsed.data.name,
    defaultDosage: parsed.data.defaultDosage || null,
    note: parsed.data.note || null,
  });

  revalidatePath("/doctor/medications");
  return { success: true as const };
}

export async function updateMedication(id: string, formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  const parsed = UpdateMedicationSchema.safeParse({
    name: formData.get("name"),
    defaultDosage: formData.get("defaultDosage") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  await db
    .update(medications)
    .set({
      name: parsed.data.name,
      defaultDosage: parsed.data.defaultDosage || null,
      note: parsed.data.note || null,
    })
    .where(and(eq(medications.id, id), eq(medications.clinicId, authUser.clinicId)));

  revalidatePath("/doctor/medications");
  return { success: true as const };
}

export async function deleteMedication(id: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  await db
    .delete(medications)
    .where(and(eq(medications.id, id), eq(medications.clinicId, authUser.clinicId)));

  revalidatePath("/doctor/medications");
  return { success: true as const };
}

export async function searchMedications(
  query: string
): Promise<{ results: { id: string; name: string; defaultDosage: string | null }[] } | { error: string }> {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  if (!query || query.trim().length < 2) {
    return { results: [] };
  }

  const searchTerm = `%${query.trim()}%`;

  const results = await db
    .select({
      id: medications.id,
      name: medications.name,
      defaultDosage: medications.defaultDosage,
    })
    .from(medications)
    .where(
      and(
        eq(medications.clinicId, authUser.clinicId),
        or(ilike(medications.name, searchTerm))
      )
    )
    .limit(10);

  return { results };
}
