"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { clinics, clinicUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/helpers";

async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

const allowedLogoExts = ["png", "jpg", "jpeg", "webp"];
const maxLogoSize = 5 * 1024 * 1024; // 5MB

const UpdateClinicSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  logo: z.any().optional(),
  prescriptionTemplate: z.string().optional(),
  prePrintedTemplate: z.string().optional(),
});

export async function updateClinic(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  const parsed = UpdateClinicSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    logo: formData.get("logo"),
    prescriptionTemplate: formData.get("prescriptionTemplate"),
    prePrintedTemplate: formData.get("prePrintedTemplate"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.address !== undefined)
    updateData.address = parsed.data.address;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.prescriptionTemplate !== undefined)
    updateData.prescriptionTemplate = parsed.data.prescriptionTemplate;
  if (parsed.data.prePrintedTemplate !== undefined)
    updateData.prePrintedTemplate = parsed.data.prePrintedTemplate === "true";

  if (parsed.data.logo && parsed.data.logo instanceof File && parsed.data.logo.size > 0) {
    const file = parsed.data.logo;
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedLogoExts.includes(fileExt)) {
      return { error: "Invalid logo type. Only PNG, JPG, and WEBP are allowed." };
    }
    if (file.size > maxLogoSize) {
      return { error: "Logo must be less than 5MB." };
    }

    updateData.logoUrl = await fileToBase64(file);
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(clinics)
      .set(updateData)
      .where(eq(clinics.id, authUser.clinicId));
  }

  revalidatePath("/secretary");
  revalidatePath("/doctor");
  return { success: true as const };
}

const UpdateDoctorProfileSchema = z.object({
  specialty: z.string().optional(),
  ordreRegistrationNumber: z.string().optional(),
});

export async function updateDoctorProfile(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "doctor") return { error: "Forbidden" };

  const parsed = UpdateDoctorProfileSchema.safeParse({
    specialty: formData.get("specialty") || undefined,
    ordreRegistrationNumber: formData.get("ordreRegistrationNumber") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  await db
    .update(clinicUsers)
    .set({
      specialty: parsed.data.specialty || null,
      ordreRegistrationNumber: parsed.data.ordreRegistrationNumber || null,
    })
    .where(
      and(
        eq(clinicUsers.clinicId, authUser.clinicId),
        eq(clinicUsers.authUserId, authUser.authUserId)
      )
    );

  revalidatePath("/doctor/settings");
  return { success: true as const };
}
