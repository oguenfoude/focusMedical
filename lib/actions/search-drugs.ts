"use server";

import { db } from "@/lib/db/client";
import { medications, medicines } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/helpers";
import { eq, or, ilike, and } from "drizzle-orm";

interface DrugResult {
  id: string;
  name: string;
  subtitle: string;
  source: "catalog" | "reference";
}

export async function searchDrugs(
  query: string
): Promise<{ results: DrugResult[] } | { error: string }> {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };

  if (!query || query.trim().length < 2) {
    return { results: [] };
  }

  const searchTerm = `%${query.trim()}%`;

  const [catalogResults, referenceResults] = await Promise.all([
    db
      .select({
        id: medications.id,
        name: medications.name,
        defaultDosage: medications.defaultDosage,
      })
      .from(medications)
      .where(
        and(
          eq(medications.clinicId, authUser.clinicId),
          ilike(medications.name, searchTerm)
        )
      )
      .limit(5),
    db
      .select({
        id: medicines.id,
        brandName: medicines.brandName,
        dci: medicines.dci,
        dosage: medicines.dosage,
        form: medicines.form,
        manufacturer: medicines.manufacturer,
      })
      .from(medicines)
      .where(
        and(
          eq(medicines.isActive, true),
          or(
            ilike(medicines.brandName, searchTerm),
            ilike(medicines.dci, searchTerm),
            ilike(medicines.form, searchTerm),
            ilike(medicines.manufacturer, searchTerm)
          )
        )
      )
      .limit(10),
  ]);

  const results: DrugResult[] = [
    ...catalogResults.map((r) => ({
      id: r.id,
      name: r.name,
      subtitle: r.defaultDosage || "",
      source: "catalog" as const,
    })),
    ...referenceResults.map((r) => {
      const parts = [r.dci, r.dosage, r.form].filter(Boolean).join(" — ");
      return {
        id: r.id,
        name: r.brandName,
        subtitle: parts,
        source: "reference" as const,
      };
    }),
  ];

  return { results };
}
