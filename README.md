# FocusClinic

Multi-tenant SaaS for medical clinics. Two roles: **Doctor** (consultations, prescriptions, settings, secretaries) and **Secretary** (patients, reservations, schedule).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19.2.4, shadcn/ui (base-nova style), Tailwind CSS v4 |
| Database | PostgreSQL via Supabase (pooled port 6543, direct port 5432) |
| ORM | Drizzle ORM 0.45.2, postgres.js driver |
| Auth | Supabase Auth (SSR via `@supabase/ssr`) |
| Validation | Zod v4 (not v3) |
| PDF | `@react-pdf/renderer` |
| Icons | Lucide React |
| Toasts | Sonner |
| i18n | French-only (`fr.json` hardcoded) |

## Features

### Doctor Portal (`/doctor`)
- **Dashboard** — stat cards: total patients, consultations, prescriptions, scheduled reservations, today's income
- **Patients** — list with search/pagination, click to view patient history
- **Patient History** — info card (name, age, phone, weight, height, notes) + unified timeline (reservations + consultations + transactions merged, status filter: All/Scheduled/Done/Cancelled, newest first)
- **Reservations** — DataTable with status filter tabs (with counts), actions: start consultation, edit, cancel, delete
- **Consultations** — two-panel editor (form + live A5 prescription preview), linked to reservation or standalone, tracks authoring doctor, medications catalog picker for quick prescription insertion
- **Prescriptions** — PDF generation via `@react-pdf/renderer`, 4 A5 templates (Standard, Compact, Elegant, Minimal), selectable in Settings, download from editor or print page
- **Medications** — per-clinic catalog of frequently used medications (name, default dosage, note), searchable from consultation editor for quick insertion into prescriptions
- **Finances** — transaction history with summary cards (this month, all time), record payments linked to patients/consultations
- **Secretaries** — CRUD for secretary accounts (creates Supabase auth user + DB row)
- **Settings** — 4 sections: clinic config (name, address, phone, logo), doctor profile (specialty, ordre registration number), prescription template picker (Standard/Compact/Elegant/Minimal with live preview + pre-printed template toggle), security (update email/password)

### Secretary Portal (`/secretary`)
- **Dashboard** — stat cards: total patients, scheduled reservations, total reservations, today's income
- **Patients** — list with search/pagination, create/edit/delete
- **Reservations** — DataTable with status filter tabs, create/edit/cancel/delete
- **Schedule** — weekly schedule toggle (open/day off per day)

### Auth
- **Signup** — two-step: personal info → clinic details (optional logo upload)
- **Login** — email + password, redirects based on role
- **Password Reset** — email → `/update-password` link
- **Route Protection** — `proxy.ts` enforces session + role-based access

### i18n
- French-only — no locale switcher, no English dictionary
- Dictionary fetched server-side, passed as `dict` prop
- Every client component that displays user-facing text must accept `dict` prop

## Database Schema

All tables live in `lib/db/schema.ts`. No `ON DELETE CASCADE` on any FK.

### `clinics`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `address` | text | |
| `phone` | text | |
| `visite_price` | integer | default 2500 |
| `additional_price` | integer | default 1500 |
| `logo_url` | text | base64 data URL |
| `prescription_template` | text NOT NULL | default `"standard"`. Values: `"standard"`, `"compact"`, `"elegant"`, `"minimal"` |
| `pre_printed_template` | boolean NOT NULL | default false. Hides header/doctor info for pre-printed paper |
| `created_at` | timestamp | |

### `clinic_users`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `auth_user_id` | text NOT NULL | Supabase auth user ID |
| `role` | enum NOT NULL | `"doctor"` or `"secretary"` |
| `full_name` | text NOT NULL | |
| `phone` | text | |
| `specialty` | text | Doctor's medical specialty |
| `ordre_registration_number` | text | Doctor's ordre registration number |
| `created_at` | timestamp | |

### `patients`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `full_name` | text NOT NULL | |
| `age` | text | number string `"30"` or DOB `"01/01/2001"` |
| `gender` | text | `"male"` or `"female"` |
| `phone_number` | text | |
| `note` | text | |
| `weight_kg` | integer | |
| `height_cm` | integer | |
| `price` | integer | |
| `is_regular` | boolean | default false |
| `price_note` | text | |
| `created_at` | timestamp | |

### `reservations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `patient_id` | uuid FK → patients | |
| `date` | timestamp NOT NULL | |
| `time` | text | stores `"HH:MM"` string |
| `status` | enum NOT NULL | `"scheduled"` (default), `"done"`, `"cancelled"` |
| `created_at` | timestamp | |

### `consultations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `patient_id` | uuid FK → patients | |
| `reservation_id` | uuid FK → reservations | nullable |
| `clinic_user_id` | uuid FK → clinic_users | nullable, set on create |
| `date` | timestamp NOT NULL | |
| `description_malade` | text | |
| `rapport` | text | |
| `diagnostique` | text | |
| `price_items` | text | |
| `created_at` | timestamp | |

### `ordonnances`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `consultation_id` | uuid FK → consultations | UNIQUE (1:1) |
| `content` | text NOT NULL | |
| `created_at` | timestamp | |

### `clinic_schedule`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `day_of_week` | integer NOT NULL | 0 (Sun) – 6 (Sat) |
| `is_day_off` | boolean NOT NULL | default false |

Unique constraint: `(clinic_id, day_of_week)`.

### `medicines`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `brand_name` | text NOT NULL | brand/trade name |
| `dci` | text | DCI (international nonproprietary name) |
| `dosage` | text | e.g. "500mg" |
| `form` | text | e.g. "comprime", "sirop" |

Global drug reference table (no `clinicId`). Used by `searchMedicines` in the consultation editor.

### `transactions`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | |
| `patient_id` | uuid FK → patients | nullable |
| `consultation_id` | uuid FK → consultations | nullable |
| `type` | text NOT NULL | |
| `amount` | integer NOT NULL | |
| `note` | text | |
| `created_at` | timestamp | |

### `medications`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid FK → clinics | per-clinic catalog |
| `name` | text NOT NULL | drug name |
| `default_dosage` | text | suggested dosage/instruction |
| `note` | text | additional notes |
| `created_at` | timestamp | |

## Project Structure

```
app/
├── (auth)/                    # Auth route group
│   ├── layout.tsx             # Split-screen layout (branding + form)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── reset-password/page.tsx
│   └── update-password/page.tsx
├── (portal)/                  # Authenticated portal
│   ├── layout.tsx             # PortalShell wrapper (sidebar + content)
│   ├── doctor/                # Doctor-only pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── patients/          # Patient list + history
│   │   ├── reservations/      # Reservations list
│   │   ├── consultations/     # Consultation editor + print
│   │   ├── medications/       # Per-clinic medication catalog
│   │   ├── finances/          # Transaction history + summary
│   │   ├── secretaries/       # Secretary management
│   │   └── settings/          # Clinic config + security
│   └── secretary/             # Secretary-only pages
│       ├── page.tsx           # Dashboard
│       ├── patients/          # Patient list
│       ├── reservations/      # Reservations list
│       └── schedule/          # Weekly schedule
├── layout.tsx                 # Root layout (Inter font, Toaster)
├── page.tsx                   # Landing page (redirects to dashboard if authenticated)
├── error.tsx                  # Error boundary
├── not-found.tsx              # 404 page
├── icon.svg                   # App icon
└── globals.css                # Tailwind v4 + glass utilities

components/
├── ui/                        # Shadcn base-nova primitives (10 files)
├── forms/                     # Form dialogs (8 files)
├── prescriptions/             # Prescription system (8 files)
│   ├── index.tsx              # Template registry (standard, compact, elegant, minimal)
│   ├── PrescriptionPreview.tsx
│   ├── PrescriptionPDF.tsx
│   ├── PrintPageClient.tsx
│   └── templates/
│       ├── standard.tsx       # Standard template + PrescriptionData interface
│       ├── compact.tsx        # Compact template
│       ├── elegant.tsx        # Elegant template
│       └── minimal.tsx        # Minimal template
├── consultation-editor.tsx    # Two-panel consultation editor
├── data-table.tsx             # Generic DataTable (search, pagination, mobile cards)
├── delete-dialog.tsx          # Reusable confirm dialog
├── patient-history-client.tsx # Patient detail + unified timeline
├── patients-client.tsx        # Patient list
├── medications-client.tsx     # Medication catalog list
├── finances-client.tsx        # Transaction history + summary
├── doctor-reservations-client.tsx
├── reservations-client.tsx    # Secretary reservations
├── secretaries-client.tsx     # Secretary CRUD
├── settings-client.tsx        # Clinic config + security
├── schedule-client.tsx        # Weekly schedule
├── nav-sidebar.tsx            # Collapsible sidebar
├── portal-shell.tsx           # Portal layout wrapper
├── logo.tsx                   # Logo component
├── mobile-header.tsx          # Mobile header
└── skeletons.tsx              # Loading skeletons

lib/
├── actions/                   # Server actions (22 total)
│   ├── clinic.ts              # updateClinic, updateDoctorProfile
│   ├── consultations.ts       # saveConsultation, deleteConsultation
│   ├── medications.ts         # createMedication, updateMedication, deleteMedication, searchMedications
│   ├── medicines.ts           # searchMedicines (global drug reference)
│   ├── transactions.ts        # createTransaction, deleteTransaction, getTransactionsSummary
│   ├── patients.ts            # createPatient, updatePatient, deletePatient
│   ├── reservations.ts        # createReservation, updateReservation, cancelReservation, deleteReservation
│   ├── schedule.ts            # setDayOff
│   └── secretaries.ts         # saveSecretary, deleteSecretary
├── auth/
│   ├── actions.ts             # signIn, signUp, signOut, resetPassword, updatePassword, updateCredentials
│   └── helpers.ts             # getAuthUser() — resolves auth → clinic → role
├── db/
│   ├── client.ts              # Drizzle ORM client (postgres.js driver)
│   └── schema.ts              # All table definitions
├── i18n/
│   ├── config.ts              # Locales: ["fr"] (French-only)
│   ├── get-dictionary.ts      # Imports fr.json directly (no locale param)
│   ├── types.ts               # Dictionary type (derived from fr.json)
│   └── dictionaries/
│       └── fr.json            # French dictionary (single source of truth)
├── supabase/
│   └── server.ts              # Supabase SSR client
└── utils.ts                   # cn(), computeAgeFromDob(), isDobFormat(), formatAgeDisplay(), imageToBase64()

drizzle/                       # Migration files + snapshots
proxy.ts                       # Next.js 16 proxy (route protection)
```

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/signup` | Public | Two-step signup (personal → clinic) |
| `/reset-password` | Public | Request password reset |
| `/update-password` | Public | Set new password |
| `/doctor` | Doctor | Dashboard (5 stat cards) |
| `/doctor/patients` | Doctor | Patient list |
| `/doctor/patients/[id]` | Doctor | Patient history + unified timeline |
| `/doctor/reservations` | Doctor | Reservations (status filter, start consultation) |
| `/doctor/consultations/new` | Doctor | New consultation editor |
| `/doctor/consultations/[id]/edit` | Doctor | Edit consultation |
| `/doctor/consultations/[id]/print` | Doctor | Print prescription (A5 PDF) |
| `/doctor/medications` | Doctor | Per-clinic medication catalog |
| `/doctor/finances` | Doctor | Transaction history + summary |
| `/doctor/secretaries` | Doctor | Manage secretaries |
| `/doctor/settings` | Doctor | Clinic config + security |
| `/secretary` | Secretary | Dashboard (3 stat cards) |
| `/secretary/patients` | Secretary | Patient list |
| `/secretary/reservations` | Secretary | Reservations (status filter) |
| `/secretary/schedule` | Secretary | Weekly schedule |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (Postgres, Auth enabled)
- PostgreSQL connection (pooled + direct)

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# DATABASE_URL=...        (pooled, port 6543)
# DIRECT_URL=...          (direct, port 5432)
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Generate and run migrations
npx drizzle-kit generate   # requires interactive terminal (TTY)
npx drizzle-kit migrate    # needs DIRECT_URL env var

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

Always run `npm run build` before committing.

## Architecture Patterns

### Multi-Tenancy
Every query filters by `authUser.clinicId`. Missing this filter leaks data across tenants.

```typescript
// Every query MUST include this
.where(eq(table.clinicId, authUser.clinicId))
```

### Role Checks in Server Actions

- Patient CRUD: both roles allowed
- Consultations + Ordonnances + Clinic settings + Secretaries + Medications + Transactions: doctor only
- Schedule: secretary only
- Reservations: **both roles** (no server-side role check — route protection via proxy.ts handles access)

### Server Actions
All actions return `{ error: "..." }` instead of throwing. Exception: `saveConsultation` returns `{ success: true, consultationId }`.

### Form Pattern
All form dialogs use `useActionState` (React 19) with auto-close on success:

```typescript
useEffect(() => {
  if ("success" in state && state.success) {
    toast.success("...");
    onOpenChange(false);
  }
}, [state, onOpenChange]);
```

### Component Architecture
Server components fetch data → pass to client wrappers. Client components handle all interactivity.

```
page.tsx (server) → *-client.tsx (client)
```

### FK Deletion Handling
`deletePatient`, `deleteReservation`, `deleteConsultation` perform pre-deletion checks (count related rows) and return user-friendly errors. They also catch Postgres FK violation errors (code `23503`).

### Supabase Queries
When using `supabase.from("table").select().eq(...)`, use **DB column names** (snake_case), not Drizzle property names (camelCase):

```typescript
// WRONG
.eq("authUserId", user.id)

// CORRECT
.eq("auth_user_id", user.id)
```

### proxy.ts
Next.js 16 uses `proxy.ts` (not `middleware.ts`). The exported function must be named `proxy`.

### Zod
This project uses **Zod v4** (`"zod": "^4.4.3"`). Do not use v3 patterns.

### i18n
- **French-only** — no locale switcher, no `NEXT_LOCALE` cookie, no English dictionary
- Dictionary is always `fr.json`, fetched server-side via `getDictionary()` (no locale param)
- `dict` is typed as `Dictionary` from `lib/i18n/types.ts` — derived from `fr.json`
- Every client component that displays user-facing text must accept `dict` prop and use dict keys

## Security

- **Route Protection**: `proxy.ts` intercepts unauthenticated users and enforces role-based access
- **Multi-Tenancy**: Application-level `clinicId` filtering on every query
- **Server Actions**: All mutations authenticated via `getAuthUser()`
- **No DB Secrets**: Service role key only used server-side for admin operations

## License

Proprietary / Closed Source.
