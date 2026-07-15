import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { clinicSchedule } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ScheduleClient } from "@/components/schedule-client";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function SecretarySchedulePage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const schedule = await db
    .select()
    .from(clinicSchedule)
    .where(eq(clinicSchedule.clinicId, authUser.clinicId));

  const dictionary = await getDictionary();

  return (
    <ScheduleClient
      schedule={schedule.map((s) => ({
        dayOfWeek: s.dayOfWeek ?? 0,
        isDayOff: s.isDayOff ?? false,
      }))}
      dict={dictionary}
    />
  );
}
