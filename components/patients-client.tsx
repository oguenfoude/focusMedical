"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { PatientForm } from "@/components/forms/patient-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { deletePatient } from "@/lib/actions/patients";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { isDobFormat, computeAgeFromDob } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/types";

interface Patient {
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
  price: number | null;
  isRegular: boolean | null;
  priceNote: string | null;
}

interface PatientsClientProps {
  patients: Patient[];
  dict: import("@/lib/i18n/types").Dictionary;
  role?: string;
}

function formatAgeCell(value: unknown, dict: Dictionary): React.ReactNode {
  const v = value as string | null;
  if (!v) return <span className="text-muted-foreground">—</span>;
  if (isDobFormat(v)) {
    const years = computeAgeFromDob(v);
    return (
      <span>
        <span className="font-medium text-foreground">{years} {dict.common.yearsOld}</span>
        <span className="ms-1.5 text-xs text-muted-foreground">{v}</span>
      </span>
    );
  }
  return <span className="font-medium text-foreground">{v} {dict.common.yearsOld}</span>;
}

export function PatientsClient({ patients, dict, role }: PatientsClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deletePatient(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(dict.patients.toast.deleted);
      setDeleteId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{dict.patients.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.patients.subtitle}</p>
        </div>
        <Button onClick={() => { setEditPatient(undefined); setFormOpen(true); }}>
          <Plus className="me-2 h-4 w-4" /> {dict.common.add}
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "fullName", label: dict.patients?.fields?.fullName || "Full Name" },
          { key: "age", label: dict.patients?.fields?.age || "Age", render: (value) => formatAgeCell(value, dict) },
          {
            key: "gender",
            label: dict.patients?.fields?.gender || "Gender",
            render: (value) => {
              const v = value as string | null;
              if (!v) return <span className="text-muted-foreground">—</span>;
              return <span className="font-medium text-foreground">{v === "male" ? dict.patients.fields.male : dict.patients.fields.female}</span>;
            },
          },
          { key: "phoneNumber", label: dict.patients?.fields?.phone || "Phone" },
        ]}
        data={patients as unknown as Record<string, unknown>[]}
        emptyMessage={dict.common.noData}
        searchKeys={["fullName", "phoneNumber"]}
        dict={dict}
        actions={(row) => (
          <div className="flex gap-1 justify-end">
            {role === "doctor" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.push(`/doctor/patients/${row.id}`)}
                title={dict.patients.medicalHistory}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {role !== "doctor" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  setEditPatient(row as unknown as Patient);
                  setFormOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setDeleteId(row.id as string)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        )}
      />

      <PatientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editPatient}
        dict={dict}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={dict.patients.deleteTitle}
        description={dict.patients.deleteConfirm}
        dict={dict}
      />
    </div>
  );
}
