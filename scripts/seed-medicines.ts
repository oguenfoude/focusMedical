import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { medicines } from "../lib/db/schema";

const connectionString = process.env.DIRECT_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

const seedData = [
  { brandName: "Paracétamol", dci: "Paracétamol", dosage: "1000mg", form: "Comprimé" },
  { brandName: "Doliprane", dci: "Paracétamol", dosage: "500mg", form: "Comprimé" },
  { brandName: "Amoxicilline", dci: "Amoxicilline", dosage: "1g", form: "Gélule" },
  { brandName: "Augmentin", dci: "Amoxicilline + Acide clavulanique", dosage: "1g/125mg", form: "Comprimé" },
  { brandName: "Spasfon", dci: "Phléverine", dosage: "80mg", form: "Comprimé" },
  { brandName: "Voltarène", dci: "Diclofénac", dosage: "100mg", form: "Suppositoire" },
  { brandName: "Nurofen", dci: "Ibuprofène", dosage: "400mg", form: "Comprimé" },
  { brandName: "Ibuprofène", dci: "Ibuprofène", dosage: "200mg", form: "Comprimé" },
  { brandName: "Gaviscon", dci: "Alginique de sodium", dosage: "500mg", form: "Suspension buvable" },
  { brandName: "Oméprazole", dci: "Oméprazole", dosage: "20mg", form: "Gélule" },
  { brandName: "Erythromycine", dci: "Erythromycine", dosage: "500mg", form: "Comprimé" },
  { brandName: "Metformine", dci: "Metformine", dosage: "850mg", form: "Comprimé" },
  { brandName: "Amlodipine", dci: "Amlodipine", dosage: "5mg", form: "Comprimé" },
  { brandName: "Rivotril", dci: "Clonazépam", dosage: "2mg", form: "Comprimé" },
  { brandName: "Lexomil", dci: "Bromazépam", dosage: "6mg", form: "Comprimé" },
  { brandName: "Tadalafil", dci: "Tadalafil", dosage: "10mg", form: "Comprimé" },
  { brandName: "Azithromycine", dci: "Azithromycine", dosage: "500mg", form: "Comprimé" },
  { brandName: "Prednisone", dci: "Prednisone", dosage: "20mg", form: "Comprimé" },
  { brandName: "Ventoline", dci: "Salbutamol", dosage: "100µg", form: "Spray inhalateur" },
  { brandName: "Aspégic", dci: "Acide acétylsalicylique", dosage: "1000mg", form: "Poudre pour solution buvable" },
];

async function seed() {
  console.log("Seeding medicines...");

  // Clear existing data
  await db.delete(medicines);

  // Insert seed data
  for (const med of seedData) {
    await db.insert(medicines).values({
      brandName: med.brandName,
      dci: med.dci,
      dosage: med.dosage,
      form: med.form,
    });
  }

  console.log(`Seeded ${seedData.length} medicines successfully.`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
