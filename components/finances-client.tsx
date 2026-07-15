"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { DeleteDialog } from "@/components/delete-dialog";
import { deleteTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n/types";
import { TransactionForm } from "@/components/forms/transaction-form";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  consultationId: string | null;
  patientId: string | null;
  patientName: string | null;
  createdAt: string;
}

interface FinancesClientProps {
  transactions: Transaction[];
  summary: {
    thisMonth: number;
    allTime: number;
  };
  dict: Dictionary;
}

export function FinancesClient({ transactions, summary, dict }: FinancesClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteTransaction(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(dict.finances.toast.created);
      setDeleteId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{dict.finances.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.finances.subtitle}</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="me-2 h-4 w-4" /> {dict.finances.addPayment}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{dict.finances.summary.thisMonth}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.thisMonth.toLocaleString()} DA</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{dict.finances.summary.allTime}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.allTime.toLocaleString()} DA</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "createdAt",
            label: dict.common.all,
            render: (value) => (
              <span className="text-sm">{new Date(value as string).toLocaleDateString()}</span>
            ),
          },
          { key: "patientName", label: dict.finances.fields.patient },
          {
            key: "type",
            label: dict.finances.fields.type,
            render: (value) => (
              <span className="text-sm">{dict.finances.types[value as keyof typeof dict.finances.types] || value as string}</span>
            ),
          },
          {
            key: "amount",
            label: dict.finances.fields.amount,
            render: (value) => (
              <span className="font-bold text-green-600">{(value as number).toLocaleString()} DA</span>
            ),
          },
          { key: "note", label: dict.finances.fields.note },
        ]}
        data={transactions as unknown as Record<string, unknown>[]}
        emptyMessage={dict.finances.empty}
        searchKeys={["patientName", "type", "note"]}
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

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
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
