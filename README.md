# Arcfield Systems — Student Management System (SMS)
### Auspify Technologies Full-Stack Internship · Task 2

An institutional academic records registry and student lifecycle management portal engineered with Arcfield Systems' zero-trust security standards, W3C accessibility compliance, and 60/120 FPS compositor motion standards.

---

## ⚡ Tech Stack & Architecture

- **Framework:** Next.js 16.4 (App Router with Turbopack, `proxy.ts` request gateway)
- **Language:** TypeScript 5.x
- **Typography:** Self-hosted **Chillax Variable** (display/brand headers) & **Inter Variable** (candidate profiles and system typography)
- **Styling:** Tailwind CSS (Institutional `zinc-950` / `zinc-50` multi-theme engine)
- **Database & ORM:** Prisma ORM 6.x connected to Supabase PostgreSQL 17 with Supavisor connection pooling (port 6543) and direct connection (port 5432)
- **Security & Compliance:** Database-level Row Level Security (RLS) role enforcement, FERPA immutable audit trigger, and CWE-306 / CWE-601 defenses
- **Authentication:** Supabase Auth with `@supabase/ssr` session management and cardless optical Edge Corner Frame design
- **Real-Time CDC:** Supabase Realtime WebSocket publication paired with TanStack Query v5 for live directory synchronization
- **Theme Engine:** `next-themes` (Dark, Light, and System modes with zero flash of unstyled content)
- **Icons:** `lucide-react`
- **Validation:** Zod schemas with `.strip()` boundary defense against mass-assignment
- **Rate Limiting:** Sliding-window IP rate limiter (60 reads/min, 20 mutations/min)
- **Export Engine:** Native RFC-4180 CSV generator with UTF-8 BOM (`\uFEFF`) and formula injection defense
- **Compositor Standards:** Zero reflow motion protocol mutating exclusively hardware-accelerated `transform` and `opacity`

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** 18.x or newer (Tested on Node.js v20+ / v26+)
- **Package Manager:** npm 10.x or newer

### 2. Installation & Setup
```bash
# Clone and enter the repository
git clone https://github.com/KwesiKorant/student-ms.git
cd student-ms

# Install dependencies (automatically runs postinstall: prisma generate)
npm install

# Configure environment variables (copy from .env.example)
cp .env.example .env
# Edit .env with your Supabase credentials (DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

# Push relational schema & seed with 20 diverse student records & audit logs
npm run db:setup
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The app launches directly into the **Glow Horizon Landing Page** (`/`). Access the institutional records management portal by clicking **"Explore Student Directory"** or visiting **[http://localhost:3000/registry](http://localhost:3000/registry)**.

---

## 📖 How to Use the Application

### 1. Application Routes & Entry
- **`/` (Root Landing Page):** Institutional hero presentation featuring Arcfield Systems brand horizon, real-time feature overview, and rapid entry points to both the directory and direct student enrollment.
- **`/registry` (Student Directory Portal):** Full academic records database, live census strip, search and filter toolbar, tabular registry, and modal inspector.

### 2. Directory Navigation & Census Strip
- **Header Live Census:** Real-time counters display **Active Students**, **Total Cohort Size**, and **Archived Count**.
- **Hero Header:** Displays instant division metrics and total registered student counts.
- **Table View:** Displays candidate records with initials avatars, STU-ID, full name, institutional email, department badge, academic year, tabular GPA badge, and enrollment status.

### 2. Keyboard Shortcuts (Power User Workflow)
- **`/` or `Cmd+K` / `Ctrl+K`**: Instantly jumps focus to the search bar and selects existing query text.
- **`Escape`**:
  - Blurs the search bar when focused.
  - Instantly dismisses any open modal or dialog ([StudentDetailModal], [EnrollStudentModal], [EditStudentModal], [ArchiveConfirmDialog]).
- **`Enter` or `Space`**: When keyboard-focusing a table row (`tabIndex={0}`), opens the candidate's detailed dossier.

### 3. Search & Filter Engine
- **Search Bar:** Real-time 250ms debounced multi-word matching across first name, last name, institutional email, and student ID (`STU-YYYY-XXXX`). Press the `X` icon or `Escape` to clear.
- **Department Dropdown:** Filter by institutional division (*Computer Science*, *Electrical Engineering*, *Mechanical Engineering*, *Business Administration*, *Biomedical Sciences*).
- **Status Dropdown:** Filter by enrollment state (*Active*, *Inactive*, *Suspended*, *Graduated*).
- **Archived Toggle Chip:** Click the `[•] Archived` chip to view soft-archived candidate profiles. The chip illuminates amber with a pulsing active badge.
- **Segmented Sort Control:** Select sorting attribute (*Date Enrolled*, *Full Name*, *Student ID*, *Department*, *GPA Score*, *Academic Year*) and toggle direction (`ASC` / `DESC`).
- **Active Filter Strip:** Filter badges display active query parameters with 1-click removal chips and a `"Reset all"` button.
- **Empty State Quick Recovery:** If search/filter criteria match 0 records, click `"Clear All Filters"` directly inside the empty state card to restore the directory.

### 4. Enrolling a Student
1. Click **`Enroll Student`** in the header or toolbar (or press `"Enroll New Student"` in empty states).
2. Complete the enrollment form:
   - **First & Last Name:** Candidate legal names.
   - **Institutional Email:** University-domain email (validated for uniqueness).
   - **Department:** Academic division.
   - **Academic Year:** Select between Year 1 and Year 6.
   - **Cumulative GPA:** Optional decimal between `0.00` and `4.00`.
   - **Student ID Option:**
     - *Default:* Leave blank to automatically generate institutional ID in `STU-YYYY-[HEX4]` format (e.g. `STU-2026-4F1A`).
     - *Manual Override:* Click the toggle to manually ingest a verified external identifier conforming to `STU-YYYY-XXXX`.
   - **Date of Birth & Phone:** Optional demographic attributes.
3. Click **`Enroll Student`**. The record is created, added optimistically to the active cohort, and logged in the audit trail.

### 5. Inspecting Dossiers & Audit Trails
1. Click any row or click the **Eye icon** (`Inspect Candidate`).
2. **Academic Profile Tab:**
   - 1-Click Copy Buttons: Click the copy icon next to **Student ID** or **Email Address** to copy to clipboard with instant checkmark feedback.
   - Highlights cards showing Division, Academic Standing, and GPA progress bar.
   - Demographic contact details (Email, Phone, Date of Birth, Enrolled Date).
3. **Audit History Tab:**
   - Chronological trail recording every administrative lifecycle event (`CREATE`, `UPDATE`, `ARCHIVE`, `RESTORE`).
   - Creation cards display initial enrollment parameters (Starting Status, Year, GPA).
   - Modification cards display before/after field diffs (`from → to`).

### 6. Editing a Student Record
1. Click the **Pencil icon** (`Edit Record`) on any student row or inside the candidate dossier.
2. Update information (Department, Academic Year, Status, GPA, Phone, etc.).
3. Click **`Save Changes`**. Updates persist to the database with field-level diffs logged to the audit trail.

### 7. Soft Archival vs. Permanent Hard Deletion
- **Soft Archival (Default):**
  1. Click the **Archive icon** on an active student.
  2. The confirmation dialog warns that the profile will be safely archived while preserving historical records and transcripts.
  3. Click **`Archive Student`**. The record is hidden from the default directory and preserved in the archival tier.
- **Restoring an Archived Record:**
  - Toggle `[•] Archived` in the toolbar, find the archived student, and click the **RotateCcw icon** (`Restore Record`) or click `"Restore Record"` inside their dossier.
- **Permanent Hard Deletion (Guarded):**
  1. In the archive dialog, check the destructive box: *"Switch to permanent hard deletion"*.
  2. Type the candidate's exact Student ID into the confirmation input.
  3. Click **`Permanently Delete`**. The record and cascading audit logs are physically purged from the database.

### 8. Administrative CSV Export
- Click the **Download icon** (`Export Registry CSV`) in the toolbar.
- The system queries up to 1,000 active filtered records and generates an RFC-4180 standard CSV file with UTF-8 BOM encoding (`\uFEFF`) formatted as `arcfield-student-registry-YYYY-MM-DD.csv` for seamless Excel / Google Sheets compatibility.

### 9. Theme Switching
- Click the **Sun / Moon icon** in the top navigation bar to toggle between **Light**, **Dark**, and **System** themes. Background surfaces adapt seamlessly between `zinc-50` and `zinc-950` with high contrast.

---

## 🛡️ Zero-Trust Security Architecture

1. **Boundary Sanitization:** All incoming mutations are parsed against strict Zod schemas with `.strip()` (`src/lib/validations/student.ts`), discarding unwhitelisted attributes and preventing mass assignment.
2. **Parameterized Persistence:** 100% of database queries execute through Prisma ORM parameterized statements (`src/lib/prisma.ts`), eliminating SQL injection vulnerabilities.
3. **In-Memory Sliding-Window Rate Limiting:** Protects API routes against denial-of-service and brute force flooding (60 reads/min, 20 mutations/min per client IP) returning HTTP `429 Too Many Requests` with a `Retry-After` header.
4. **Exception Masking:** Database runtime exceptions (`P2002`, `P2025`, `P2003`) are intercepted and transformed into sanitized domain responses (`409 Conflict`, `404 Not Found`). Internal database traces and table structures are never leaked.
5. **Defensive Security Headers:** Middleware injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and suppresses `X-Powered-By`.

---

## 🎯 Acceptance Criteria Conformance (AC-1 to AC-8)

| Criteria | Objective | Conformance & Implementation |
| :--- | :--- | :--- |
| **AC-1** | Student Record Creation | `POST /api/v1/students` creates student, assigns `STU-YYYY-[HEX4]`, logs CREATE audit record. |
| **AC-2** | Validation Bounds | Rejects invalid email formats, GPA < 0 or > 4, Year < 1 or > 6 with inline errors and `400 Bad Request`. |
| **AC-3** | Duplicate Conflict Handling | Submitting an existing email or duplicate manual Student ID returns `409 Conflict`. |
| **AC-4** | Real-Time Directory Search | 250ms debounced search matching name, email, or student ID without layout shift or UI freeze. |
| **AC-5** | Profile Inspection & Dossier | Detail modal displaying demographics, GPA gauge, and chronological audit trail with diffs. |
| **AC-6** | Record Modification | `PUT /api/v1/students/:id` computes field-level deltas, logs updates, and updates UI optimistically. |
| **AC-7** | Safe Soft Archival | `DELETE /api/v1/students/:id` soft-archives records (`isArchived: true`); preserves audit trail. |
| **AC-8** | Sliding-Window Rate Limiting | Rapid request flooding triggers HTTP `429 Too Many Requests` with `Retry-After` duration. |

---

## 🧪 Automated Test Suite

The repository includes a comprehensive standalone Node.js test suite ([tests/api.test.mjs](file:///Users/kay/Documents/student-ms/tests/api.test.mjs)) executing 56 automated assertions validating functional acceptance criteria and security barriers:

```bash
# Execute automated test suite
npm test
```

### Coverage Overview:
- `GET /api/v1/departments`: Verifies seeded divisions and response structures.
- `GET /api/v1/students`: Tests directory pagination, metadata limits, and record counts.
- `AC-4 Real-Time Search`: Tests single-token and multi-token candidate queries.
- `Department Sorting`: Validates relational sorting by department code.
- `Academic Year & GPA Tier Filters`: Validates parametric filtering bounds and Dean's List criteria.
- `AC-1 Auto-Enrollment`: Tests automatic STU-ID assignment and audit log generation.
- `FR-1.2 Manual Enrollment`: Validates manual ID ingestion and duplicate ID rejection (`409`).
- `AC-2 Bounds Validation`: Validates rejection of GPA > 4.0 and malformed emails (`400`).
- `AC-3 Conflict Handling`: Validates duplicate email conflict defense (`409`).
- `AC-5 Profile Inspection`: Validates candidate dossier retrieval and audit log inspection.
- `AC-6 Parity Mutation`: Validates record update and field diff calculation.
- `AC-7 Soft Archival & Restore`: Validates soft delete (`DELETE`) and restore (`POST /restore`).
- `Defensive Handling`: Validates malformed JSON payloads and invalid department foreign keys.
- `AC-8 Rate Limiting`: Floods mutation endpoint to confirm HTTP `429 Too Many Requests`.
- `CWE-306 Defense`: Asserts unauthenticated mutation attempts (`POST`, `PUT`, `DELETE`) are rejected with `401 Unauthorized`.
- `CWE-601 Defense`: Asserts open redirect attempts on auth callbacks are stripped.
- `Security Headers`: Asserts presence of `nosniff`, `DENY`, and absence of `X-Powered-By`.
- `Automated Teardown`: Automatically purges temporary test fixtures via hard-delete cleanup, leaving the database pristine.

---

## ☁️ Vercel Production Deployment

The application is engineered for zero-config production deployment on Vercel:

### 1. Vercel Project Setup
1. Import the repository **`KwesiKorant/student-ms`** into [Vercel](https://vercel.com/new).
2. Use standard Next.js preset:
   - **Framework:** Next.js
   - **Build Command:** `next build` (with `postinstall: prisma generate` automatically running)
   - **Output Directory:** `.next`

### 2. Environment Variables
Add the following 4 environment variables in **Project Settings → Environment Variables**:
- `DATABASE_URL`: Supabase connection pooler URL (port `6543`, `?pgbouncer=true`)
- `DIRECT_URL`: Direct PostgreSQL connection URL (port `5432`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (`https://<project-ref>.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous public client key

### 3. Supabase Auth Configuration
In your Supabase Dashboard under **Authentication → URL Configuration**, add your Vercel URL:
- **Site URL:** `https://<your-vercel-domain>.vercel.app`
- **Redirect URLs:** `https://<your-vercel-domain>.vercel.app/auth/callback`

---

## 🗄️ Database Management Scripts

```bash
# Setup: push Prisma schema to PostgreSQL and seed initial 20 students
npm run db:setup

# Seed: re-populate departments and students
npm run db:seed

# Reset: reset database schema and restore pristine 20-student cohort
npm run db:reset
```

---

## 📡 API Reference

### Student Endpoints
- `GET /api/v1/students`
  - **Query Params:** `search`, `departmentId`, `status`, `includeArchived`, `sortBy`, `sortOrder`, `page`, `limit`
  - **Response:** `{ success: true, data: Student[], pagination: { totalRecords, page, limit, totalPages } }`
- `POST /api/v1/students`
  - **Body:** `{ firstName, lastName, email, departmentId, academicYear, gpa?, studentId?, dateOfBirth?, phone?, status? }`
  - **Response:** `201 Created` with created student object.
- `GET /api/v1/students/:id`
  - **Response:** `200 OK` with student object including department relation and audit log trail.
- `PUT /api/v1/students/:id`
  - **Body:** `{ firstName?, lastName?, email?, departmentId?, academicYear?, gpa?, dateOfBirth?, phone?, status? }`
  - **Response:** `200 OK` with updated student object.
- `DELETE /api/v1/students/:id`
  - **Query Params:** `?hard=true` (optional, permanently purges record)
  - **Response:** `200 OK` with archived/deleted student status.
- `POST /api/v1/students/:id/restore`
  - **Response:** `200 OK` restoring student from archival tier to active directory.

### Department Endpoints
- `GET /api/v1/departments`
  - **Response:** `200 OK` with list of 5 academic departments.

---

## 🎨 Motion & Design Protocol

- **Compositor Standards:** Per-frame animations strictly mutate `transform: translate3d(...)`, `scale3d(...)`, and `opacity`. No box-model geometry reflow (`width`, `height`, `margin`, `padding`).
- **Tactile Micro-Interactions:** Buttons respond with `:active { transform: scale3d(0.97, 0.97, 1); }` using spring curves.
- **Portaled Tooltips:** Tooltips portal directly to `document.body` (`z-index: 9999`) to prevent parent clipping.
- **Accessibility:** Full `@media (prefers-reduced-motion: reduce)` fallbacks and W3C dialog compliance.

---

### Author
**Arcfield Systems** · Auspify Technologies Full-Stack Internship Task 2
All code committed, tested, and maintained under version control.
