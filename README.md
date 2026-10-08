# Student Management System (SMS) — Auspify Task 2

An institutional academic records registry and student lifecycle portal engineered to fulfill **Auspify Technologies Full-Stack Internship Task 2 (Easy)** with Arcfield Systems' zero-trust security standards and 120 FPS compositor animation physics.

---

## ⚡ Tech Stack

- **Framework:** Next.js 15+ (App Router, Server & Client Components)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS (with canonical `zinc-950` / `zinc-50` multi-theme engine)
- **Database & ORM:** Prisma ORM with SQLite (`file:./dev.db`) for instant zero-config evaluation, seamless PostgreSQL production compatibility
- **Theme Engine:** `next-themes` (Light, Dark, and System modes with zero FOUC)
- **Icons:** `lucide-react`
- **Validation:** Zod schemas with `.strip()` boundary defense
- **Rate Limiting:** In-memory sliding-window IP rate limiter (60 reads/min, 20 mutations/min)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18.x or newer (Tested on Node.js v26.8.1)
- npm 10.x or newer

### 2. Installation & Database Setup
```bash
# Navigate to the project root
cd student-ms

# Install all dependencies
npm install

# Push relational schema to local SQLite database (dev.db)
npx prisma db push

# Populate with 20 realistic students, departments & audit logs
npx prisma db seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build Verification
```bash
npm run build
```

---

## 🛡️ Zero-Trust Security Architecture

1. **Boundary Sanitization:** All incoming requests are parsed against strict Zod schemas with `.strip()` (`src/lib/validations/student.ts`) to prevent mass assignment.
2. **Parameterized Persistence:** 100% of database interactions execute through Prisma ORM parameterized queries (`src/lib/prisma.ts`), eliminating SQL injection risks.
3. **In-Memory IP Rate Limiter:** Protects `/api/v1/` routes against flooding (60 reads/min, 20 mutations/min per IP) returning `429 Too Many Requests` with a `Retry-After` header.
4. **Exception Masking:** Database error codes (`P2002`, `P2025`, `P2003`) are mapped to clean domain responses (`409 Conflict`, `404 Not Found`). Internal database traces and table names are never leaked.
5. **Security Headers:** Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 🎯 Acceptance Criteria Conformance (AC-1 to AC-8)

| Criteria | Description | Validation |
| :--- | :--- | :--- |
| **AC-1** | Student Record Creation | `POST /api/v1/students` creates record, assigns `STU-YYYY-[HEX4]`, logs audit entry. |
| **AC-2** | Validation Bounds | Rejects invalid email or GPA < 0 or > 4 with inline errors and `400 Bad Request`. |
| **AC-3** | Conflict Handling | Submitting an existing email returns user-friendly `409 Conflict`. |
| **AC-4** | Real-Time Directory Search | 250ms debounced search matching name, email, or student ID without layout shift. |
| **AC-5** | Profile Inspection | Detailed modal displaying demographics, GPA gauge, and chronological audit trail. |
| **AC-6** | Parity Mutation | `PUT /api/v1/students/:id` computes diffs, logs updates, updates UI optimistically. |
| **AC-7** | Safe Archival | `DELETE /api/v1/students/:id` soft-archives records (`isArchived: true`); preserves audit trail. |
| **AC-8** | Rate Limiting | Rapid request flooding triggers HTTP `429 Too Many Requests`. |

---

## 🎨 Motion & Design Protocol

- **Compositor-Only Animations:** Animations strictly mutate `transform: translate3d(...)`, `scale3d(...)`, and `opacity`. No box-model geometry reflow (`width`, `height`, `margin`, `padding`).
- **Tactile Micro-Interactions:** Buttons respond with `:active { transform: scale3d(0.97, 0.97, 1); }` using spring curves.
- **Accessibility:** Full `@media (prefers-reduced-motion: reduce)` fallbacks.
