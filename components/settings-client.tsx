"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { updateClinic, updateDoctorProfile } from "@/lib/actions/clinic";
import { updateCredentials } from "@/lib/auth/actions";
import { toast } from "sonner";
import { PrescriptionPreview } from "@/components/prescriptions/PrescriptionPreview";
import { templates } from "@/components/prescriptions";
import type { TemplateId } from "@/components/prescriptions";
import type { Dictionary } from "@/lib/i18n/types";

type ClinicType = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  prescriptionTemplate: string;
  prePrintedTemplate: boolean;
};

type DoctorProfileType = {
  specialty: string | null;
  ordreRegistrationNumber: string | null;
};

export default function SettingsClient({
  clinic,
  doctorProfile,
  dict,
}: {
  clinic: ClinicType;
  doctorProfile: DoctorProfileType;
  dict: Dictionary;
}) {
  const [clinicState, clinicAction, isClinicPending] = useActionState(updateClinic, { error: "" });
  const [profileState, profileAction, isProfilePending] = useActionState(updateDoctorProfile, { error: "" });
  const [securityState, securityAction, isSecurityPending] = useActionState(updateCredentials, { error: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    (clinic.prescriptionTemplate as TemplateId) || "standard"
  );
  const [prePrinted, setPrePrinted] = useState(clinic.prePrintedTemplate);

  useEffect(() => {
    if (clinicState?.success) {
      toast.success(dict.settings.toast.clinicUpdated);
    } else if (clinicState?.error) {
      toast.error(clinicState.error);
    }
  }, [clinicState, dict]);

  useEffect(() => {
    if (profileState?.success) {
      toast.success(dict.settings.toast.profileUpdated);
    } else if (profileState?.error) {
      toast.error(profileState.error);
    }
  }, [profileState, dict]);

  useEffect(() => {
    if (securityState?.success) {
      toast.success(dict.settings.toast.securityUpdated);
    } else if (securityState?.error) {
      toast.error(securityState.error);
    }
  }, [securityState, dict]);

  const previewData = {
    clinic: {
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      logoUrl: clinic.logoUrl,
    },
    doctorName: null,
    doctorSpecialty: doctorProfile.specialty,
    doctorOrdreNumber: doctorProfile.ordreRegistrationNumber,
    patient: { fullName: "Patient Name", age: "30 " + dict.common.yearsOld, gender: null, height: null, weight: null },
    consultationDate: new Date().toLocaleDateString(),
    diagnostique: null,
    ordonnanceContent: null,
    labels: {
      doctor: dict.ordonnances.printA5.doctor,
      patient: dict.ordonnances.printA5.patient,
      age: dict.ordonnances.printA5.age,
      date: dict.ordonnances.printA5.date,
      diagnosis: dict.ordonnances.printA5.diagnosis,
      prescription: dict.ordonnances.printA5.prescription,
      signature: dict.ordonnances.printA5.signature,
      noPrescription: dict.ordonnances.printA5.noPrescription,
      specialty: dict.ordonnances.printA5.specialty,
      ordreNumber: dict.ordonnances.printA5.ordreNumber,
      gender: dict.ordonnances.printA5.gender,
      height: dict.ordonnances.printA5.height,
      weight: dict.ordonnances.printA5.weight,
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Clinic Settings */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{dict.settings.clinicConfig}</h2>
          <p className="text-sm text-muted-foreground">{dict.settings.clinicConfigDesc}</p>
        </div>
        <form action={clinicAction} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">{dict.settings.fields.logo}</Label>
            {clinic.logoUrl && (
              <div className="mb-2 w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clinic.logoUrl} alt={dict.settings.fields.logo} className="w-full h-full object-contain" />
              </div>
            )}
            <input
              ref={fileInputRef}
              id="logo"
              name="logo"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-full min-w-0 rounded-xl border border-dashed border-border bg-muted/30 px-4 items-center gap-3 hover:bg-muted/50 hover:border-primary/50 transition-colors"
            >
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {logoFile ? logoFile.name : dict.settings.placeholders.chooseLogo}
              </span>
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{dict.settings.fields.name}</Label>
            <Input id="name" name="name" defaultValue={clinic.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{dict.settings.fields.address}</Label>
            <Input id="address" name="address" defaultValue={clinic.address || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{dict.settings.fields.phone}</Label>
            <Input id="phone" name="phone" defaultValue={clinic.phone || ""} />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={isClinicPending}>
            {isClinicPending ? dict.settings.buttons.saving : dict.settings.buttons.save}
          </Button>
        </form>
      </div>

      {/* Doctor Profile */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{dict.settings.doctorProfile}</h2>
          <p className="text-sm text-muted-foreground">{dict.settings.doctorProfileDesc}</p>
        </div>
        <form action={profileAction} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">{dict.settings.fields.specialty}</Label>
            <Input
              id="specialty"
              name="specialty"
              defaultValue={doctorProfile.specialty || ""}
              placeholder={dict.settings.placeholders.specialty}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ordreRegistrationNumber">{dict.settings.fields.ordreRegistrationNumber}</Label>
            <Input
              id="ordreRegistrationNumber"
              name="ordreRegistrationNumber"
              defaultValue={doctorProfile.ordreRegistrationNumber || ""}
              placeholder={dict.settings.placeholders.ordreRegistrationNumber}
            />
          </div>
          <Button type="submit" variant="secondary" className="w-full mt-2" disabled={isProfilePending}>
            {isProfilePending ? dict.settings.buttons.saving : dict.settings.buttons.saveProfile}
          </Button>
        </form>
      </div>

      {/* Prescription Template */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{dict.settings.prescriptionTemplate}</h2>
          <p className="text-sm text-muted-foreground">{dict.settings.prescriptionTemplateDesc}</p>
        </div>
        <div className="p-6 space-y-4">
          <form action={clinicAction}>
            <input type="hidden" name="prescriptionTemplate" value={selectedTemplate} />
            <input type="hidden" name="name" value={clinic.name} />
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(templates) as TemplateId[]).map((tid) => {
                const templateNames = dict.ordonnances.templates as Record<string, string>;
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => setSelectedTemplate(tid)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      selectedTemplate === tid
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{templateNames[tid] || templates[tid].name}</p>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="prePrintedTemplate" value={prePrinted ? "true" : "false"} />
            <div className="flex items-center justify-between rounded-lg border border-border p-4 mt-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{dict.settings.prePrintedTemplate || "Mode sur ordonnance pré-imprimée"}</p>
                <p className="text-xs text-muted-foreground">{dict.settings.prePrintedTemplateDesc || "Masque l'en-tête et les informations du docteur"}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prePrinted}
                onClick={() => {
                  const newVal = !prePrinted;
                  setPrePrinted(newVal);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  prePrinted ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                    prePrinted ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <Button type="submit" variant="secondary" className="w-full mt-4" disabled={isClinicPending}>
              {isClinicPending ? dict.settings.buttons.saving : dict.settings.buttons.save}
            </Button>
          </form>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{dict.settings.security}</h2>
          <p className="text-sm text-muted-foreground">{dict.settings.securityDesc}</p>
        </div>
        <form action={securityAction} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{dict.settings.fields.newEmail}</Label>
            <Input id="email" name="email" type="email" placeholder={dict.settings.placeholders.keepCurrent} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{dict.settings.fields.newPassword}</Label>
            <Input id="password" name="password" type="password" placeholder={dict.settings.placeholders.keepCurrent} minLength={6} />
          </div>
          <Button type="submit" variant="secondary" className="w-full mt-2" disabled={isSecurityPending}>
            {isSecurityPending ? dict.settings.buttons.updating : dict.settings.buttons.updateCredentials}
          </Button>
        </form>
      </div>

      {/* Live Preview */}
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{dict.consultations.preview.title}</h2>
        </div>
        <div className="p-6 flex justify-center overflow-auto">
          <div className="w-full max-w-[148mm] origin-top">
            <PrescriptionPreview
              clinic={previewData.clinic}
              doctorName={previewData.doctorName}
              doctorSpecialty={previewData.doctorSpecialty}
              doctorOrdreNumber={previewData.doctorOrdreNumber}
              patient={previewData.patient}
              consultationDate={previewData.consultationDate}
              diagnostique={previewData.diagnostique}
              ordonnanceContent={previewData.ordonnanceContent}
              templateId={selectedTemplate}
              dict={dict}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
