"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { db } from "@/lib/db/client";
import { clinics, clinicUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

const allowedLogoExts = ["png", "jpg", "jpeg", "webp"];
const maxLogoSize = 5 * 1024 * 1024; // 5MB

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  clinicName: z.string().min(1, "Clinic name is required"),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
  logo: z.any().optional(),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signIn(
  _prevState: { error: string; fields?: { email: string } },
  formData: FormData
): Promise<{ error: string; fields?: { email: string } }> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password", fields: { email: formData.get("email") as string } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message, fields: { email: parsed.data.email } };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Login failed", fields: { email: parsed.data.email } };
  }

  const [clinicUser] = await db
    .select({ role: clinicUsers.role })
    .from(clinicUsers)
    .where(eq(clinicUsers.authUserId, user.id));

  if (!clinicUser) {
    return { error: "No clinic associated with this account", fields: { email: parsed.data.email } };
  }

  redirect(clinicUser.role === "doctor" ? "/doctor" : "/secretary");
}

export async function signUp(
  _prevState: { error: string; fields?: Record<string, string> },
  formData: FormData
): Promise<{ error: string; fields?: Record<string, string> }> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    clinicName: formData.get("clinicName"),
    clinicAddress: formData.get("clinicAddress") || undefined,
    clinicPhone: formData.get("clinicPhone") || undefined,
    logo: formData.get("logo"),
  });

  const fields: Record<string, string> = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || "",
    clinicName: (formData.get("clinicName") as string) || "",
    clinicAddress: (formData.get("clinicAddress") as string) || "",
    clinicPhone: (formData.get("clinicPhone") as string) || "",
  };

  if (!parsed.success) {
    return { error: "Please fill in all fields correctly", fields };
  }

  let targetClinicId: string | undefined;

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    user_metadata: { full_name: parsed.data.fullName },
    email_confirm: true,
  });

  if (error) {
    return { error: error.message, fields };
  }

  if (data.user) {
    let logoUrl = null;

    if (parsed.data.logo && parsed.data.logo instanceof File && parsed.data.logo.size > 0) {
      const file = parsed.data.logo;
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!fileExt || !allowedLogoExts.includes(fileExt)) {
        return { error: "Invalid logo type. Only PNG, JPG, and WEBP are allowed.", fields };
      }
      if (file.size > maxLogoSize) {
        return { error: "Logo must be less than 5MB.", fields };
      }

      logoUrl = await fileToBase64(file);
    }

    const [newClinic] = await db
      .insert(clinics)
      .values({
        name: parsed.data.clinicName,
        address: parsed.data.clinicAddress || null,
        phone: parsed.data.clinicPhone || null,
        logoUrl,
      })
      .returning();
    targetClinicId = newClinic.id;

    if (targetClinicId) {
      await db.insert(clinicUsers).values({
        clinicId: targetClinicId,
        authUserId: data.user.id,
        role: "doctor",
        fullName: parsed.data.fullName,
        phone: parsed.data.phone || null,
      });
    }
  }

  redirect("/login");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(
  _prevState: { error: string; success: boolean },
  formData: FormData
): Promise<{ error: string; success: boolean }> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Invalid email address", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/update-password` }
  );

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: "", success: true };
}

export async function updatePassword(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Password must be at least 6 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

export async function updateCredentials(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email && !password) {
    return { error: "Nothing to update" };
  }

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (email) updates.email = email;
  if (password) {
    if (password.length < 6) return { error: "Password must be at least 6 characters" };
    updates.password = password;
  }

  const { error } = await supabase.auth.updateUser(updates);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
