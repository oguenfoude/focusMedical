"use client";

import { useActionState, useEffect } from "react";
import { createMedication, updateMedication } from "@/lib/actions/medications";
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

interface MedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: {
    id: string;
    name: string;
    defaultDosage: string | null;
    note: string | null;
  };
  dict: import("@/lib/i18n/types").Dictionary;
}

export function MedicationForm({ open, onOpenChange, medication, dict }: MedicationFormProps) {
  const isEdit = !!medication;

  const [state, formAction, isPending] = useActionState(
    isEdit
      ? async (prev: { error: string } | { success: true }, formData: FormData) => {
          return updateMedication(medication!.id, formData);
        }
      : createMedication,
    { error: "" }
  );

  useEffect(() => {
    if ("success" in state && state.success) {
      toast.success(isEdit ? dict.medications.toast.updated : dict.medications.toast.created);
      onOpenChange(false);
    }
  }, [state, onOpenChange, isEdit, dict]);

  return (
    <Dialog key={medication?.id || "new"} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? dict.medications.edit : dict.medications.create}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">
              {dict.medications.fields.name} *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={medication?.name || ""}
              className="h-10"
              placeholder={dict.medications.placeholders.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultDosage" className="text-sm font-medium text-foreground/80">
              {dict.medications.fields.defaultDosage}
            </Label>
            <Input
              id="defaultDosage"
              name="defaultDosage"
              defaultValue={medication?.defaultDosage || ""}
              className="h-10"
              placeholder={dict.medications.placeholders.defaultDosage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium text-foreground/80">
              {dict.medications.fields.note}
            </Label>
            <Textarea
              id="note"
              name="note"
              defaultValue={medication?.note || ""}
              placeholder={dict.medications.placeholders.note}
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
              {isPending ? "..." : isEdit ? dict.common.edit : dict.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
