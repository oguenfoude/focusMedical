"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { patients, reservations, consultations } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, and, count } from "drizzle-orm";

function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

function isValidAge(value: string): boolean {
  if (/^\d{1,3}$/.test(value)) {
    const n = parseInt(value, 10);
    return n >= 0 && n <= 150;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    return (
      date.getDate() === d &&
      date.getMonth() === m - 1 &&
      date.getFullYear() === y &&
      y >= 1900 && y <= new Date().getFullYear()
    );
  }
  return false;
}

const CreatePatientSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  age: z.string().optional().refine(
    (val) => !val || isValidAge(val),
    { message: "Age must be a number (0-150) or a valid date in DD/MM/YYYY format" }
  ),
  gender: z.enum(["male", "female"]).optional(),
  bloodType: z.string().optional(),
  phoneNumber: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  weightKg: z.coerce.number().int().min(0).max(500).optional(),
  heightCm: z.coerce.number().int().min(0).max(300).optional(),
});

const UpdatePatientSchema = CreatePatientSchema.partial();

export async function createPatient(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  const parsed = CreatePatientSchema.safeParse({
    fullName: formData.get("fullName"),
    age: nullToUndefined(formData.get("age")),
    gender: nullToUndefined(formData.get("gender")),
    bloodType: nullToUndefined(formData.get("bloodType")),
    phoneNumber: nullToUndefined(formData.get("phoneNumber")),
    allergies: nullToUndefined(formData.get("allergies")),
    chronicConditions: nullToUndefined(formData.get("chronicConditions")),
    weightKg: nullToUndefined(formData.get("weightKg")),
    heightCm: nullToUndefined(formData.get("heightCm")),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  await db.insert(patients).values({
    clinicId: authUser.clinicId,
    ...parsed.data,
  });

  revalidatePath("/secretary/patients");
  revalidatePath("/doctor/patients");
  revalidatePath("/doctor/patients", "layout");
  return { success: true as const };
}

export async function updatePatient(id: string, formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  const parsed = UpdatePatientSchema.safeParse({
    fullName: formData.get("fullName"),
    age: nullToUndefined(formData.get("age")),
    gender: nullToUndefined(formData.get("gender")),
    bloodType: nullToUndefined(formData.get("bloodType")),
    phoneNumber: nullToUndefined(formData.get("phoneNumber")),
    allergies: nullToUndefined(formData.get("allergies")),
    chronicConditions: nullToUndefined(formData.get("chronicConditions")),
    weightKg: nullToUndefined(formData.get("weightKg")),
    heightCm: nullToUndefined(formData.get("heightCm")),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  await db
    .update(patients)
    .set(parsed.data)
    .where(and(eq(patients.id, id), eq(patients.clinicId, authUser.clinicId)));

  revalidatePath("/secretary/patients");
  revalidatePath("/doctor/patients");
  revalidatePath("/doctor/patients", "layout");
  return { success: true as const };
}

export async function deletePatient(id: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  try {
    const [reservationCount] = await db
      .select({ value: count() })
      .from(reservations)
      .where(and(eq(reservations.patientId, id), eq(reservations.clinicId, authUser.clinicId)));

    const [consultationCount] = await db
      .select({ value: count() })
      .from(consultations)
      .where(and(eq(consultations.patientId, id), eq(consultations.clinicId, authUser.clinicId)));

    const rCount = reservationCount?.value ?? 0;
    const cCount = consultationCount?.value ?? 0;

    if (rCount > 0 || cCount > 0) {
      const parts: string[] = [];
      if (rCount > 0) parts.push(`${rCount} reservation(s)`);
      if (cCount > 0) parts.push(`${cCount} consultation(s)`);
      return { error: `Cannot delete patient: has ${parts.join(" and ")}. Remove them first.` };
    }

    await db
      .delete(patients)
      .where(and(eq(patients.id, id), eq(patients.clinicId, authUser.clinicId)));

    revalidatePath("/secretary/patients");
    revalidatePath("/doctor/patients");
    revalidatePath("/doctor/patients", "layout");
    return { success: true as const };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "23503") {
      return { error: "Cannot delete patient: referenced by other data. Remove dependent records first." };
    }
    return { error: "An unexpected error occurred while deleting the patient." };
  }
}
