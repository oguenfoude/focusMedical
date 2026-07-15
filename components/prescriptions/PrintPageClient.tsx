"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { generatePrescriptionPDF, downloadPDF } from "./PrescriptionPDF";
import { PrescriptionPreview } from "./PrescriptionPreview";
import type { PrescriptionData } from "./templates/standard";
import type { TemplateId } from "./index";
import type { Dictionary } from "@/lib/i18n/types";

interface PrintPageClientProps {
  data: PrescriptionData;
  templateId?: TemplateId;
  dict: Dictionary;
}

export function PrintPageClient({ data, templateId = "standard", dict }: PrintPageClientProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await generatePrescriptionPDF(data, templateId);
      const filename = `prescription-${data.patient.fullName.replace(/\s+/g, "-")}.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error(dict.auth.failedPdf);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="no-print sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="max-w-[148mm] mx-auto flex justify-end">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            variant="outline"
            className="gap-2 h-10"
          >
            <Download className="h-4 w-4" />
            {downloading ? dict.auth.generating : dict.ordonnances.printA5.title}
          </Button>
        </div>
      </div>
      <div className="max-w-[148mm] mx-auto py-8">
        <PrescriptionPreview
          clinic={data.clinic}
          doctorName={data.doctorName}
          doctorSpecialty={data.doctorSpecialty}
          doctorOrdreNumber={data.doctorOrdreNumber}
          patient={data.patient}
          consultationDate={data.consultationDate}
          diagnostique={data.diagnostique}
          ordonnanceContent={data.ordonnanceContent}
          templateId={templateId}
          dict={dict}
        />
      </div>
    </div>
  );
}
