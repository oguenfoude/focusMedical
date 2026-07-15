import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { patients, consultations, ordonnances, reservations, transactions } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { PatientHistoryClient } from "@/components/patient-history-client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { notFound } from "next/navigation";

export default async function PatientHistoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, params.id), eq(patients.clinicId, authUser.clinicId)));

  if (!patient) notFound();

  // Fetch all reservations for this patient
  const reservationList = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.patientId, patient.id),
        eq(reservations.clinicId, authUser.clinicId)
      )
    )
    .orderBy(desc(reservations.date));

  // Fetch all clinic patients for the reservation form search dropdown
  const patientList = await db
    .select({ id: patients.id, fullName: patients.fullName, phoneNumber: patients.phoneNumber })
    .from(patients)
    .where(eq(patients.clinicId, authUser.clinicId))
    .orderBy(asc(patients.fullName));

  // Fetch all consultations for this patient, joined with their ordonnance
  const history = await db
    .select({
      consultation: consultations,
      ordonnance: ordonnances,
    })
    .from(consultations)
    .leftJoin(ordonnances, eq(consultations.id, ordonnances.consultationId))
    .where(
      and(
        eq(consultations.patientId, patient.id),
        eq(consultations.clinicId, authUser.clinicId)
      )
    )
    .orderBy(desc(consultations.date));

  const mappedReservations = reservationList.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    date: r.date.toISOString(),
    time: r.time,
    type: r.type,
    status: r.status,
  }));

  const mappedHistory = history.map((row) => ({
    id: row.consultation.id,
    date: row.consultation.date.toISOString(),
    descriptionMalade: row.consultation.descriptionMalade,
    rapport: row.consultation.rapport,
    diagnostique: row.consultation.diagnostique,
    reservationId: row.consultation.reservationId,
    priceItems: row.consultation.priceItems,
    ordonnance: row.ordonnance
      ? {
          id: row.ordonnance.id,
          content: row.ordonnance.content || "",
          createdAt: row.ordonnance.createdAt.toISOString(),
        }
      : null,
  }));

  // Build merged timeline: combine reservations + consultations, sorted by date desc
  type TimelineItem =
    | { type: "reservation"; id: string; date: string; time: string | null; reservationType: string | null; status: string }
    | { type: "consultation"; id: string; date: string; diagnostique: string | null; reservationId: string | null; hasOrdonnance: boolean };

  const reservationItems: TimelineItem[] = mappedReservations.map((r) => ({
    type: "reservation" as const,
    id: r.id,
    date: r.date,
    time: r.time,
    reservationType: r.type,
    status: r.status,
  }));

  const consultationItems: TimelineItem[] = mappedHistory.map((c) => ({
    type: "consultation" as const,
    id: c.id,
    date: c.date,
    diagnostique: c.diagnostique,
    reservationId: c.reservationId,
    hasOrdonnance: !!c.ordonnance,
  }));

  const timeline = [...reservationItems, ...consultationItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Fetch patient transactions
  const patientTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.patientId, patient.id),
        eq(transactions.clinicId, authUser.clinicId)
      )
    )
    .orderBy(desc(transactions.createdAt));

  const dictionary = await getDictionary();

  return (
    <PatientHistoryClient
      patient={patient}
      timeline={timeline}
      patients={patientList}
      transactions={patientTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        note: t.note,
        consultationId: t.consultationId,
        createdAt: t.createdAt.toISOString(),
      }))}
      dict={dictionary}
    />
  );
}
