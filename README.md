# VitaCollab

Production-oriented healthcare collaboration platform for secure record exchange, patient consent workflows, and real-time event-driven UX.

## Architecture Overview

- Frontend: Next.js App Router, React, TanStack Query, optimistic UI hooks, WebSocket adapter with polling fallback
- Backend: Express + MongoDB, JWT access/refresh auth, Zod validation middleware, role-based authorization
- Storage and media: Cloudinary-first upload flow with local fallback in development
- Observability: structured logger, Sentry-ready exception capture hooks (backend and frontend)

## Tech Decisions

- Real-time safety: all websocket events go through schema validators before processing
- Progressive resilience: socket layer falls back to polling seamlessly
- Security-first auth: refresh token rotation with mismatch invalidation
- Contract clarity: explicit event/payload contracts and QR token resolve APIs

## Auth Flow

```mermaid
flowchart TD
    A[User Login] --> B[Validate Credentials]
    B --> C[Issue Access Token + Refresh Token]
    C --> D[Set Refresh Cookie + Return Access Token]
    D --> E[Client API Calls with Access Token]
    E --> F{401?}
    F -- No --> G[Continue]
    F -- Yes --> H[Refresh Endpoint]
    H --> I{Refresh Hash Match?}
    I -- Yes --> J[Rotate Refresh Token + New Access Token]
    I -- No --> K[Invalidate Session + Force Re-login]
```

## Record Upload to Approval Flow

```mermaid
flowchart TD
    A[Hospital Uploads Record] --> B[Backend Stores Metadata + File]
    B --> C[Patient Timeline Shows Pending Record]
    C --> D[Patient Approves or Rejects]
    D --> E[Optimistic UI Update]
    E --> F[Decision API Persisted]
    F --> G[Audit Trail Updated]
    G --> H[Realtime approval:changed event]
```

## Realtime Event Flow

```mermaid
flowchart TD
    A[Backend Emits Event] --> B[WebSocket Adapter Receives Payload]
    B --> C[Client Payload Validator]
    C --> D{Valid Schema?}
    D -- Yes --> E[Dispatch to Subscribers]
    D -- No --> F[Drop Event + Log]
    E --> G[UI Optimistic/Query Cache Update]
    B --> H{Socket Down?}
    H -- Yes --> I[Fallback Pollers]
```
