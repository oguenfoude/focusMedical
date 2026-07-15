"use server";

import { db } from "@/lib/db/client";
import { medicines } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm";

export async function searchMedicines(
  query: string
): Promise<{ results: { id: string; brandName: string; dci: string | null; dosage: string | null; form: string | null }[] } | { error: string }> {
  if (!query || query.trim().length < 2) {
    return { results: [] };
  }

  const searchTerm = `%${query.trim()}%`;

  const results = await db
    .select({
      id: medicines.id,
      brandName: medicines.brandName,
      dci: medicines.dci,
      dosage: medicines.dosage,
      form: medicines.form,
    })
    .from(medicines)
    .where(or(ilike(medicines.brandName, searchTerm), ilike(medicines.dci, searchTerm)))
    .limit(10);

  return { results };
}
