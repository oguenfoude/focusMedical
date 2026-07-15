import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { reservations, patients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReservationsClient } from "@/components/reservations-client";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function SecretaryReservationsPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const reservationList = await db
    .select({
      id: reservations.id,
      patientId: reservations.patientId,
      patientName: patients.fullName,
      date: reservations.date,
      time: reservations.time,
      type: reservations.type,
      status: reservations.status,
    })
    .from(reservations)
    .leftJoin(patients, eq(reservations.patientId, patients.id))
    .where(eq(reservations.clinicId, authUser.clinicId));

  const patientList = await db
    .select({ id: patients.id, fullName: patients.fullName, phoneNumber: patients.phoneNumber })
    .from(patients)
    .where(eq(patients.clinicId, authUser.clinicId));

  const dictionary = await getDictionary();

  return (
    <ReservationsClient
      reservations={reservationList.map((r) => ({
        ...r,
        date: r.date?.toISOString() || "",
        patientName: r.patientName || dictionary.common.unknown,
      }))}
      patients={patientList}
      dict={dictionary}
    />
  );
}
