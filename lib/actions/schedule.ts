"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { clinicSchedule } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";

const SetDayOffSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  isDayOff: z.boolean(),
});

export async function setDayOff(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  if (authUser.role !== "secretary") return { error: "Forbidden" };

  const parsed = SetDayOffSchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    isDayOff: formData.get("isDayOff") === "true",
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Invalid data";
    return { error: firstError };
  }

  const existing = await db
    .select()
    .from(clinicSchedule)
    .where(
      and(
        eq(clinicSchedule.clinicId, authUser.clinicId),
        eq(clinicSchedule.dayOfWeek, parsed.data.dayOfWeek)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(clinicSchedule)
      .set({ isDayOff: parsed.data.isDayOff })
      .where(eq(clinicSchedule.id, existing[0].id));
  } else {
    await db.insert(clinicSchedule).values({
      clinicId: authUser.clinicId,
      dayOfWeek: parsed.data.dayOfWeek,
      isDayOff: parsed.data.isDayOff,
    });
  }

  revalidatePath("/secretary/schedule");
  return { success: true as const };
}
