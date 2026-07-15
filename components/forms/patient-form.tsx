"use client";

import { useActionState, useEffect, useState } from "react";
import { createPatient, updatePatient } from "@/lib/actions/patients";
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
import { computeAgeFromDob } from "@/lib/utils";

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: {
    id: string;
    fullName: string;
    age: string | null;
    gender: string | null;
    bloodType: string | null;
    phoneNumber: string | null;
    allergies: string | null;
    chronicConditions: string | null;
    weightKg: number | null;
    heightCm: number | null;
  };
  dict: import("@/lib/i18n/types").Dictionary;
}

function isDateOfBirth(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

export function PatientForm({ open, onOpenChange, patient, dict }: PatientFormProps) {
  const isEdit = !!patient;

  const [ageMode, setAgeMode] = useState<"age" | "dob">(
    patient?.age && isDateOfBirth(patient.age) ? "dob" : "age"
  );

  const [dobValue, setDobValue] = useState(
    patient?.age && isDateOfBirth(patient.age) ? patient.age : ""
  );

  const [state, formAction, isPending] = useActionState(
    isEdit
      ? async (prev: { error: string } | { success: true }, formData: FormData) => {
          return updatePatient(patient!.id, formData);
        }
      : createPatient,
    { error: "" }
  );

  useEffect(() => {
    if ("success" in state && state.success) {
      toast.success(isEdit ? dict.patients.toast.updated : dict.patients.toast.created);
      onOpenChange(false);
    }
  }, [state, onOpenChange, isEdit, dict]);

  function handleDobChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatDobInput(e.target.value);
    setDobValue(formatted);
  }

  const computedAge = ageMode === "dob" && isDateOfBirth(dobValue)
    ? computeAgeFromDob(dobValue)
    : null;

  return (
    <Dialog key={patient?.id || "new"} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? dict.patients.edit : dict.patients.create}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground/80">
              {dict.patients.fields.fullName} *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={patient?.fullName || ""}
              className="h-10"
              placeholder={dict.patients.placeholders.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">{dict.patients.fields.birthDate}</Label>
            <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => setAgeMode("age")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  ageMode === "age"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dict.patients.fields.age}
              </button>
              <button
                type="button"
                onClick={() => setAgeMode("dob")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  ageMode === "dob"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dict.patients.fields.dateOfBirth}
              </button>
            </div>
            {ageMode === "age" ? (
              <Input
                key="age-input"
                id="age"
                name="age"
                type="number"
                min="0"
                max="150"
                placeholder={dict.patients.placeholders.age}
                className="h-10"
                defaultValue={
                  patient?.age && !isDateOfBirth(patient.age) ? patient.age : ""
                }
              />
            ) : (
              <div className="space-y-1.5">
                <Input
                  key="dob-input"
                  id="age"
                  name="age"
                  type="text"
                  placeholder={dict.patients.placeholders.dob}
                  className="h-10"
                  value={dobValue}
                  onChange={handleDobChange}
                  maxLength={10}
                />
                {computedAge !== null && (
                  <p className="text-xs text-primary font-medium">
                    {computedAge} {dict.common.yearsOld}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">{dict.patients.fields.gender}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  defaultChecked={patient?.gender === "male"}
                  className="h-4 w-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-sm text-foreground/80">{dict.patients.fields.male}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  defaultChecked={patient?.gender === "female"}
                  className="h-4 w-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-sm text-foreground/80">{dict.patients.fields.female}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              {dict.patients.fields.phone}
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder={dict.patients.placeholders.phone}
              className="h-10"
              defaultValue={patient?.phoneNumber || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType" className="text-sm font-medium text-foreground/80">
              {dict.patients.fields.bloodType}
            </Label>
            <select
              id="bloodType"
              name="bloodType"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              defaultValue={patient?.bloodType || ""}
            >
              <option value="">{dict.patients.placeholders.bloodType}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weightKg" className="text-sm font-medium text-foreground/80">
                {dict.patients.fields.weight}
              </Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                min="0"
                max="500"
                placeholder="kg"
                className="h-10"
                defaultValue={patient?.weightKg ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm" className="text-sm font-medium text-foreground/80">
                {dict.patients.fields.height}
              </Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                min="0"
                max="300"
                placeholder="cm"
                className="h-10"
                defaultValue={patient?.heightCm ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-sm font-medium text-foreground/80">
              {dict.patients.fields.allergies}
            </Label>
            <textarea
              id="allergies"
              name="allergies"
              rows={2}
              placeholder={dict.patients.placeholders.allergies}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] resize-none"
              defaultValue={patient?.allergies || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronicConditions" className="text-sm font-medium text-foreground/80">
              {dict.patients.fields.chronicConditions}
            </Label>
            <textarea
              id="chronicConditions"
              name="chronicConditions"
              rows={2}
              placeholder={dict.patients.placeholders.chronicConditions}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] resize-none"
              defaultValue={patient?.chronicConditions || ""}
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
