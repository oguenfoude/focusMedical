"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { clinicUsers, consultations } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const secretarySchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export async function saveSecretary(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "doctor") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const password = formData.get("password") as string;

  const parsed = secretarySchema.safeParse({
    id,
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: password || undefined,
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (parsed.data.id) {
    // Update existing secretary
    const [existing] = await db
      .select()
      .from(clinicUsers)
      .where(and(eq(clinicUsers.id, parsed.data.id), eq(clinicUsers.clinicId, authUser.clinicId)));

    if (!existing) return { error: "Secretary not found" };

    // Update in Supabase Auth
    const authUpdatePayload: {
      email?: string;
      user_metadata?: { full_name: string };
      password?: string;
    } = {
      email: parsed.data.email,
      user_metadata: { full_name: parsed.data.fullName }
    };
    if (parsed.data.password) {
      authUpdatePayload.password = parsed.data.password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      existing.authUserId,
      authUpdatePayload
    );

    if (authError) return { error: authError.message };

    // Update in DB
    await db
      .update(clinicUsers)
      .set({ fullName: parsed.data.fullName, phone: parsed.data.phone || null })
      .where(and(eq(clinicUsers.id, parsed.data.id), eq(clinicUsers.clinicId, authUser.clinicId)));

  } else {
    // Create new secretary
    if (!parsed.data.password) {
      return { error: "Password is required for new accounts" };
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.fullName }
    });

    if (authError) return { error: authError.message };

    if (authData.user) {
      await db.insert(clinicUsers).values({
        clinicId: authUser.clinicId,
        authUserId: authData.user.id,
        role: "secretary",
        fullName: parsed.data.fullName,
        phone: parsed.data.phone || null,
      });
    }
  }

  revalidatePath("/doctor/secretaries");
  return { success: true as const };
}

export async function deleteSecretary(id: string) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "doctor") return { error: "Unauthorized" };

  const [existing] = await db
    .select()
    .from(clinicUsers)
    .where(and(eq(clinicUsers.id, id), eq(clinicUsers.clinicId, authUser.clinicId)));

  if (!existing) return { error: "Secretary not found" };

  // Check for linked consultations
  const [{ cnt }] = await db
    .select({ cnt: count() })
    .from(consultations)
    .where(eq(consultations.clinicUserId, id));

  if (cnt > 0) {
    return { error: "Cannot delete: this secretary has linked consultations. Remove them first." };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(existing.authUserId);
  if (authError) return { error: authError.message };

  try {
    await db.delete(clinicUsers).where(and(eq(clinicUsers.id, id), eq(clinicUsers.clinicId, authUser.clinicId)));
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "23503") {
      return { error: "Cannot delete: this secretary is referenced by other records." };
    }
    throw e;
  }

  revalidatePath("/doctor/secretaries");
  return { success: true as const };
}
