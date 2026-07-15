"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveConsultation } from "@/lib/actions/consultations";
import { searchMedicines } from "@/lib/actions/medicines";
import { searchMedications } from "@/lib/actions/medications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, RotateCcw, FileText, Calendar, Download, Copy, Search, Pill } from "lucide-react";
import { PrescriptionPreview } from "@/components/prescriptions/PrescriptionPreview";
import { generatePrescriptionPDF, downloadPDF } from "@/components/prescriptions/PrescriptionPDF";
import { computeAgeFromDob, isDobFormat } from "@/lib/utils";
import type { TemplateId } from "@/components/prescriptions";

interface Medicine {
  id: string;
  brandName: string;
  dci: string | null;
  dosage: string | null;
  form: string | null;
}

interface MedicationCatalog {
  id: string;
  name: string;
  defaultDosage: string | null;
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
    descriptionMalade: string | null;
    rapport: string | null;
    diagnostique: string | null;
    vitalSigns: string | null;
    ordonnanceContent: string | null;
    reservationId: string | null;
    priceItems?: string | null;
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
  const [diagnostique, setDiagnostique] = useState(consultation?.diagnostique || "");
  const [vitalSigns, setVitalSigns] = useState(consultation?.vitalSigns || "");
  const [ordonnanceContent, setOrdonnanceContent] = useState(consultation?.ordonnanceContent || "");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Medicine autocomplete state
  const [medicineQuery, setMedicineQuery] = useState("");
  const [medicineResults, setMedicineResults] = useState<Medicine[]>([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [searchingMedicine, startMedicineSearch] = useTransition();
  const medicineSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Medication catalog autocomplete state
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<MedicationCatalog[]>([]);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [searchingCatalog, startCatalogSearch] = useTransition();
  const catalogSearchRef = useRef<HTMLDivElement>(null);
  const catalogDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linkedReservationDate = !isEdit && reservation?.date
    ? new Date(reservation.date).toLocaleDateString()
    : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target as Node)) {
        setShowMedicineDropdown(false);
      }
      if (catalogSearchRef.current && !catalogSearchRef.current.contains(e.target as Node)) {
        setShowCatalogDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMedicineSearch = useCallback((query: string) => {
    setMedicineQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setMedicineResults([]);
      setShowMedicineDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startMedicineSearch(async () => {
        const result = await searchMedicines(query);
        if ("results" in result) {
          setMedicineResults(result.results);
          setShowMedicineDropdown(result.results.length > 0);
        }
      });
    }, 300);
  }, []);

  function handleSelectMedicine(med: Medicine) {
    const parts = [med.brandName];
    if (med.dci) parts.push(`(${med.dci})`);
    if (med.dosage) parts.push(`- ${med.dosage}`);
    if (med.form) parts.push(`[${med.form}]`);
    const line = parts.join(" ") + "\n";
    setOrdonnanceContent((prev) => prev + line);
    setMedicineQuery("");
    setMedicineResults([]);
    setShowMedicineDropdown(false);
  }

  const handleCatalogSearch = useCallback((query: string) => {
    setCatalogQuery(query);
    if (catalogDebounceRef.current) clearTimeout(catalogDebounceRef.current);
    if (query.trim().length < 2) {
      setCatalogResults([]);
      setShowCatalogDropdown(false);
      return;
    }
    catalogDebounceRef.current = setTimeout(() => {
      startCatalogSearch(async () => {
        const result = await searchMedications(query);
        if ("results" in result) {
          setCatalogResults(result.results);
          setShowCatalogDropdown(result.results.length > 0);
        }
      });
    }, 300);
  }, []);

  function handleSelectCatalogMedication(med: MedicationCatalog) {
    const line = med.defaultDosage ? `${med.name} — ${med.defaultDosage}\n` : `${med.name}\n`;
    setOrdonnanceContent((prev) => prev + line);
    setCatalogQuery("");
    setCatalogResults([]);
    setShowCatalogDropdown(false);
  }

  function handleCopyLastPrescription() {
    if (lastPrescriptionContent) {
      setOrdonnanceContent(lastPrescriptionContent);
    }
  }

  function handleReset() {
    if (isEdit) {
      setDate(consultation.date ? new Date(consultation.date).toISOString().split("T")[0] : today);
      setDiagnostique(consultation.diagnostique || "");
      setVitalSigns(consultation.vitalSigns || "");
      setOrdonnanceContent(consultation.ordonnanceContent || "");
    } else {
      setDate(reservation?.date ? new Date(reservation.date).toISOString().split("T")[0] : today);
      setDiagnostique("");
      setVitalSigns("");
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
        diagnostique: diagnostique || undefined,
        vitalSigns: vitalSigns || undefined,
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
        diagnostique: diagnostique || null,
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

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnostique" className="text-sm font-medium text-foreground/80">
                {dict.consultations.fields.diagnosis}
              </Label>
              <Textarea
                id="diagnostique"
                value={diagnostique}
                onChange={(e) => setDiagnostique(e.target.value)}
                placeholder={dict.consultations.fields.diagnosis + "..."}
                rows={3}
              />
            </div>

            {/* Vital Signs */}
            <div className="space-y-2">
              <Label htmlFor="vitalSigns" className="text-sm font-medium text-foreground/80">
                {dict.consultations.fields.vitalSigns}
              </Label>
              <Textarea
                id="vitalSigns"
                value={vitalSigns}
                onChange={(e) => setVitalSigns(e.target.value)}
                placeholder={dict.consultations.form.vitalSignsPlaceholder}
                rows={2}
              />
            </div>

            {/* Medication Catalog Search */}
            <div className="space-y-2" ref={catalogSearchRef}>
              <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Pill className="h-3.5 w-3.5" />
                {dict.medications.title}
              </Label>
              <div className="relative">
                <Input
                  value={catalogQuery}
                  onChange={(e) => handleCatalogSearch(e.target.value)}
                  placeholder={dict.medications.placeholders.name}
                  className="h-9"
                />
                {showCatalogDropdown && catalogResults.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-md max-h-60 overflow-auto">
                    {catalogResults.map((med) => (
                      <button
                        key={med.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex flex-col gap-0.5"
                        onClick={() => handleSelectCatalogMedication(med)}
                      >
                        <span className="font-medium">{med.name}</span>
                        {med.defaultDosage && (
                          <span className="text-xs text-muted-foreground">{med.defaultDosage}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {showCatalogDropdown && catalogResults.length === 0 && !searchingCatalog && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-md p-3 text-sm text-muted-foreground">
                    {dict.common.noData}
                  </div>
                )}
              </div>
            </div>

            {/* Medicine Search */}
            <div className="space-y-2" ref={medicineSearchRef}>
              <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                {dict.consultations.medicines.search}
              </Label>
              <div className="relative">
                <Input
                  value={medicineQuery}
                  onChange={(e) => handleMedicineSearch(e.target.value)}
                  placeholder={dict.consultations.medicines.searchPlaceholder}
                  className="h-9"
                />
                {showMedicineDropdown && medicineResults.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-md max-h-60 overflow-auto">
                    {medicineResults.map((med) => (
                      <button
                        key={med.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex flex-col gap-0.5"
                        onClick={() => handleSelectMedicine(med)}
                      >
                        <span className="font-medium">{med.brandName}</span>
                        <span className="text-xs text-muted-foreground">
                          {[med.dci, med.dosage, med.form].filter(Boolean).join(" - ")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {showMedicineDropdown && medicineResults.length === 0 && !searchingMedicine && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-md p-3 text-sm text-muted-foreground">
                    {dict.consultations.medicines.noResults}
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
                rows={8}
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
                diagnostique={diagnostique || null}
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
