"use client";

import { useActionState, useEffect } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  consultationId?: string;
  dict: import("@/lib/i18n/types").Dictionary;
}

export function TransactionForm({ open, onOpenChange, patientId, consultationId, dict }: TransactionFormProps) {
  const [state, formAction, isPending] = useActionState(createTransaction, { error: "" });

  useEffect(() => {
    if ("success" in state && state.success) {
      toast.success(dict.finances.toast.created);
      onOpenChange(false);
    }
  }, [state, onOpenChange, dict]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.finances.addPayment}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          {patientId && <input type="hidden" name="patientId" value={patientId} />}
          {consultationId && <input type="hidden" name="consultationId" value={consultationId} />}

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground/80">
              {dict.finances.fields.amount} *
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              className="h-10"
              placeholder={dict.finances.placeholders.amount}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-foreground/80">
              {dict.finances.fields.type} *
            </Label>
            <select
              id="type"
              name="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="consultation">{dict.finances.types.consultation}</option>
              <option value="additional">{dict.finances.types.additional}</option>
              <option value="other">{dict.finances.types.other}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium text-foreground/80">
              {dict.finances.fields.note}
            </Label>
            <Textarea
              id="note"
              name="note"
              placeholder={dict.finances.placeholders.note}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? "..." : dict.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
