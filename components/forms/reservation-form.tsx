"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { createReservation, updateReservation } from "@/lib/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Search, X } from "lucide-react";

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: { id: string; fullName: string; phoneNumber?: string | null }[];
  reservation?: {
    id: string;
    patientId: string;
    date: string;
    time?: string | null;
    type?: string | null;
    status: string;
  };
  dict: import("@/lib/i18n/types").Dictionary;
}

export function ReservationForm({
  open,
  onOpenChange,
  patients,
  reservation,
  dict,
}: ReservationFormProps) {
  const isEdit = !!reservation;
  const [selectedPatientId, setSelectedPatientId] = useState(reservation?.patientId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(query) ||
      (p.phoneNumber && p.phoneNumber.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOpen = open;
  const prevOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setSelectedPatientId(reservation?.patientId || "");
      setSearchQuery("");
      setShowDropdown(false);
    }
    prevOpen.current = isOpen;
  }, [isOpen, reservation?.patientId]);

  const [state, formAction, isPending] = useActionState(
    isEdit
      ? async (prev: { error: string } | { success: true }, formData: FormData) => {
          return updateReservation(reservation!.id, formData);
        }
      : createReservation,
    { error: "" }
  );

  useEffect(() => {
    if ("success" in state && state.success) {
      toast.success(isEdit ? dict.reservations.toast.updated : dict.reservations.toast.created);
      onOpenChange(false);
    }
  }, [state, onOpenChange, isEdit, dict]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? dict.reservations.edit : dict.reservations.create}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <input type="hidden" name="patientId" value={selectedPatientId} />

          <div className="space-y-2" ref={dropdownRef}>
            <Label className="text-sm font-medium text-foreground/80">{dict.reservations.fields.patient} *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={dict.reservations.fields.searchPatient}
                className="h-10 pl-9 pr-8"
                value={searchQuery || selectedPatient?.fullName || ""}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedPatientId("");
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (!selectedPatientId) setShowDropdown(true);
                }}
                required={!selectedPatientId}
              />
              {(searchQuery || selectedPatientId) && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPatientId("");
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showDropdown && !selectedPatientId && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-lg">
                  {filteredPatients.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">{dict.common.noData}</div>
                  ) : (
                    filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex flex-col"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setSearchQuery("");
                          setShowDropdown(false);
                        }}
                      >
                        <span className="font-medium text-foreground">{p.fullName}</span>
                        {p.phoneNumber && (
                          <span className="text-xs text-muted-foreground">{p.phoneNumber}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedPatientId && (
              <p className="text-xs text-muted-foreground">
                {dict.reservations.fields.patient}: {selectedPatient?.fullName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-foreground/80">{dict.reservations.fields.date} *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                className="h-10"
                defaultValue={
                  reservation?.date
                    ? new Date(reservation.date).toISOString().split("T")[0]
                    : ""
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {dict.reservations.fields.time}
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                className="h-10"
                defaultValue={reservation?.time || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-foreground/80">{dict.reservations.fields.type}</Label>
            <select
              id="type"
              name="type"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              defaultValue={reservation?.type || "consultation"}
            >
              <option value="consultation">{dict.reservations.types.consultation}</option>
              <option value="checkup">{dict.reservations.types.checkup}</option>
              <option value="emergency">{dict.reservations.types.emergency}</option>
            </select>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-foreground/80">{dict.reservations.fields.status}</Label>
              <select
                id="status"
                name="status"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                defaultValue={reservation?.status || "scheduled"}
              >
                <option value="scheduled">{dict.reservations.statuses.scheduled}</option>
                <option value="done">{dict.reservations.statuses.completed}</option>
                <option value="cancelled">{dict.reservations.statuses.cancelled}</option>
              </select>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending || !selectedPatientId}>
              {isPending ? "..." : isEdit ? dict.common.edit : dict.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
