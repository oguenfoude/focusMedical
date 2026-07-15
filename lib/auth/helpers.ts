import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { clinicUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "doctor" | "secretary";

export interface AuthUser {
  authUserId: string;
  clinicUsersId: string;
  clinicId: string;
  role: UserRole;
  fullName: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [row] = await db
    .select()
    .from(clinicUsers)
    .where(eq(clinicUsers.authUserId, user.id))
    .limit(1);

  if (!row) return null;

  return {
    authUserId: user.id,
    clinicUsersId: row.id,
    clinicId: row.clinicId,
    role: row.role,
    fullName: row.fullName,
  };
}
