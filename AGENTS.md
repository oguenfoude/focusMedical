# FocusClinic — Agent Instructions

Multi-tenant SaaS for medical clinics. Two roles: **Doctor** (consultations, prescriptions, settings, secretaries) and **Secretary** (patients, reservations, schedule).

## Critical: Things That Will Break Your Code

### 1. Supabase queries use DB column names, not Drizzle property names

When querying via `supabase.from("table").select().eq(...)`, you MUST use the actual PostgreSQL column name:

```typescript
// WRONG — "authUserId" is the Drizzle property name, not the DB column
.eq("authUserId", user.id)

// CORRECT — "auth_user_id" is the actual DB column
.eq("auth_user_id", user.id)
```

### 2. `proxy.ts` — NOT `middleware.ts`

Next.js 16 uses `proxy.ts` (not `middleware.ts`). The exported function must be named `proxy`. Do NOT rename this file.

### 3. Server actions return errors, never throw

All server actions in `lib/actions/*.ts` must return `{ error: "..." }` instead of `throw new Error(...)`. Throwing crashes the UI with Next.js error boundary. Every action uses this pattern:

```typescript
export async function createPatient(
  _prevState: { error: string } | { success: true },
  formData: FormData
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Unauthorized" };
  // ...
  return { success: true as const };
}
```

Exception: `saveConsultation` returns `{ success: true, consultationId: string }` — not just `{ success: true }`.

### 4. FK deletion is handled gracefully

`deletePatient`, `deleteReservation`, and `deleteConsultation` perform pre-deletion checks (count related rows) and return user-friendly errors instead of crashing. They also catch Postgres FK violation errors (code `23503`). If you add new FK relationships, update the corresponding delete function with a count check.

### 5. Form components need `useEffect` for auto-close

Every form dialog component must have this pattern to auto-close on success:

```typescript
useEffect(() => {
  if ("success" in state && state.success) {
    toast.success("Created");
    onOpenChange(false);
  }
}, [state, onOpenChange]);
```

### 6. Every query MUST filter by `clinicId`

Multi-tenancy is enforced at the application level. Every query that reads or writes data MUST include `.where(eq(table.clinicId, authUser.clinicId))`. Missing this leaks data across tenants. This includes:
- All SELECT queries (including pre-deletion count checks)
- All UPDATE queries
- All DELETE queries
- All INSERT queries (via `clinicId` in values)

### 7. Role checks in server actions

- Patient CRUD: both roles allowed
- Consultations + Ordonnances + Clinic settings + Secretaries + Medications + Transactions: doctor only
- Schedule: secretary only
- Reservations: **both roles** (no server-side role check — route protection via proxy.ts handles access)
- `searchMedications` and `searchMedicines`: both roles (used by consultation editor, which secretaries don't access but the action itself has no role gate)

### 8. Zod v4 — not v3

This project uses `"zod": "^4.4.3"`. Zod v4 has a different API from v3. Do not use v3 patterns.

### 9. `useActionState` — not `useFormState`

React 19 renamed `useFormState` to `useActionState`. All form actions use this hook.

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build — catches TS errors that dev may miss
npm run lint         # ESLint
npx drizzle-kit generate  # Generate migration SQL from schema changes
npx drizzle-kit migrate   # Run migrations (loads DIRECT_URL from .env.local via dotenv)
```

Always run `npm run build` before committing.

**⚠ Missing columns migration**: The initial migration (`0000`) created basic columns for `clinics`, `clinic_users`, `patients`, `reservations`, `consultations`, `ordonnances`, and `clinic_schedule`. The Drizzle schema (`lib/db/schema.ts`) was later updated with 14 additional columns and type fixes. **Migration `drizzle/0009_fix_missing_columns.sql`** adds all missing columns. Apply it via Supabase SQL Editor, then run `npx drizzle-kit migrate` to mark it as applied. If you see errors like "column X does not exist" on any table, this migration hasn't been applied yet.

## Database

- `DATABASE_URL` = pooled connection (port 6543) — for runtime queries
- `DIRECT_URL` = direct connection (port 5432) — for drizzle-kit migrations only
- `drizzle.config.ts` uses `DIRECT_URL`; `lib/db/client.ts` uses `DATABASE_URL`
- Schema is in `lib/db/schema.ts` — this is the single source of truth. Never edit via Supabase Dashboard.
- Driver is `postgres` npm package (not `pg`). Drizzle import is `drizzle-orm/postgres-js`.
- No `ON DELETE CASCADE` on any FK. Deleting a parent with children fails at DB level — handle cleanup manually.
- `patients.age` is `text` type, not integer. Can be a number string like `"30"` or a DOB string like `"01/01/2001"`. Zod validates both formats (numeric 0-150, or DD/MM/YYYY).
- `clinic_users.authUserId` is `text` type (not uuid). Stores the Supabase auth user ID.
- `clinic_users.fullName` is `text` type, NOT NULL. The doctor's or secretary's full name.
- `clinic_users.phone` is `text` type, nullable. Contact phone number.
- `clinic_users.specialty` is `text` type, nullable. Doctor's medical specialty (used in prescriptions).
- `clinic_users.ordreRegistrationNumber` is `text` type, nullable. Doctor's ordre registration number (used in prescriptions).
- `reservations.time` is `text` type, not `time`. Stores strings like `"09:00"`. Zod validates HH:MM (24h) format.
- `clinic_schedule` has a unique constraint on `(clinic_id, day_of_week)`. `dayOfWeek` is NOT NULL (0-6).
- `consultations.clinicUserId` is nullable uuid FK to `clinic_users.id`. Set on create by `saveConsultation` — never overwritten on edit. Used to identify which doctor authored a consultation.
- `clinics.specialty` column does NOT exist — it was removed. Do not reference it.
- `clinics.logoUrl` is `text` type, nullable. Stores base64 data URL of the clinic logo.
- `clinics.prescriptionTemplate` is `text` type, NOT NULL, default `"standard"`. Controls which PDF template is used for prescriptions. Valid values: `"standard"`, `"compact"`, `"elegant"`, `"minimal"`.
- `clinics.prePrintedTemplate` is `boolean`, NOT NULL, default `false`. Hides header/doctor info in prescriptions for pre-printed paper.
- `clinic_users.specialty` is `text` type, nullable. Doctor's medical specialty (used in prescriptions).
- `clinic_users.ordreRegistrationNumber` is `text` type, nullable. Doctor's ordre registration number (used in prescriptions).
- `patients.note` is `text` type, nullable. General notes about the patient.
- `patients.price` is `integer` type, nullable. Custom consultation price for the patient.
- `patients.isRegular` / `is_regular` is `boolean`, default false. Marks regular patients.
- `patients.priceNote` / `price_note` is `text` type, nullable. Notes about the patient's pricing.
- `medications` is per-clinic (has `clinicId` FK). Stores the doctor's frequently used medication catalog for quick insertion into prescriptions. NOT the same as `medicines` (global drug reference table without `clinicId`).
- `medicines` is a global drug reference table (no `clinicId`). Contains `brandName`, `dci`, `dosage`, `form`. Used by `searchMedicines` in the consultation editor.
- `transactions` records financial transactions (consultation payments, additional fees). Has `clinicId` FK, nullable `patientId` and `consultationId`.
- **drizzle-kit generate** requires an interactive terminal (TTY). If it fails with "Interactive prompts require a TTY terminal", you must run it manually from your terminal. The migration files in `drizzle/` are the source of truth for applied migrations.
- **drizzle-kit migrate** requires `DIRECT_URL` env var. `drizzle.config.ts` loads it from `.env.local` via `dotenv`.

## Auth Flow

1. `signUp` creates Supabase auth user + `clinics` row + `clinic_users` row
2. `signIn` authenticates via Supabase, queries `clinic_users` for role, redirects to `/doctor` or `/secretary`
3. `proxy.ts` protects `/secretary/*` and `/doctor/*` routes — checks session + role via `getAuthUser()`
4. `getAuthUser()` in `lib/auth/helpers.ts` resolves user → clinic → role via Drizzle query
5. `proxy.ts` creates its own Supabase client inline (does not import from `lib/supabase/server.ts` because the proxy layer doesn't have access to `next/headers` `cookies()`)

## Component Architecture

- Server components fetch data → pass to client wrapper components
- Client wrappers handle all interactivity (forms, delete, search)
- Pattern: `app/(portal)/secretary/patients/page.tsx` (server) → `components/patients-client.tsx` (client)
- Always use `revalidatePath()` after mutations — never `revalidateTag()`
- Shared utilities are in `lib/utils.ts`: `cn`, `computeAgeFromDob`, `isDobFormat`, `formatAgeDisplay`, `imageToBase64`
- **Prescription print**: `components/prescriptions/` contains the prescription system:
  - `PrescriptionPreview.tsx` — HTML/CSS live preview (used in editor), accepts `templateId` prop
  - `PrescriptionPDF.tsx` — PDF generation via `@react-pdf/renderer`, accepts `templateId` prop
  - `templates/standard.tsx` — Standard A5 prescription template + `PrescriptionData` interface
  - `templates/compact.tsx` — Compact A5 template (left-aligned header, bordered patient table)
  - `templates/elegant.tsx` — Elegant A5 template (double-divider header, shaded patient block)
  - `templates/minimal.tsx` — Minimal A5 template (split header, bullet-style prescriptions)
  - `index.tsx` — Template registry (exports all 4 templates)
  - `PrintPageClient.tsx` — Client component for print page with PDF download

## i18n

- **French-only** — no locale switcher, no `NEXT_LOCALE` cookie, no English dictionary
- Dictionary is always `fr.json`, fetched server-side via `getDictionary()` (no locale param)
- `dict` is typed as `Dictionary` from `lib/i18n/types.ts` — derived from `fr.json`
- Every client component that displays user-facing text must accept `dict` prop and use dict keys
- Currency is `DA` (Algerian Dinar) — use `dict.common.currency`
- Toast messages must also use dict keys (e.g., `dict.patients.toast.created`)
- **Prescription print labels**: Use `dict.ordonnances.printA5.*` keys for the A5 prescription print page and editor preview

## Settings Page

The settings page (`/doctor/settings`) has 4 sections:
1. **Clinic Config** — name, address, phone, logo (uses `updateClinic` action)
2. **Doctor Profile** — specialty, ordre registration number (uses `updateDoctorProfile` action)
3. **Prescription Template** — picker with 4 options: Standard, Compact, Elegant, Minimal. Live preview shows the selected template. Includes a **Pre-printed Template** toggle that hides header/doctor info for pre-printed paper. Selection is saved via `updateClinic` action (sets `clinics.prescription_template` and `clinics.pre_printed_template`).
4. **Security** — update email/password (uses `updateCredentials` action)

The selected template is used in:
- Consultation editor preview
- Print page (`/doctor/consultations/[id]/print`)
- PDF generation

## File Naming

- Drizzle property names: camelCase (`clinicId`, `authUserId`)
- DB column names: snake_case (`clinic_id`, `auth_user_id`)
- Supabase queries use snake_case; Drizzle queries use camelCase
