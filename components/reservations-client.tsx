"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { ReservationForm } from "@/components/forms/reservation-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { deleteReservation, cancelReservation } from "@/lib/actions/reservations";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";

interface Reservation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time?: string | null;
  type?: string | null;
  status: string;
}

interface Patient {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
}

interface ReservationsClientProps {
  reservations: Reservation[];
  patients: Patient[];
  dict: import("@/lib/i18n/types").Dictionary;
}

export function ReservationsClient({ reservations, patients, dict }: ReservationsClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editReservation, setEditReservation] = useState<Reservation | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "done" | "cancelled">("scheduled");

  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return sortedReservations;
    return sortedReservations.filter((r) => r.status === statusFilter);
  }, [sortedReservations, statusFilter]);

  const counts = useMemo(() => ({
    all: sortedReservations.length,
    scheduled: sortedReservations.filter((r) => r.status === "scheduled").length,
    done: sortedReservations.filter((r) => r.status === "done").length,
    cancelled: sortedReservations.filter((r) => r.status === "cancelled").length,
  }), [sortedReservations]);

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteReservation(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(dict.reservations.toast.deleted);
      setDeleteId(null);
      router.refresh();
    }
  }

  async function handleCancel() {
    if (!cancelId) return;
    const result = await cancelReservation(cancelId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(dict.reservations.toast.updated);
      setCancelId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{dict.reservations.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.reservations.subtitle}</p>
        </div>
        <Button onClick={() => { setEditReservation(undefined); setFormOpen(true); }} className="sm:w-auto">
          <Plus className="me-2 h-4 w-4" /> {dict.common.add}
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1">
        {(["all", "scheduled", "done", "cancelled"] as const).map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "default" : "ghost"}
            size="sm"
            className={`h-8 text-xs ${statusFilter === filter ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => setStatusFilter(filter)}
          >
            {filter === "all" && dict.common.all}
            {filter === "scheduled" && dict.reservations.statuses.scheduled}
            {filter === "done" && dict.reservations.statuses.completed}
            {filter === "cancelled" && dict.reservations.statuses.cancelled}
            <span className="ms-1.5 text-xs opacity-70">{counts[filter]}</span>
          </Button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "patientName", label: dict.reservations.fields.patient },
          {
            key: "date",
            label: dict.reservations.fields.date,
            render: (value, row) => {
              const d = value ? new Date(value as string).toLocaleDateString() : "";
              const t = row.time as string | null | undefined;
              return (
                <span>
                  {d}
                   {t && <span className="ms-1.5 text-xs text-muted-foreground">{t}</span>}
                </span>
              );
            },
          },
          {
            key: "type",
            label: dict.reservations.fields.type,
            render: (value) => {
              const type = String(value || "consultation");
              return (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    type === "emergency"
                      ? "bg-red-50 text-red-700"
                      : type === "checkup"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {type === "consultation" ? dict.reservations.types.consultation : type === "checkup" ? dict.reservations.types.checkup : dict.reservations.types.emergency}
                </span>
              );
            },
          },
          {
            key: "status",
            label: dict.reservations.fields.status,
            render: (value) => (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  value === "done"
                    ? "bg-primary/10 text-primary"
                    : value === "cancelled"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {String(value) === "done" ? dict.reservations.statuses.completed : String(value) === "cancelled" ? dict.reservations.statuses.cancelled : dict.reservations.statuses.scheduled}
              </span>
            ),
          },
        ]}
        data={filteredReservations as unknown as Record<string, unknown>[]}
        emptyMessage={dict.common.noData}
        searchKeys={["patientName", "status"]}
        dict={dict}
        actions={(row) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={dict.common.edit}
              onClick={() => {
                setEditReservation(row as unknown as Reservation);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {row.status === "scheduled" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title={dict.reservations.statuses.cancelled}
                onClick={() => setCancelId(row.id as string)}
              >
                <Ban className="h-3.5 w-3.5 text-orange-500" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={dict.common.delete}
              onClick={() => setDeleteId(row.id as string)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        )}
      />

      <ReservationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patients={patients}
        reservation={editReservation}
        dict={dict}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={dict.reservations.deleteTitle}
        description={dict.reservations.deleteConfirm}
        dict={dict}
      />

      <DeleteDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        onConfirm={handleCancel}
        title={dict.reservations.cancelTitle}
        description={dict.reservations.cancelConfirm}
        dict={dict}
      />
    </div>
  );
}
