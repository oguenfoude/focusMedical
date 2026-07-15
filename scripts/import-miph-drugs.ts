/**
 * Import Algerian drug nomenclature from HuggingFace dataset
 * Source: https://huggingface.co/datasets/tkawen/algerian-drug-nomenclature
 *
 * Usage: npx tsx scripts/import-miph-drugs.ts
 */

import { db } from "../lib/db/client";
import { medicines } from "../lib/db/schema";
import { sql } from "drizzle-orm";
import Papa from "papaparse";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CSV_URL =
  "https://huggingface.co/datasets/tkawen/algerian-drug-nomenclature/resolve/main/algerian_drug_nomenclature.csv";
const CACHE_PATH = join(__dirname, "cache_miph.csv");

interface MiphRow {
  registration_number: string;
  code: string;
  inn: string;
  brand_name: string;
  form: string;
  dosage: string;
  packaging: string;
  list: string;
  p1: string;
  p2: string;
  observation: string;
  laboratory: string;
  laboratory_country: string;
  registration_date_initial: string;
  registration_date_final: string;
  type: string;
  status: string;
  shelf_life: string;
  price_decision: string;
  reimbursable: string;
}

interface DrugInsert {
  brandName: string;
  dci: string | null;
  dosage: string | null;
  form: string | null;
  manufacturer: string | null;
  isActive: boolean;
}

async function downloadCsv(): Promise<string> {
  if (existsSync(CACHE_PATH)) {
    console.log("Using cached CSV");
    return readFileSync(CACHE_PATH, "utf-8");
  }

  console.log("Downloading CSV from HuggingFace...");
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const text = await res.text();
  writeFileSync(CACHE_PATH, text);
  console.log(`Downloaded and cached (${(text.length / 1024 / 1024).toFixed(1)} MB)`);
  return text;
}

function parseCsv(raw: string): MiphRow[] {
  const parsed = Papa.parse<MiphRow>(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (parsed.errors.length > 0) {
    console.warn(`CSV parse warnings: ${parsed.errors.length}`);
    for (const err of parsed.errors.slice(0, 5)) {
      console.warn(`  Row ${err.row}: ${err.message}`);
    }
  }

  return parsed.data;
}

function mapToDrug(row: MiphRow): DrugInsert | null {
  const brandName = row.brand_name?.trim();
  if (!brandName) return null;

  // Skip rows with no useful data
  const dci = row.inn?.trim() || null;
  if (!dci) return null;

  const dosage = row.dosage?.trim() || null;
  const form = row.form?.trim() || null;
  const manufacturer = row.laboratory?.trim() || null;

  // Determine if drug is active (not withdrawn)
  const status = (row.status || "").toLowerCase();
  const isActive = !status.includes("retiré") && !status.includes("retire") && !status.includes("withdrawn");

  return { brandName, dci, dosage, form, manufacturer, isActive };
}

function deduplicate(drugs: DrugInsert[]): DrugInsert[] {
  const seen = new Map<string, DrugInsert>();

  for (const drug of drugs) {
    // Deduplicate by brandName + dosage + form (case-insensitive)
    const key = `${drug.brandName.toLowerCase()}|${(drug.dosage || "").toLowerCase()}|${(drug.form || "").toLowerCase()}`;

    if (!seen.has(key)) {
      seen.set(key, drug);
    }
  }

  return Array.from(seen.values());
}

async function main() {
  console.log("=== Algerian Drug Nomenclature Import ===\n");

  // 1. Download
  const raw = await downloadCsv();

  // 2. Parse
  console.log("Parsing CSV...");
  const rows = parseCsv(raw);
  console.log(`Parsed ${rows.length} rows from CSV`);

  // 3. Map
  const mapped = rows.map(mapToDrug).filter((d): d is DrugInsert => d !== null);
  console.log(`Mapped ${mapped.length} valid drugs`);

  // 4. Deduplicate
  const unique = deduplicate(mapped);
  console.log(`After deduplication: ${unique.length} unique drugs`);

  // 5. Clear and insert
  console.log("\nClearing existing medicines...");
  await db.delete(medicines);

  console.log("Inserting drugs in batches...");
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    await db.insert(medicines).values(batch);
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${unique.length}`);
  }

  console.log("\n\n=== Import Complete ===");
  console.log(`Total drugs imported: ${inserted}`);

  // 6. Summary stats
  const [count] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(medicines);

  const [activeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(medicines)
    .where(sql`${medicines.isActive} = true`);

  console.log(`Active drugs: ${activeCount.count}`);
  console.log(`Inactive drugs: ${count.count - activeCount.count}`);

  // Top manufacturers
  const topLabs = await db
    .select({
      manufacturer: medicines.manufacturer,
      count: sql<number>`count(*)::int`,
    })
    .from(medicines)
    .where(sql`${medicines.manufacturer} IS NOT NULL`)
    .groupBy(medicines.manufacturer)
    .orderBy(sql`count(*)::int DESC`)
    .limit(10);

  console.log("\nTop 10 manufacturers:");
  for (const lab of topLabs) {
    console.log(`  ${lab.manufacturer}: ${lab.count}`);
  }
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
