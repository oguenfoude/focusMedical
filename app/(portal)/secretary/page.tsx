import { getAuthUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { patients, reservations, transactions } from "@/lib/db/schema";
import { eq, count, and, sql } from "drizzle-orm";
import { Users, CalendarClock, CalendarDays, DollarSign } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function SecretaryDashboard() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [patientCount] = await db
    .select({ value: count() })
    .from(patients)
    .where(eq(patients.clinicId, authUser.clinicId));

  const [scheduledCount] = await db
    .select({ value: count() })
    .from(reservations)
    .where(and(eq(reservations.clinicId, authUser.clinicId), eq(reservations.status, "scheduled")));

  const [totalCount] = await db
    .select({ value: count() })
    .from(reservations)
    .where(eq(reservations.clinicId, authUser.clinicId));

  // Today's income
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  const [incomeResult] = await db
    .select({ value: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.clinicId, authUser.clinicId),
        sql`${transactions.createdAt} >= ${todayStr}`
      )
    );

  const dictionary = await getDictionary();

  const stats = [
    {
      label: dictionary.dashboard.totalPatients,
      value: patientCount?.value ?? 0,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: dictionary.dashboard.scheduledReservations,
      value: scheduledCount?.value ?? 0,
      icon: CalendarClock,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: dictionary.navigation.reservations,
      value: totalCount?.value ?? 0,
      icon: CalendarDays,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: dictionary.dashboard.todayIncome || "Today's Income",
      value: `${(incomeResult?.value ?? 0).toLocaleString()} DA`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dictionary.dashboard.welcomeSecretary}{authUser.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dictionary.dashboard.secretaryOverview}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-card p-6 shadow-sm card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
