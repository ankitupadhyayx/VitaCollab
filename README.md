# VitaCollab

Privacy-first healthcare collaboration SaaS where patients control access to medical records and hospitals collaborate through auditable, secure workflows.

## Security Docs`r`n`r`n$11. Leadership summary: [docs/security/SECURITY_POSTURE_SUMMARY.md](docs/security/SECURITY_POSTURE_SUMMARY.md)
$11. Engineering/compliance matrix: [docs/security/TECHNICAL_CONTROL_MATRIX.md](docs/security/TECHNICAL_CONTROL_MATRIX.md)
$11. Release checklist: [docs/security/SECURITY_EVIDENCE_CHECKLIST.md](docs/security/SECURITY_EVIDENCE_CHECKLIST.md)

### Security Release Gate

Before every production deployment, teams must complete:
$11. [docs/security/SECURITY_EVIDENCE_CHECKLIST.md](docs/security/SECURITY_EVIDENCE_CHECKLIST.md)
$11. Sign-offs from engineering, security, compliance, and release manager
$11. Evidence capture for auth, file access, share controls, and audit logging

## 1. Platform Summary

VitaCollab is a full-stack healthcare platform designed around three core principles:
$11. Patient ownership of health data.
$11. Consent-driven sharing between hospitals, doctors, and patients.
$11. Production-grade security and traceability for all sensitive operations.

The product supports secure record uploads, approval-based sharing, role-aware access control, and event-driven UX updates for operational visibility.

## 2. Architecture Overview

### 2.1 High-Level Topology

```text
+----------------------+          HTTPS / WSS          +---------------------------+
|   Next.js Frontend   |  <--------------------------> |  Backend API (Node/Express)|
|  App Router + React  |                               |  JWT + RBAC + Validation   |
+----------+-----------+                               +------------+--------------+
                     |                                                            |
                     |                                                            |
                     |                                                  +---------v----------+
                     |                                                  |   MongoDB (Primary)|
                     |                                                  |  Postgres (Optional)|
                     |                                                  +--------------------+
                     |
                     | (Email verification, notifications)
                     v
+---------------------------+
| SMTP / Transactional Mail |
+---------------------------+
```

### 2.2 Client-Server Request Flow`r`n`r`n$11. User action originates in UI component (App Router page or feature module).
$11. Service-layer client in frontend issues REST request with access token.
$11. Backend middleware performs:
     - token verification,
     - role/permission checks,
     - payload validation.
$11. Controller delegates business logic to service/repository layer.
$11. Persistence changes are committed and optional realtime events are emitted.
$11. Frontend reconciles response into UI state and cache.

### 2.3 API Interaction Model

The system follows a resource-oriented REST model:
$11. Auth and identity APIs.
$11. Record lifecycle APIs.
$11. Approval and sharing APIs.
$11. Admin/audit/control-plane APIs.

Contract behavior:
$11. JSON request/response schema.
$11. Deterministic error codes with machine-parseable messages.
$11. Role-aware route guards.
$11. Pagination/filter support for high-volume record tables.

### 2.4 Authentication Flow (JWT Lifecycle)

```text
[Login]
    -> Validate credentials
    -> Issue short-lived Access Token + longer-lived Refresh Token
    -> Persist refresh token fingerprint/hash server-side

[Authorized API Call]
    -> Client sends Bearer access token
    -> Backend verifies signature, expiry, claims, role

[Access Token Expired]
    -> Client hits refresh endpoint
    -> Backend validates refresh token and fingerprint/hash
    -> Rotate refresh token
    -> Issue new access token

[Mismatch/Compromise]
    -> Invalidate refresh session
    -> Force re-authentication
```

### 2.5 Data Flow: Upload -> Approval -> Sharing

```text
Hospital uploads file + metadata
    -> File stored through upload pipeline
    -> Record linked to patient timeline as pending
    -> Patient receives pending approval state
    -> Patient approves/rejects access
    -> Access policy is updated
    -> Shared parties can query authorized record set
    -> Audit trail logs actor, action, target, timestamp
```

## 3. Tech Stack

### Frontend`r`n`r`n$11. Next.js (App Router)
$11. React.js
$11. Tailwind CSS
$11. Lucide icons
$11. Feature-oriented UI modules and reusable component primitives

### Backend`r`n`r`n$11. Node.js + Express (active implementation)
$11. REST API architecture
$11. Modular service/repository layering
$11. Extensible API contract for future Spring Boot service adapters

### Data Layer`r`n`r`n$11. MongoDB as primary operational store (current)
$11. PostgreSQL support path for relational workloads/reporting adapters

### Auth and Access`r`n`r`n$11. JWT-based authentication (access + refresh model)
$11. Role-based access control
$11. Permission-guarded admin operations

### Additional Platform Capabilities`r`n`r`n$11. Email verification pipeline
$11. File upload and storage abstraction
$11. Dark-mode UI system
$11. Secure API communication over HTTPS

## 4. Repository and Folder Structure

```text
VitaCollab/
├── frontend/
│   ├── app/                  # App Router pages and route segments
│   ├── components/           # Reusable UI and layout primitives
│   ├── features/             # Domain-level frontend feature modules
│   ├── hooks/                # Shared React hooks
│   ├── lib/                  # Utilities, contracts, client helpers
│   ├── services/             # API clients and integration adapters
│   ├── styles/               # Global styles, tokens, themes
│   ├── types/                # Frontend type declarations
│   └── public/               # Static assets
├── backend/
│   ├── config/               # Runtime config and environment bindings
│   ├── constants/            # System constants (RBAC, enums)
│   ├── controllers/          # Route handlers and API orchestration
│   ├── middleware/           # Auth, validation, authorization middleware
│   ├── models/               # Persistence models/schemas
│   ├── repositories/         # Data access abstraction
│   ├── routes/               # API route registration
│   ├── services/             # Core business logic services
│   ├── realtime/             # WebSocket/event integration
│   ├── utils/                # Shared backend utility helpers
│   ├── uploads/              # Local upload fallback storage
│   ├── app.js                # Express app bootstrap
│   └── server.js             # HTTP server entrypoint
├── shared/                   # Cross-tier contracts/constants
├── docker-compose.yml        # Local container orchestration
└── README.md                 # This document
```

### Structure Rationale`r`n`r`n$11. `frontend/app` separates route-level concerns from component library concerns.
$11. `frontend/features` groups UI and transformations by business domain.
$11. `backend/controllers -> services -> repositories` enforces clear responsibility boundaries.
$11. `shared` reduces contract drift between frontend and backend.

## 5. Feature Set (Deep-Dive)

### 5.1 Secure Medical Record Upload`r`n`r`n$11. Hospital uploads include file payload plus metadata envelope.
$11. Upload pipeline validates file constraints and normalizes metadata.
$11. Record is written with ownership and visibility defaults.
$11. Initial status remains approval-gated for patient control.

### 5.2 Patient-Controlled Approval Workflow`r`n`r`n$11. Patients review pending uploads in timeline views.
$11. Approve/reject action updates access control policy.
$11. Policy transitions are persisted and auditable.
$11. Downstream access queries respect approved visibility boundaries.

### 5.3 Real-Time Collaboration Concept`r`n`r`n$11. Event channel publishes high-value state changes.
$11. Client subscribers update active views with minimal polling overhead.
$11. Event payload validation protects frontend from malformed broadcasts.
$11. Polling fallback model supports degraded network/socket environments.

### 5.4 Verification System`r`n`r`n$11. Email verification gates account trust establishment.
$11. Verification tokens have expiry and one-time usage semantics.
$11. User states transition from unverified to verified via explicit flow.

## 6. Security Implementation

### 6.1 JWT Authentication and Session Hardening`r`n`r`n$11. Signed access tokens with expiration-bound claims.
$11. Refresh token lifecycle with rotation to reduce replay window.
$11. Refresh fingerprint/hash checks to detect token mismatch.
$11. Forced re-authentication on suspicious refresh behavior.

### 6.2 Protected Routes and Backend Guards`r`n`r`n$11. Route middleware verifies token before controller execution.
$11. Role guard enforces minimum role requirements.
$11. Permission-level checks protect sensitive admin endpoints.
$11. Validation middleware rejects malformed requests early.

### 6.3 Data Protection Concepts`r`n`r`n$11. Encryption in transit (TLS/HTTPS).
$11. Sensitive operation logging for non-repudiation/auditability.
$11. Approval-first data sharing model to minimize unauthorized exposure.
$11. Upload handling constraints reduce unsafe file ingestion vectors.

### 6.4 Access Control Logic`r`n`r`n$11. Identity claim -> role mapping.
$11. Role -> permission matrix.
$11. Permission -> action/resource policy.
$11. Policy evaluation before read/write side effects.

## 7. API Design

### 7.1 Endpoint Style`r`n`r`n$11. REST resources with JSON payloads.
$11. Authentication via Bearer tokens.
$11. Uniform error envelope for frontend handling.

### 7.2 Example Endpoints

```http
POST /upload
GET  /records
POST /approve
```

### 7.3 Request and Response Shapes (Illustrative)

```json
{
    "patientId": "pat_123",
    "hospitalId": "hosp_45",
    "recordType": "lab-report",
    "file": "<multipart-binary>"
}
```

```json
{
    "success": true,
    "data": {
        "recordId": "rec_987",
        "status": "pending_approval"
    },
    "meta": {
        "timestamp": "2026-03-21T10:00:00.000Z"
    }
}
```

### 7.4 Approval Request Example

```json
{
    "recordId": "rec_987",
    "decision": "approved",
    "approvedBy": "user_abc"
}
```

## 8. Frontend Architecture

### 8.1 Component System`r`n`r`n$11. Layout primitives for app shell consistency.
$11. Reusable UI primitives (`Card`, `Button`, section patterns).
$11. Domain components under feature folders.

### 8.2 State Management Approach`r`n`r`n$11. Server-state through API service layer and query abstractions.
$11. Local UI state for interaction and optimistic transitions.
$11. Event-driven updates for near real-time synchronization.

### 8.3 Reuse and Composition`r`n`r`n$11. Shared intro/heading section component for informational pages.
$11. Reusable testimonials component with keyboard-accessible carousel controls.
$11. Consistent design tokens through Tailwind + utility conventions.

## 9. UI and UX System

### 9.1 Dark Mode`r`n`r`n$11. Dark variants for core UI primitives (`Card`, `Button`, sections).
$11. Contrast-aware text hierarchy for readability.
$11. Theming aligned with premium SaaS visual language.

### 9.2 Responsive Strategy`r`n`r`n$11. Mobile-first layout scaling using Tailwind breakpoints.
$11. Grid-to-stack transformations for dense content sections.
$11. Interaction-safe controls for touch and keyboard users.

### 9.3 Accessibility Considerations`r`n`r`n$11. Semantic headings and structured landmarks.
$11. Keyboard navigation support in interactive carousels.
$11. ARIA labels and live region announcements for assistive technology.
$11. Focus-visible states and predictable control behavior.

## 10. Deployment Strategy

### 10.1 Hosting Targets`r`n`r`n$11. Frontend: Vercel (Next.js optimized runtime)
$11. Backend: Render or Railway
$11. Domain and DNS: GoDaddy

### 10.2 CI/CD Workflow

```text
Developer Push -> GitHub -> Vercel Build Trigger -> Preview/Production Deploy
                                                                 |
                                                                 +-> Backend deploy pipeline (Render/Railway)
```

### 10.3 Environment Promotion`r`n`r`n$11. Local development with containerized dependencies.
$11. Staging-style previews via Git branch deployments.
$11. Production releases through main branch merge/push controls.

## 11. Environment Variables

Example structure only. Do not commit real secrets.

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Backend (`backend/.env`)

```bash
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/vitacollab
POSTGRES_URI=postgresql://user:password@localhost:5432/vitacollab

JWT_ACCESS_SECRET=replace_with_secure_value
JWT_REFRESH_SECRET=replace_with_secure_value
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=replace_with_user
SMTP_PASS=replace_with_password

UPLOAD_MAX_SIZE_MB=20
ALLOWED_ORIGINS=http://localhost:3000
```

## 12. Installation and Local Setup

### 12.1 Prerequisites`r`n`r`n$11. Node.js 18+ (or project-compatible LTS)
$11. npm 9+
$11. MongoDB instance (local or managed)
$11. Optional PostgreSQL instance for adapter/testing scenarios

### 12.2 Install

```bash
# from repository root`r`n`r`ncd backend && npm install
cd ../frontend && npm install
```

### 12.3 Configure Environment`r`n`r`n$11. Copy `backend/.env.example` to `backend/.env` and fill values.
$11. Copy `frontend/.env.local.example` to `frontend/.env.local` and fill values.

### 12.4 Run Locally

```bash
# terminal 1`r`n`r`ncd backend
npm run dev

# terminal 2`r`n`r`ncd frontend
npm run dev
```

### 12.5 Optional Docker Compose

```bash
docker compose up --build
```

## 13. Future Enhancements`r`n`r`n$11. AI-based fake complaint/anomaly detection pipeline.
$11. Analytics dashboard for patient and hospital operations.
$11. Deeper hospital integrations (HIS/EMR interoperability adapters).
$11. Expanded audit intelligence and risk scoring automation.

## 14. Challenges and Solutions

### 14.1 Secure File Uploads

Challenge:
Managing sensitive medical file uploads without weakening security posture.

Solution:
Validation-first upload pipeline, controlled storage abstraction, and approval-gated visibility.

### 14.2 Authentication State Management

Challenge:
Maintaining seamless UX while handling token expiry/rotation.

Solution:
Access/refresh split, refresh token rotation, and guarded retry path for protected API calls.

### 14.3 UI Consistency Across Rapid Feature Growth

Challenge:
Page-level inconsistencies as modules expanded quickly.

Solution:
Shared section primitives, reusable cards/buttons, and standardized spacing/theming tokens.

## 15. Screenshots

Placeholders:
$11. Landing page (light/dark)
$11. Patient timeline and approvals
$11. Admin control panel
$11. Pricing and careers pages
$11. Mobile responsive views

```text
[Screenshot Placeholder: docs/images/landing-dark.png]
[Screenshot Placeholder: docs/images/patient-approval-flow.png]
[Screenshot Placeholder: docs/images/admin-dashboard.png]
```

## 16. Author

Ankit Upadhyay

---

VitaCollab is being engineered as a practical, production-minded healthcare SaaS foundation with strong privacy guarantees, clear operational controls, and extensible architecture for future scale.
