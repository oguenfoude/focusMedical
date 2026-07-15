/**
 * Import Algerian drug nomenclature from HuggingFace dataset
 * Source: https://huggingface.co/datasets/tkawen/algerian-drug-nomenclature
 *
 * Usage: npx tsx scripts/import-miph-drugs.ts
 */

require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");
const Papa = require("papaparse");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");

const CSV_URL =
  "https://huggingface.co/datasets/tkawen/algerian-drug-nomenclature/resolve/main/algerian_drug_nomenclature.csv";
const CACHE_PATH = join(__dirname, "cache_miph.csv");

async function downloadCsv() {
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

function parseCsv(raw) {
  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (parsed.errors.length > 0) {
    console.warn(`CSV parse warnings: ${parsed.errors.length}`);
    for (const err of parsed.errors.slice(0, 5)) {
      console.warn(`  Row ${err.row}: ${err.message}`);
    }
  }

  return parsed.data;
}

function mapToDrug(row) {
  const brandName = (row.brand_name || "").trim();
  if (!brandName) return null;

  const dci = (row.inn || "").trim() || null;
  if (!dci) return null;

  const dosage = (row.dosage || "").trim() || null;
  const form = (row.form || "").trim() || null;
  const manufacturer = (row.laboratory || "").trim() || null;

  const status = (row.status || "").toLowerCase();
  const isActive = !status.includes("retiré") && !status.includes("retire") && !status.includes("withdrawn");

  return { brandName, dci, dosage, form, manufacturer, isActive };
}

function deduplicate(drugs) {
  const seen = new Map();
  for (const drug of drugs) {
    const key = `${drug.brandName.toLowerCase()}|${(drug.dosage || "").toLowerCase()}|${(drug.form || "").toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, drug);
    }
  }
  return Array.from(seen.values());
}

async function main() {
  console.log("=== Algerian Drug Nomenclature Import ===\n");

  const raw = await downloadCsv();

  console.log("Parsing CSV...");
  const rows = parseCsv(raw);
  console.log(`Parsed ${rows.length} rows from CSV`);

  const mapped = rows.map(mapToDrug).filter((d) => d !== null);
  console.log(`Mapped ${mapped.length} valid drugs`);

  const unique = deduplicate(mapped);
  console.log(`After deduplication: ${unique.length} unique drugs`);

  // Connect via DIRECT_URL
  const sql = postgres(process.env.DIRECT_URL, { max: 1 });

  console.log("\nClearing existing medicines...");
  await sql`DELETE FROM medicines`;

  console.log("Inserting drugs in batches...");
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const rows = batch.map(d => ({
      brand_name: d.brandName,
      dci: d.dci,
      dosage: d.dosage,
      form: d.form,
      manufacturer: d.manufacturer,
      is_active: d.isActive,
    }));
    await sql`INSERT INTO medicines ${sql(rows, "brand_name", "dci", "dosage", "form", "manufacturer", "is_active")}`;
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${unique.length}`);
  }

  console.log("\n\n=== Import Complete ===");
  console.log(`Total drugs imported: ${inserted}`);

  const [count] = await sql`SELECT count(*)::int as count FROM medicines`;
  const [activeCount] = await sql`SELECT count(*)::int as count FROM medicines WHERE is_active = true`;

  console.log(`Active drugs: ${activeCount.count}`);
  console.log(`Inactive drugs: ${count.count - activeCount.count}`);

  const topLabs = await sql`SELECT manufacturer, count(*)::int as count FROM medicines WHERE manufacturer IS NOT NULL GROUP BY manufacturer ORDER BY count DESC LIMIT 10`;

  console.log("\nTop 10 manufacturers:");
  for (const lab of topLabs) {
    console.log(`  ${lab.manufacturer}: ${lab.count}`);
  }

  await sql.end();
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
