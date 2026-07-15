import { StandardTemplate } from "./templates/standard";
import { CompactTemplate } from "./templates/compact";
import { ElegantTemplate } from "./templates/elegant";
import { MinimalTemplate } from "./templates/minimal";
import type { PrescriptionData } from "./templates/standard";

export const templates = {
  standard: {
    name: "Standard",
    component: StandardTemplate,
  },
  compact: {
    name: "Compact",
    component: CompactTemplate,
  },
  elegant: {
    name: "Elegant",
    component: ElegantTemplate,
  },
  minimal: {
    name: "Minimal",
    component: MinimalTemplate,
  },
} as const;

export type TemplateId = keyof typeof templates;

export function PrescriptionDocument({
  templateId,
  data,
}: {
  templateId: TemplateId;
  data: PrescriptionData;
}) {
  const TemplateComponent = templates[templateId].component;
  return <TemplateComponent data={data} />;
}
