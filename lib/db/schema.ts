import { pgTable, uuid, text, integer, timestamp, boolean, pgEnum, unique } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["doctor", "secretary"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["scheduled", "done", "cancelled"]);

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  visitePrice: integer("visite_price").notNull().default(2500),
  additionalPrice: integer("additional_price").notNull().default(1500),
  logoUrl: text("logo_url"),
  prescriptionTemplate: text("prescription_template").notNull().default("standard"),
  prePrintedTemplate: boolean("pre_printed_template").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clinicUsers = pgTable("clinic_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  authUserId: text("auth_user_id").notNull(),
  role: userRoleEnum("role").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  specialty: text("specialty"),
  ordreRegistrationNumber: text("ordre_registration_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  fullName: text("full_name").notNull(),
  age: text("age"),
  gender: text("gender"),
  bloodType: text("blood_type"),
  phoneNumber: text("phone_number"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  note: text("note"),
  weightKg: integer("weight_kg"),
  heightCm: integer("height_cm"),
  price: integer("price"),
  isRegular: boolean("is_regular").default(false),
  priceNote: text("price_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  date: timestamp("date").notNull(),
  time: text("time"),
  type: text("type").notNull().default("consultation"),
  status: reservationStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  reservationId: uuid("reservation_id")
    .references(() => reservations.id),
  clinicUserId: uuid("clinic_user_id")
    .references(() => clinicUsers.id),
  date: timestamp("date").notNull(),
  descriptionMalade: text("description_malade"),
  rapport: text("rapport"),
  diagnostique: text("diagnostique"),
  vitalSigns: text("vital_signs"),
  priceItems: text("price_items"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ordonnances = pgTable("ordonnances", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  consultationId: uuid("consultation_id")
    .notNull()
    .references(() => consultations.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ([
  unique("ordonnances_consultation_id_unique").on(table.consultationId),
]));

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  patientId: uuid("patient_id")
    .references(() => patients.id),
  consultationId: uuid("consultation_id")
    .references(() => consultations.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clinicSchedule = pgTable("clinic_schedule", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  dayOfWeek: integer("day_of_week").notNull(),
  isDayOff: boolean("day_off").notNull().default(false),
}, (table) => ([
  unique("clinic_schedule_clinic_day_unique").on(table.clinicId, table.dayOfWeek),
]));

export const medicines = pgTable("medicines", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandName: text("brand_name").notNull(),
  dci: text("dci"),
  dosage: text("dosage"),
  form: text("form"),
  manufacturer: text("manufacturer"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  name: text("name").notNull(),
  defaultDosage: text("default_dosage"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
