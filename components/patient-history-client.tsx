"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/components/forms/patient-form";
import { ReservationForm } from "@/components/forms/reservation-form";
import { cancelReservation } from "@/lib/actions/reservations";
import { DeleteDialog } from "@/components/delete-dialog";
import { ArrowLeft, Calendar, FileText, Plus, CheckCircle, Clock, XCircle, Pencil, User, Phone, StickyNote, Printer, Ban, Stethoscope, Eye, ClipboardPlus, DollarSign, Heart, AlertTriangle, Droplets } from "lucide-react";
import { toast } from "sonner";
import { formatAgeDisplay } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/types";

interface Reservation {
  id: string;
  patientId: string;
  date: string;
  time?: string | null;
  type?: string | null;
  status: string;
}

type TimelineItem =
  | { type: "reservation"; id: string; date: string; time: string | null; reservationType: string | null; status: string }
  | { type: "consultation"; id: string; date: string; diagnostique: string | null; reservationId: string | null; hasOrdonnance: boolean };

interface PatientHistoryClientProps {
  patient: {
    id: string;
    fullName: string;
    age: string | null;
    gender: string | null;
    bloodType: string | null;
    phoneNumber: string | null;
    allergies: string | null;
    chronicConditions: string | null;
    note: string | null;
    weightKg: number | null;
    heightCm: number | null;
  };
  timeline: TimelineItem[];

  patients: { id: string; fullName: string; phoneNumber?: string | null }[];
  transactions?: {
    id: string;
    type: string;
    amount: number;
    note: string | null;
    consultationId: string | null;
    createdAt: string;
  }[];
  dict: Dictionary;
}

export function PatientHistoryClient({ patient, timeline, patients, transactions = [], dict }: PatientHistoryClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editReservation, setEditReservation] = useState<Reservation | undefined>();
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "done" | "cancelled">("scheduled");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const statusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const statusBorder = (status: string) => {
    switch (status) {
      case "done":
        return "border-l-emerald-500";
      case "cancelled":
        return "border-l-destructive";
      default:
        return "border-l-blue-500";
    }
  };

  async function handleCancelReservation() {
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

  const ageDisplay = formatAgeDisplay(patient.age, dict.common.yearsOld);

  const filteredTimeline = statusFilter === "all"
    ? timeline
    : timeline.filter((item) => {
        if (item.type === "reservation") return item.status === statusFilter;
        return statusFilter === "done"; // consultations are always "done"
      });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {patient.fullName}
            </h1>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{ageDisplay.line1}</p>
            {ageDisplay.line2 && (
              <p className="text-xs text-muted-foreground">{ageDisplay.line2}{patient.phoneNumber ? ` · ${patient.phoneNumber}` : ""}</p>
            )}
            {!ageDisplay.line2 && patient.phoneNumber && (
              <p className="text-xs text-muted-foreground">{patient.phoneNumber}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 ms-10 sm:ms-0">
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sm:inline">{dict.common.edit}</span>
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 flex-1 sm:flex-none"
            onClick={() =>
              router.push(`/doctor/consultations/new?patientId=${patient.id}`)
            }
          >
            <Plus className="me-2 h-4 w-4" />
            <span className="hidden sm:inline">{dict.consultations.newConsultation}</span>
            <span className="sm:hidden">{dict.common.add}</span>
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground/80">{dict.patients.info}</span>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{dict.patients.fields.fullName}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{patient.fullName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{dict.patients.fields.age}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {ageDisplay.line1 || "—"}
                </p>
                {ageDisplay.line2 && (
                  <p className="text-xs text-muted-foreground">{ageDisplay.line2}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{dict.patients.fields.phone}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {patient.phoneNumber || "—"}
                </p>
              </div>
            </div>
          </div>
          {(patient.weightKg || patient.heightCm) && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {patient.weightKg && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{dict.patients.fields.weight}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{patient.weightKg} kg</p>
                  </div>
                </div>
              )}
              {patient.heightCm && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{dict.patients.fields.height}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{patient.heightCm} cm</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {(patient.allergies || patient.chronicConditions || patient.bloodType) && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                {patient.bloodType && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                    <Droplets className="h-3 w-3" />
                    {patient.bloodType}
                  </span>
                )}
                {patient.allergies && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    {patient.allergies}
                  </span>
                )}
                {patient.chronicConditions && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
                    <Heart className="h-3 w-3" />
                    {patient.chronicConditions}
                  </span>
                )}
              </div>
            </div>
          )}
          {patient.note && (
            <div className="mt-4 pt-4 border-t border-border/50 sm:mt-5 sm:pt-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{dict.patients.fields.note}</p>
                  <p className="mt-0.5 text-sm text-foreground/80 whitespace-pre-wrap">{patient.note}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified History Timeline */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-base sm:text-lg font-bold text-foreground">{dict.patients.medicalHistory}</span>
              <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {filteredTimeline.length}
              </span>
            </div>
            <div className="flex gap-1">
              {(["all", "scheduled", "done", "cancelled"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-xs ${statusFilter === filter ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter === "all" && dict.common.all}
                  {filter === "scheduled" && dict.reservations.statuses.scheduled}
                  {filter === "done" && dict.reservations.statuses.completed}
                  {filter === "cancelled" && dict.reservations.statuses.cancelled}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4">
          {filteredTimeline.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-muted-foreground text-sm">{dict.common.noData}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredTimeline.map((item, index) => {
                if (item.type === "reservation") {
                  const r = item;
                  return (
                    <div
                      key={`res-${r.id}`}
                      className={`flex items-center justify-between rounded-lg border border-border border-l-2 ${statusBorder(r.status)} px-4 py-2.5 hover:bg-muted/30 transition-colors ${index === 0 ? "bg-muted/30" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        {statusIcon(r.status)}
                        <span className="text-sm font-medium text-foreground">
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                        {r.time && (
                          <span className="text-xs text-muted-foreground">{r.time}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {r.status === "scheduled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title={dict.consultations.startConsultation}
                            onClick={() =>
                              router.push(`/doctor/consultations/new?patientId=${patient.id}&reservationId=${r.id}`)
                            }
                          >
                            <ClipboardPlus className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={dict.common.edit}
                          onClick={() => {
                            setEditReservation({
                              id: r.id,
                              patientId: patient.id,
                              date: r.date,
                              time: r.time,
                              type: r.reservationType,
                              status: r.status,
                            });
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {r.status === "scheduled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title={dict.reservations.statuses.cancelled}
                            onClick={() => setCancelId(r.id)}
                          >
                            <Ban className="h-3.5 w-3.5 text-orange-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                }

                // Consultation item
                const c = item;
                return (
                  <div
                    key={`cons-${c.id}`}
                    className={`flex items-center justify-between rounded-lg border border-border border-l-2 border-l-primary px-4 py-2.5 hover:bg-muted/30 transition-colors ${index === 0 ? "bg-muted/30" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                      {c.diagnostique && (
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {c.diagnostique}
                        </span>
                      )}
                      {c.hasOrdonnance && (
                        <FileText className="h-3.5 w-3.5 text-primary/60" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {c.hasOrdonnance && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={dict.ordonnances.print}
                          onClick={() =>
                            window.open(`/doctor/consultations/${c.id}/print`, "_blank")
                          }
                        >
                          <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={dict.common.show}
                        onClick={() =>
                          router.push(`/doctor/consultations/${c.id}/edit`)
                        }
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      {transactions.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-base sm:text-lg font-bold text-foreground">{dict.finances.title}</span>
              <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {transactions.length}
              </span>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-4">
            <div className="space-y-1.5">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border border-l-2 border-l-green-500 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dict.finances.types[t.type as keyof typeof dict.finances.types] || t.type}
                    </span>
                    {t.note && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">{t.note}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-green-600">{t.amount.toLocaleString()} DA</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PatientForm
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
        dict={dict}
      />

      <ReservationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patients={patients}
        reservation={editReservation}
        dict={dict}
      />

      {/* Cancel Confirmation Dialog */}
      <DeleteDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        onConfirm={handleCancelReservation}
        title={dict.reservations.cancelTitle}
        description={dict.reservations.cancelConfirm}
        dict={dict}
      />
    </div>
  );
}
