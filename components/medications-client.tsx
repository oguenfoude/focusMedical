"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/data-table";
import { MedicationForm } from "@/components/forms/medication-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { deleteMedication } from "@/lib/actions/medications";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n/types";

interface Medication {
  id: string;
  name: string;
  defaultDosage: string | null;
  note: string | null;
}

interface MedicationsClientProps {
  medications: Medication[];
  dict: Dictionary;
}

export function MedicationsClient({ medications, dict }: MedicationsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editMedication, setEditMedication] = useState<Medication | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteMedication(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(dict.medications.toast.deleted);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{dict.medications.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.medications.subtitle}</p>
        </div>
        <Button onClick={() => { setEditMedication(undefined); setFormOpen(true); }}>
          <Plus className="me-2 h-4 w-4" /> {dict.medications.create}
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: dict.medications.fields.name },
          { key: "defaultDosage", label: dict.medications.fields.defaultDosage },
          { key: "note", label: dict.medications.fields.note },
        ]}
        data={medications as unknown as Record<string, unknown>[]}
        emptyMessage={dict.medications.empty}
        searchKeys={["name"]}
        dict={dict}
        actions={(row) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setEditMedication(row as unknown as Medication);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
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

      <MedicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        medication={editMedication}
        dict={dict}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={dict.medications.deleteTitle}
        description={dict.medications.deleteConfirm}
        dict={dict}
      />
    </div>
  );
}
