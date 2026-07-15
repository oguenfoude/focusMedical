"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Trash2, Pill } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n/types";
import { deleteMedication } from "@/lib/actions/medications";

interface Medicine {
  id: string;
  brandName: string;
  dci: string | null;
  dosage: string | null;
  form: string | null;
  manufacturer: string | null;
  isActive: boolean;
}

interface MedicationsClientProps {
  medicines: Medicine[];
  totalCount: number;
  dict: Dictionary;
}

export function MedicationsClient({ medicines, totalCount, dict }: MedicationsClientProps) {
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {dict.medications.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} medicaments references — Recherche par nom, DCI ou fabricant
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          <Pill className="h-4 w-4" />
          <span className="font-medium">{totalCount}</span>
          <span>references</span>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "brandName", label: "Nom Commercial" },
          { key: "dci", label: "DCI (Principe Actif)" },
          { key: "dosage", label: "Dosage" },
          { key: "form", label: "Forme" },
          { key: "manufacturer", label: "Fabricant" },
        ]}
        data={medicines as unknown as Record<string, unknown>[]}
        emptyMessage="Aucun medicament trouve"
        searchKeys={["brandName", "dci", "manufacturer", "form"]}
        dict={dict}
        actions={(row) => (
          <div className="flex gap-1 justify-end">
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
    </div>
  );
}
