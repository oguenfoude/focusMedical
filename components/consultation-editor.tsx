"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveConsultation } from "@/lib/actions/consultations";
import { searchDrugs } from "@/lib/actions/search-drugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, RotateCcw, FileText, Calendar, Download, Copy, Pill } from "lucide-react";
import { PrescriptionPreview } from "@/components/prescriptions/PrescriptionPreview";
import { generatePrescriptionPDF, downloadPDF } from "@/components/prescriptions/PrescriptionPDF";
import { computeAgeFromDob, isDobFormat } from "@/lib/utils";
import type { TemplateId } from "@/components/prescriptions";

interface DrugResult {
  id: string;
  name: string;
  subtitle: string;
  source: "catalog" | "reference";
}

interface ConsultationEditorProps {
  patient: {
    id: string;
    fullName: string;
    age: string | null;
    gender: string | null;
    phoneNumber: string | null;
    price?: number | null;
    weightKg: number | null;
    heightCm: number | null;
  };
  clinic: {
    name: string;
    address: string | null;
    phone: string | null;
    logoUrl: string | null;
    prescriptionTemplate: string;
    prePrintedTemplate: boolean;
  };
  doctorName: string | null;
  doctorSpecialty?: string | null;
  doctorOrdreNumber?: string | null;
  reservation?: {
    id: string;
    date: string;
    time?: string | null;
  } | null;
  consultation?: {
    id: string;
    date: string;
    ordonnanceContent: string | null;
    reservationId: string | null;
  };
  lastPrescriptionContent?: string | null;
  dict: import("@/lib/i18n/types").Dictionary;
}

export function ConsultationEditor({
  patient,
  clinic,
  doctorName,
  doctorSpecialty,
  doctorOrdreNumber,
  reservation,
  consultation,
  lastPrescriptionContent,
  dict,
}: ConsultationEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!consultation;
  const today = new Date().toISOString().split("T")[0];
  const templateId = (clinic.prescriptionTemplate as TemplateId) || "standard";

  const [date, setDate] = useState(
    consultation?.date
      ? new Date(consultation.date).toISOString().split("T")[0]
      : reservation?.date
      ? new Date(reservation.date).toISOString().split("T")[0]
      : today
  );
  const [ordonnanceContent, setOrdonnanceContent] = useState(consultation?.ordonnanceContent || "");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Drug search state
  const [drugQuery, setDrugQuery] = useState("");
  const [drugResults, setDrugResults] = useState<DrugResult[]>([]);
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [searchingDrug, startDrugSearch] = useTransition();
  const drugSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linkedReservationDate = !isEdit && reservation?.date
    ? new Date(reservation.date).toLocaleDateString()
    : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drugSearchRef.current && !drugSearchRef.current.contains(e.target as Node)) {
        setShowDrugDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDrugSearch = useCallback((query: string) => {
    setDrugQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setDrugResults([]);
      setShowDrugDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startDrugSearch(async () => {
        const result = await searchDrugs(query);
        if ("results" in result) {
          setDrugResults(result.results);
          setShowDrugDropdown(result.results.length > 0);
        }
      });
    }, 500);
  }, []);

  function handleSelectDrug(drug: DrugResult) {
    const line = drug.subtitle ? `${drug.name} — ${drug.subtitle}\n` : `${drug.name}\n`;
    setOrdonnanceContent((prev) => prev + line);
    setDrugQuery("");
    setDrugResults([]);
    setShowDrugDropdown(false);
  }

  function handleCopyLastPrescription() {
    if (lastPrescriptionContent) {
      setOrdonnanceContent(lastPrescriptionContent);
    }
  }

  function handleReset() {
    if (isEdit) {
      setDate(consultation.date ? new Date(consultation.date).toISOString().split("T")[0] : today);
      setOrdonnanceContent(consultation.ordonnanceContent || "");
    } else {
      setDate(reservation?.date ? new Date(reservation.date).toISOString().split("T")[0] : today);
      setOrdonnanceContent("");
    }
    setError(null);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveConsultation({
        consultationId: consultation?.id,
        patientId: patient.id,
        reservationId: reservation?.id || consultation?.reservationId || undefined,
        date,
        ordonnanceContent: ordonnanceContent || undefined,
      });

      if ("error" in result) {
        setError(result.error);
        toast.error(dict.consultations.toast.error);
      } else {
        toast.success(dict.consultations.toast.created);
        router.push(`/doctor/patients/${patient.id}`);
      }
    });
  }

  async function handleDownloadPDF() {
    if (!consultation?.id) return;
    setDownloadingPDF(true);
    try {
      const ageDisplay = patient.age
        ? isDobFormat(patient.age)
          ? `${computeAgeFromDob(patient.age)} ${dict.common.yearsOld}`
          : `${patient.age} ${dict.common.yearsOld}`
        : "";

      const blob = await generatePrescriptionPDF({
        clinic,
        doctorName,
        doctorSpecialty,
        doctorOrdreNumber,
        patient: {
          fullName: patient.fullName,
          age: ageDisplay,
          gender: patient.gender,
          height: patient.heightCm,
          weight: patient.weightKg,
        },
        consultationDate: date ? new Date(date).toLocaleDateString() : "",
        diagnostique: null,
        ordonnanceContent: ordonnanceContent || null,
        prePrintedTemplate: clinic.prePrintedTemplate,
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
      }, templateId);
      const filename = `prescription-${patient.fullName.replace(/\s+/g, "-")}.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error(dict.auth.failedPdf);
    } finally {
      setDownloadingPDF(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? dict.consultations.edit : dict.consultations.newConsultation}
          </h1>
        </div>
        {isEdit && consultation?.ordonnanceContent && (
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
          >
            <Download className="h-4 w-4 me-2" />
            {downloadingPDF ? "..." : dict.ordonnances.printA5.title}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Reservation context banner */}
      {linkedReservationDate && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{dict.consultations.linkedReservation} <strong>{linkedReservationDate}</strong></span>
        </div>
      )}

      {/* Two-panel layout: Form LEFT, Preview RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {isEdit ? dict.consultations.edit : dict.consultations.newConsultation}
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {dict.consultations.fields.date} *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Drug Search */}
            <div className="space-y-2" ref={drugSearchRef}>
              <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Pill className="h-3.5 w-3.5" />
                {dict.consultations.drugs.search}
              </Label>
              <div className="relative">
                <Input
                  value={drugQuery}
                  onChange={(e) => handleDrugSearch(e.target.value)}
                  placeholder={dict.consultations.drugs.searchPlaceholder}
                  className="h-9"
                />
                {showDrugDropdown && drugResults.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-md max-h-60 overflow-auto">
                    {drugResults.map((drug) => (
                      <button
                        key={drug.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex flex-col gap-0.5"
                        onClick={() => handleSelectDrug(drug)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{drug.name}</span>
                          {drug.source === "catalog" && (
                            <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1 py-0.5">CATALOGUE</span>
                          )}
                        </span>
                        {drug.subtitle && (
                          <span className="text-xs text-muted-foreground">{drug.subtitle}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {showDrugDropdown && drugResults.length === 0 && !searchingDrug && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-md p-3 text-sm text-muted-foreground">
                    {dict.common.noData}
                  </div>
                )}
              </div>
            </div>

            {/* Prescription */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ordonnanceContent" className="text-sm font-medium text-primary flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  {dict.consultations.form.prescription}
                </Label>
                {lastPrescriptionContent && !ordonnanceContent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLastPrescription}
                    className="text-xs h-7"
                  >
                    <Copy className="h-3 w-3 me-1" />
                    {dict.consultations.buttons.copyLastPrescription}
                  </Button>
                )}
              </div>
              <Textarea
                id="ordonnanceContent"
                value={ordonnanceContent}
                onChange={(e) => setOrdonnanceContent(e.target.value)}
                placeholder={dict.consultations.form.prescriptionPlaceholder}
                className="border-emerald-200 focus-visible:ring-emerald-500"
                rows={10}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
              <Button
                onClick={handleSave}
                disabled={isPending || !date}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
              >
                <Save className="me-2 h-4 w-4" />
                {isPending ? "..." : dict.consultations.buttons.save}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isPending}>
                <RotateCcw className="me-2 h-4 w-4" />
                {dict.consultations.buttons.reset}
              </Button>
              <Button variant="ghost" onClick={() => router.back()} disabled={isPending}>
                {dict.consultations.buttons.back}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: A5 Live Preview */}
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/50 bg-muted/30 px-6 py-4 no-print">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              {dict.consultations.preview.title}
            </h2>
          </div>

          <div className="p-4 sm:p-6 flex justify-center overflow-auto">
            <div className="w-full max-w-2xl origin-top">
              <PrescriptionPreview
                clinic={clinic}
                doctorName={doctorName}
                doctorSpecialty={doctorSpecialty}
                doctorOrdreNumber={doctorOrdreNumber}
                patient={{
                  fullName: patient.fullName,
                  age: patient.age,
                  gender: patient.gender,
                  height: patient.heightCm,
                  weight: patient.weightKg,
                }}
                consultationDate={date}
                diagnostique={null}
                ordonnanceContent={ordonnanceContent || null}
                prePrintedTemplate={clinic.prePrintedTemplate}
                templateId={templateId}
                dict={dict}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
