# VitaCollab

Privacy-first healthcare collaboration SaaS where patients control access to medical records and hospitals collaborate through auditable, secure workflows.

## 1. Platform Summary

VitaCollab is a full-stack healthcare platform designed around three core principles:

1. Patient ownership of health data.
2. Consent-driven sharing between hospitals, doctors, and patients.
3. Production-grade security and traceability for all sensitive operations.

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

### 2.2 Client-Server Request Flow

1. User action originates in UI component (App Router page or feature module).
2. Service-layer client in frontend issues REST request with access token.
3. Backend middleware performs:
     - token verification,
     - role/permission checks,
     - payload validation.
4. Controller delegates business logic to service/repository layer.
5. Persistence changes are committed and optional realtime events are emitted.
6. Frontend reconciles response into UI state and cache.

### 2.3 API Interaction Model

The system follows a resource-oriented REST model:

1. Auth and identity APIs.
2. Record lifecycle APIs.
3. Approval and sharing APIs.
4. Admin/audit/control-plane APIs.

Contract behavior:

1. JSON request/response schema.
2. Deterministic error codes with machine-parseable messages.
3. Role-aware route guards.
4. Pagination/filter support for high-volume record tables.

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

### Frontend

1. Next.js (App Router)
2. React.js
3. Tailwind CSS
4. Lucide icons
5. Feature-oriented UI modules and reusable component primitives

### Backend

1. Node.js + Express (active implementation)
2. REST API architecture
3. Modular service/repository layering
4. Extensible API contract for future Spring Boot service adapters

### Data Layer

1. MongoDB as primary operational store (current)
2. PostgreSQL support path for relational workloads/reporting adapters

### Auth and Access

1. JWT-based authentication (access + refresh model)
2. Role-based access control
3. Permission-guarded admin operations

### Additional Platform Capabilities

1. Email verification pipeline
2. File upload and storage abstraction
3. Dark-mode UI system
4. Secure API communication over HTTPS

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

### Structure Rationale

1. `frontend/app` separates route-level concerns from component library concerns.
2. `frontend/features` groups UI and transformations by business domain.
3. `backend/controllers -> services -> repositories` enforces clear responsibility boundaries.
4. `shared` reduces contract drift between frontend and backend.

## 5. Feature Set (Deep-Dive)

### 5.1 Secure Medical Record Upload

1. Hospital uploads include file payload plus metadata envelope.
2. Upload pipeline validates file constraints and normalizes metadata.
3. Record is written with ownership and visibility defaults.
4. Initial status remains approval-gated for patient control.

### 5.2 Patient-Controlled Approval Workflow

1. Patients review pending uploads in timeline views.
2. Approve/reject action updates access control policy.
3. Policy transitions are persisted and auditable.
4. Downstream access queries respect approved visibility boundaries.

### 5.3 Real-Time Collaboration Concept

1. Event channel publishes high-value state changes.
2. Client subscribers update active views with minimal polling overhead.
3. Event payload validation protects frontend from malformed broadcasts.
4. Polling fallback model supports degraded network/socket environments.

### 5.4 Verification System

1. Email verification gates account trust establishment.
2. Verification tokens have expiry and one-time usage semantics.
3. User states transition from unverified to verified via explicit flow.

## 6. Security Implementation

### 6.1 JWT Authentication and Session Hardening

1. Signed access tokens with expiration-bound claims.
2. Refresh token lifecycle with rotation to reduce replay window.
3. Refresh fingerprint/hash checks to detect token mismatch.
4. Forced re-authentication on suspicious refresh behavior.

### 6.2 Protected Routes and Backend Guards

1. Route middleware verifies token before controller execution.
2. Role guard enforces minimum role requirements.
3. Permission-level checks protect sensitive admin endpoints.
4. Validation middleware rejects malformed requests early.

### 6.3 Data Protection Concepts

1. Encryption in transit (TLS/HTTPS).
2. Sensitive operation logging for non-repudiation/auditability.
3. Approval-first data sharing model to minimize unauthorized exposure.
4. Upload handling constraints reduce unsafe file ingestion vectors.

### 6.4 Access Control Logic

1. Identity claim -> role mapping.
2. Role -> permission matrix.
3. Permission -> action/resource policy.
4. Policy evaluation before read/write side effects.

## 7. API Design

### 7.1 Endpoint Style

1. REST resources with JSON payloads.
2. Authentication via Bearer tokens.
3. Uniform error envelope for frontend handling.

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

### 8.1 Component System

1. Layout primitives for app shell consistency.
2. Reusable UI primitives (`Card`, `Button`, section patterns).
3. Domain components under feature folders.

### 8.2 State Management Approach

1. Server-state through API service layer and query abstractions.
2. Local UI state for interaction and optimistic transitions.
3. Event-driven updates for near real-time synchronization.

### 8.3 Reuse and Composition

1. Shared intro/heading section component for informational pages.
2. Reusable testimonials component with keyboard-accessible carousel controls.
3. Consistent design tokens through Tailwind + utility conventions.

## 9. UI and UX System

### 9.1 Dark Mode

1. Dark variants for core UI primitives (`Card`, `Button`, sections).
2. Contrast-aware text hierarchy for readability.
3. Theming aligned with premium SaaS visual language.

### 9.2 Responsive Strategy

1. Mobile-first layout scaling using Tailwind breakpoints.
2. Grid-to-stack transformations for dense content sections.
3. Interaction-safe controls for touch and keyboard users.

### 9.3 Accessibility Considerations

1. Semantic headings and structured landmarks.
2. Keyboard navigation support in interactive carousels.
3. ARIA labels and live region announcements for assistive technology.
4. Focus-visible states and predictable control behavior.

## 10. Deployment Strategy

### 10.1 Hosting Targets

1. Frontend: Vercel (Next.js optimized runtime)
2. Backend: Render or Railway
3. Domain and DNS: GoDaddy

### 10.2 CI/CD Workflow

```text
Developer Push -> GitHub -> Vercel Build Trigger -> Preview/Production Deploy
                                                                 |
                                                                 +-> Backend deploy pipeline (Render/Railway)
```

### 10.3 Environment Promotion

1. Local development with containerized dependencies.
2. Staging-style previews via Git branch deployments.
3. Production releases through main branch merge/push controls.

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

### 12.1 Prerequisites

1. Node.js 18+ (or project-compatible LTS)
2. npm 9+
3. MongoDB instance (local or managed)
4. Optional PostgreSQL instance for adapter/testing scenarios

### 12.2 Install

```bash
# from repository root
cd backend && npm install
cd ../frontend && npm install
```

### 12.3 Configure Environment

1. Copy `backend/.env.example` to `backend/.env` and fill values.
2. Copy `frontend/.env.local.example` to `frontend/.env.local` and fill values.

### 12.4 Run Locally

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

### 12.5 Optional Docker Compose

```bash
docker compose up --build
```

## 13. Future Enhancements

1. AI-based fake complaint/anomaly detection pipeline.
2. Analytics dashboard for patient and hospital operations.
3. Deeper hospital integrations (HIS/EMR interoperability adapters).
4. Expanded audit intelligence and risk scoring automation.

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

1. Landing page (light/dark)
2. Patient timeline and approvals
3. Admin control panel
4. Pricing and careers pages
5. Mobile responsive views

```text
[Screenshot Placeholder: docs/images/landing-dark.png]
[Screenshot Placeholder: docs/images/patient-approval-flow.png]
[Screenshot Placeholder: docs/images/admin-dashboard.png]
```

## 16. Author

Ankit Upadhyay

---

VitaCollab is being engineered as a practical, production-minded healthcare SaaS foundation with strong privacy guarantees, clear operational controls, and extensible architecture for future scale.
