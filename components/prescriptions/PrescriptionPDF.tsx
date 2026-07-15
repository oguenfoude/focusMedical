"use client";

import { pdf } from "@react-pdf/renderer";
import { PrescriptionDocument } from "./index";
import type { PrescriptionData } from "./templates/standard";
import type { TemplateId } from "./index";
import { imageToBase64 } from "@/lib/utils";

export async function generatePrescriptionPDF(data: PrescriptionData, templateId: TemplateId = "standard"): Promise<Blob> {
  // Convert logo URL to base64 for PDF embedding
  let logoBase64: string | null = null;
  if (data.clinic.logoUrl) {
    logoBase64 = await imageToBase64(data.clinic.logoUrl);
  }

  const pdfData: PrescriptionData = {
    ...data,
    clinic: {
      ...data.clinic,
      logoUrl: logoBase64,
    },
  };

  const doc = <PrescriptionDocument templateId={templateId} data={pdfData} />;
  return pdf(doc).toBlob();
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
