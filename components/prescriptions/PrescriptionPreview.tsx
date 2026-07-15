"use client";

import { formatAgeDisplay } from "@/lib/utils";
import { type TemplateId } from "@/components/prescriptions";
import type { Dictionary } from "@/lib/i18n/types";

interface PrescriptionPreviewProps {
  clinic: {
    name: string;
    address: string | null;
    phone: string | null;
    logoUrl: string | null;
  };
  doctorName: string | null;
  doctorSpecialty?: string | null;
  doctorOrdreNumber?: string | null;
  patient: {
    fullName: string;
    age: string | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
  };
  consultationDate: string;
  diagnostique: string | null;
  ordonnanceContent: string | null;
  prePrintedTemplate?: boolean;
  templateId?: TemplateId;
  dict: Dictionary;
}

function StandardPreview({ clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, dict }: PrescriptionPreviewProps) {
  const ageDisplay = formatAgeDisplay(patient.age, dict.common.yearsOld);
  const formattedDate = consultationDate ? new Date(consultationDate).toLocaleDateString() : "";

  return (
    <div className="bg-white p-6 sm:p-10 font-serif text-gray-900 shadow-lg border border-border">
      {prePrintedTemplate ? (
        <div style={{ height: 150 }} />
      ) : (
        <div className="text-center mb-8">
          {clinic.logoUrl && (
            <div className="relative h-16 sm:h-20 w-full mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-contain" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">{clinic.name}</h1>
          {clinic.address && <p className="text-sm sm:text-base text-gray-600 mt-2">{clinic.address}</p>}
          {clinic.phone && <p className="text-sm sm:text-base text-gray-600">{clinic.phone}</p>}
        </div>
      )}
      <hr className="border-gray-300 mb-6" />
      {!prePrintedTemplate && doctorName && (
        <p className="text-base sm:text-lg font-semibold mb-1">{dict.ordonnances.printA5.doctor}: {doctorName}</p>
      )}
      {!prePrintedTemplate && (doctorSpecialty || doctorOrdreNumber) && (
        <p className="text-sm text-gray-500 mb-6">
          {[doctorSpecialty, doctorOrdreNumber ? `${dict.ordonnances.printA5.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base mb-6 flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
        <span className="font-semibold">{dict.ordonnances.printA5.patient}: {patient.fullName}</span>
        <span className="hidden sm:inline text-gray-400">|</span>
        <span>{dict.ordonnances.printA5.age}: {ageDisplay.line1}</span>
        {patient.gender && (<><span className="hidden sm:inline text-gray-400">|</span><span>{dict.ordonnances.printA5.gender}: {patient.gender}</span></>)}
        {patient.height && (<><span className="hidden sm:inline text-gray-400">|</span><span>{dict.ordonnances.printA5.height}: {patient.height} cm</span></>)}
        {patient.weight && (<><span className="hidden sm:inline text-gray-400">|</span><span>{dict.ordonnances.printA5.weight}: {patient.weight} kg</span></>)}
        <span className="hidden sm:inline text-gray-400">|</span>
        <span>{dict.ordonnances.printA5.date}: {formattedDate}</span>
      </div>
      {diagnostique && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{dict.ordonnances.printA5.diagnosis}</h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{diagnostique}</p>
        </div>
      )}
      <div className="mb-12">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">{dict.ordonnances.printA5.prescription}</h3>
        {ordonnanceContent ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{ordonnanceContent}</p>
        ) : (
          <p className="text-base text-gray-400 italic">{dict.ordonnances.printA5.noPrescription}</p>
        )}
      </div>
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex justify-end">
          <div className="text-center">
            <div className="h-16 w-48 border-b border-gray-300 mb-2" />
            <p className="text-sm text-gray-500 uppercase tracking-wider">{dict.ordonnances.printA5.signature}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactPreview({ clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, dict }: PrescriptionPreviewProps) {
  const ageDisplay = formatAgeDisplay(patient.age, dict.common.yearsOld);
  const formattedDate = consultationDate ? new Date(consultationDate).toLocaleDateString() : "";

  const patientFields = [
    { label: dict.ordonnances.printA5.patient, value: patient.fullName },
    { label: dict.ordonnances.printA5.age, value: ageDisplay.line1 },
    patient.gender ? { label: dict.ordonnances.printA5.gender, value: patient.gender } : null,
    patient.height ? { label: dict.ordonnances.printA5.height, value: `${patient.height} cm` } : null,
    patient.weight ? { label: dict.ordonnances.printA5.weight, value: `${patient.weight} kg` } : null,
    { label: dict.ordonnances.printA5.date, value: formattedDate },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white p-5 sm:p-8 font-sans text-gray-900 shadow-lg border border-border">
      {prePrintedTemplate ? (
        <div style={{ height: 150 }} />
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          {clinic.logoUrl && (
            <div className="relative w-16 h-16 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-contain" />
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-xl font-bold">{clinic.name}</h1>
            {clinic.address && <p className="text-xs sm:text-sm text-gray-500 mt-1">{clinic.address}</p>}
            {clinic.phone && <p className="text-xs sm:text-sm text-gray-500">{clinic.phone}</p>}
          </div>
        </div>
      )}
      <hr className="border-gray-900 mb-5" />
      {!prePrintedTemplate && doctorName && <p className="text-sm sm:text-base font-semibold mb-1">{doctorName}</p>}
      {!prePrintedTemplate && (doctorSpecialty || doctorOrdreNumber) && (
        <p className="text-xs sm:text-sm text-gray-500 mb-5">
          {[doctorSpecialty, doctorOrdreNumber ? `${dict.ordonnances.printA5.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
        </p>
      )}
      <table className="w-full border border-gray-200 mb-6 text-sm">
        <tbody>
          {patientFields.map((field, i) => (
            <tr key={i} className={i < patientFields.length - 1 ? "border-b border-gray-100" : ""}>
              <td className="py-2 px-3 font-bold text-gray-500 uppercase text-xs w-[35%] sm:w-[25%] border-r border-gray-100">{field.label}</td>
              <td className="py-2 px-3">{field.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {diagnostique && (
        <div className="mb-6">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-gray-500 mb-2 border-b border-gray-200 pb-1">{dict.ordonnances.printA5.diagnosis}</h3>
          <p className="text-sm sm:text-base pl-3 border-l-2 border-gray-200">{diagnostique}</p>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-xs sm:text-sm font-bold uppercase text-gray-500 mb-2 border-b border-gray-200 pb-1">{dict.ordonnances.printA5.prescription}</h3>
        {ordonnanceContent ? (
          ordonnanceContent.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} className="text-sm sm:text-base pl-3 border-l-2 border-gray-200 mb-1">{line}</p>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic pl-3">{dict.ordonnances.printA5.noPrescription}</p>
        )}
      </div>
      <div className="mt-12 flex justify-end">
        <div className="text-center">
          <div className="w-40 border-b border-gray-300 mb-2" />
          <p className="text-xs text-gray-400 uppercase">{dict.ordonnances.printA5.signature}</p>
        </div>
      </div>
    </div>
  );
}

function ElegantPreview({ clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, dict }: PrescriptionPreviewProps) {
  const ageDisplay = formatAgeDisplay(patient.age, dict.common.yearsOld);
  const formattedDate = consultationDate ? new Date(consultationDate).toLocaleDateString() : "";

  return (
    <div className="bg-white p-8 sm:p-12 font-serif text-gray-900 shadow-lg border border-border">
      {prePrintedTemplate ? (
        <div style={{ height: 150 }} />
      ) : (
        <div className="text-center mb-4">
          {clinic.logoUrl && (
            <div className="relative h-16 sm:h-20 w-full mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-contain" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest">{clinic.name}</h1>
          {clinic.address && <p className="text-sm sm:text-base text-gray-600 mt-2">{clinic.address}</p>}
          {clinic.phone && <p className="text-sm sm:text-base text-gray-600">{clinic.phone}</p>}
        </div>
      )}
      <div className="mb-6">
        <hr className="border-gray-900 border-t-2 mb-1" />
        <hr className="border-gray-300" />
      </div>
      {!prePrintedTemplate && doctorName && <p className="text-lg sm:text-xl font-semibold mb-1">{doctorName}</p>}
      {!prePrintedTemplate && (doctorSpecialty || doctorOrdreNumber) && (
        <p className="text-sm text-gray-500 mb-6">
          {[doctorSpecialty, doctorOrdreNumber ? `${dict.ordonnances.printA5.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
        </p>
      )}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8">
        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">{dict.ordonnances.printA5.patient}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-sm sm:text-base flex-wrap">
          <span className="font-semibold">{patient.fullName}</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span>{dict.ordonnances.printA5.age}: {ageDisplay.line1}</span>
          {patient.gender && (<><span className="hidden sm:inline text-gray-300">|</span><span>{dict.ordonnances.printA5.gender}: {patient.gender}</span></>)}
          {patient.height && (<><span className="hidden sm:inline text-gray-300">|</span><span>{dict.ordonnances.printA5.height}: {patient.height} cm</span></>)}
          {patient.weight && (<><span className="hidden sm:inline text-gray-300">|</span><span>{dict.ordonnances.printA5.weight}: {patient.weight} kg</span></>)}
          <span className="hidden sm:inline text-gray-300">|</span>
          <span>{dict.ordonnances.printA5.date}: {formattedDate}</span>
        </div>
      </div>
      {diagnostique && (
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">{dict.ordonnances.printA5.diagnosis}</h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{diagnostique}</p>
        </div>
      )}
      <div className="mb-12">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">{dict.ordonnances.printA5.prescription}</h3>
        {ordonnanceContent ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{ordonnanceContent}</p>
        ) : (
          <p className="text-base text-gray-400 italic">{dict.ordonnances.printA5.noPrescription}</p>
        )}
      </div>
      <div className="mt-16 flex justify-end">
        <div className="text-center">
          <div className="h-20 w-56 border-b border-gray-300 mb-3" />
          <p className="text-sm text-gray-500 uppercase tracking-wider">{dict.ordonnances.printA5.signature}</p>
        </div>
      </div>
    </div>
  );
}

function MinimalPreview({ clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, dict }: PrescriptionPreviewProps) {
  const ageDisplay = formatAgeDisplay(patient.age, dict.common.yearsOld);
  const formattedDate = consultationDate ? new Date(consultationDate).toLocaleDateString() : "";

  const patientParts: string[] = [];
  patientParts.push(`${dict.ordonnances.printA5.patient}: ${patient.fullName}`);
  if (patient.age) patientParts.push(`${dict.ordonnances.printA5.age}: ${ageDisplay.line1}`);
  if (patient.gender) patientParts.push(`${dict.ordonnances.printA5.gender}: ${patient.gender}`);
  if (patient.height) patientParts.push(`${dict.ordonnances.printA5.height}: ${patient.height} cm`);
  if (patient.weight) patientParts.push(`${dict.ordonnances.printA5.weight}: ${patient.weight} kg`);
  patientParts.push(`${dict.ordonnances.printA5.date}: ${formattedDate}`);

  return (
    <div className="bg-white p-6 sm:p-10 font-sans text-gray-900 shadow-lg border border-border">
      {prePrintedTemplate ? (
        <div style={{ height: 150 }} />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {clinic.logoUrl && (
              <div className="relative w-12 h-12 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold">{clinic.name}</h1>
          </div>
          <div className="text-left sm:text-right">
            {clinic.address && <p className="text-xs sm:text-sm text-gray-500">{clinic.address}</p>}
            {clinic.phone && <p className="text-xs sm:text-sm text-gray-500">{clinic.phone}</p>}
          </div>
        </div>
      )}
      <hr className="border-gray-200 mb-6" />
      {!prePrintedTemplate && doctorName && <p className="text-base sm:text-lg font-semibold mb-1">{doctorName}</p>}
      {!prePrintedTemplate && (doctorSpecialty || doctorOrdreNumber) && (
        <p className="text-sm text-gray-500 mb-6">
          {[doctorSpecialty, doctorOrdreNumber ? `${dict.ordonnances.printA5.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
        </p>
      )}
      <p className="text-sm sm:text-base text-gray-700 mb-8 leading-relaxed">
        {patientParts.join("  ·  ")}
      </p>
      {diagnostique && (
        <div className="mb-8">
          <h3 className="text-sm sm:text-base font-bold mb-2">{dict.ordonnances.printA5.diagnosis}</h3>
          <p className="text-sm sm:text-base whitespace-pre-wrap">{diagnostique}</p>
        </div>
      )}
      <div className="mb-12">
        <h3 className="text-sm sm:text-base font-bold mb-3">{dict.ordonnances.printA5.prescription}</h3>
        {ordonnanceContent ? (
          ordonnanceContent.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} className="text-sm sm:text-base pl-4 mb-1 border-l-2 border-gray-200">· {line}</p>
          ))
        ) : (
          <p className="text-sm sm:text-base text-gray-400 italic">{dict.ordonnances.printA5.noPrescription}</p>
        )}
      </div>
      <div className="mt-16 pt-6 border-t border-gray-200 flex justify-end">
        <div className="text-center">
          <div className="h-16 w-48 border-b border-gray-300 mb-2" />
          <p className="text-sm text-gray-500 uppercase tracking-wider">{dict.ordonnances.printA5.signature}</p>
        </div>
      </div>
    </div>
  );
}

const previewComponents = {
  standard: StandardPreview,
  compact: CompactPreview,
  elegant: ElegantPreview,
  minimal: MinimalPreview,
} as const;

export function PrescriptionPreview({
  templateId = "standard",
  ...props
}: PrescriptionPreviewProps & { templateId?: TemplateId }) {
  const PreviewComponent = previewComponents[templateId] || StandardPreview;
  return <PreviewComponent {...props} templateId={templateId} />;
}
