# VitaCollab Team Operating Guide

Operational handbook for developers, designers, marketers, and product managers working on VitaCollab.

## 1. Project Overview

### What VitaCollab Is

VitaCollab is a privacy-first healthcare SaaS platform where patients control access to medical records while hospitals and providers collaborate through secure, auditable workflows.

### Current Stage

Early Access / Beta with production-oriented architecture and active feature iteration.

### Core Mission

1. Build patient-owned healthcare data workflows.
1. Enable secure, consent-driven collaboration between hospitals and patients.
1. Deliver a trustworthy, scalable healthcare product with strong engineering discipline.

## 2. Project Structure

Repository root contains major runtime units:

1. frontend
1. backend
1. shared
1. deployment files (docker-compose, environment examples, deployment notes)

### Frontend Structure

1. frontend/app

- Next.js App Router pages and route segments.
- Primary location for page-level UI and routing behavior.

1. frontend/components

- Reusable building blocks and domain-oriented component groups.

1. frontend/components/ui

- Primitive UI layer: buttons, cards, shared section patterns.
- Use this layer to enforce consistency and avoid duplicated styles.

1. frontend/lib

- Helpers, utility functions, contracts, and cross-feature utilities.

1. frontend/services

- API service clients and integration wrappers.

1. frontend/hooks

- Reusable React hooks for shared behaviors.

### Backend Structure

1. backend/controllers

- API controller logic and request orchestration.

1. backend/routes

- Route declarations and endpoint mapping.

1. backend/models

- Data schemas and persistence model definitions.

1. backend/middleware

- Authentication, authorization, validation, request guards.

1. backend/services

- Business logic layer.

1. backend/repositories

- Data access abstraction layer.

## 3. Where to Update What

Use this mapping to avoid changing the wrong layer.

1. UI changes

- Update frontend/components and route views under frontend/app.

1. New pages/routes

- Add new route segment under frontend/app/route-name/page.js.

1. API changes

- Update backend/routes and backend/controllers.
- If logic grows, move reusable parts into backend/services.

1. Database changes

- Update backend/models and related repository logic.
- Add migration/seed scripts if required.

1. Auth changes

- Update backend/middleware auth and authorization guards.
- Validate token flow impact across frontend service clients.

## 4. Development Workflow

### Standard Delivery Flow

1. Create a feature branch

- Naming convention: feature/scope-short-description.

1. Implement feature

- Keep changes scoped and layered (UI/API/DB).

1. Test locally

- Validate both frontend and backend behavior.
- Run lint/build/tests relevant to touched areas.

1. Push branch to GitHub

- Open PR with problem statement, changes, and test proof.

1. Deploy

- Frontend auto-deploy via Vercel.
- Backend deploy via Render/Railway pipeline.

### Recommended PR Checklist

1. Problem solved is clear.
1. No unrelated files changed.
1. API contracts documented.
1. Environment variables updated if needed.
1. Rollback approach identified for risky changes.
1. For release-bound changes, security evidence checklist scope is identified.

## 5. Feature Development Roadmap

### Phase 1: Core Stability

1. Fix UI inconsistencies and interaction bugs.
1. Improve dark mode contrast and component parity.
1. Standardize error handling and empty states.
1. Strengthen API validation and edge-case handling.

### Phase 2: User Features

1. Expand dashboard insights.
1. Improve record history and filtering.
1. Add robust notifications workflow.
1. Improve patient approval timeline clarity.

### Phase 3: Advanced Platform

1. AI integrations for intelligent assistance.
1. Analytics and operational observability dashboards.
1. Hospital API connectors/integration adapters.
1. Advanced admin controls and risk intelligence.

## 6. User Experience Improvements

Immediate UX backlog:

1. Expand testimonials and social proof blocks.
1. Continue landing page conversion improvements.
1. Add first-run onboarding flow and guided tooltips.
1. Improve skeleton/loading states across key views.
1. Add consistent success/failure feedback patterns.

## 7. Security and Performance

### Security Documentation Sources

Use these as the canonical security references:

1. docs/security/SECURITY_POSTURE_SUMMARY.md
1. docs/security/TECHNICAL_CONTROL_MATRIX.md
1. docs/security/SECURITY_EVIDENCE_CHECKLIST.md

### Security Priorities

1. Harden JWT lifecycle and token rotation policies.
1. Add route-level rate limiting.
1. Enforce request validation on all mutation endpoints.
1. Expand audit logging for critical actions.

### Performance Priorities

1. Add/verify DB indexes for frequent queries.
1. Optimize API response payload sizes.
1. Improve frontend bundle hygiene and lazy loading.
1. Add caching strategy for safe read-heavy endpoints.

## 8. Promotion and Growth Playbook

### SEO Foundation

1. Ensure metadata on all public pages.
1. Add sitemap and robots configuration.
1. Improve semantic structure and internal linking.
1. Add schema markup where applicable.

### Launch and Distribution Strategy

1. Social launch sequence (LinkedIn, Instagram, product demos).
1. Publish product explainers and use-case threads.
1. Use landing page CTAs aligned to one primary conversion goal.

### Growth Systems to Build

1. Waitlist system with segmented capture.
1. Email onboarding and lifecycle campaigns.
1. Landing page A/B tests for conversion uplift.
1. Partner onboarding kits for hospitals.

## 9. Deployment and Environment Operations

### Hosting Targets

1. Frontend: Vercel
1. Backend: Render (or Railway)
1. Domain: GoDaddy

### Environment Management

1. Keep separate development and production environment variables.
1. Never commit real secrets.
1. Use environment examples as templates.
1. Document any newly added variable in deployment notes.

### Runtime Separation

1. Dev: local backend + local frontend + local/managed DB.
1. Prod: managed backend/frontend with secure secrets and HTTPS-only endpoints.

### Release Security Gate (Mandatory)

Before each production deployment:

1. Complete docs/security/SECURITY_EVIDENCE_CHECKLIST.md.
1. Attach evidence links for tests, logs, and configuration checks.
1. Obtain sign-off from engineering, security, compliance, and release owner.
1. Block release if any required checklist item is FAIL.

## 10. Team Roles and Ownership

### Frontend Developer

1. UI implementation and UX consistency.
1. Route development and client-side state behavior.
1. Responsive and accessibility quality.

### Backend Developer

1. API design and controller/service logic.
1. Data model and query optimization.
1. Auth, validation, security enforcement.

### ML Engineer

1. AI feature prototyping and model integration.
1. Inference pipeline and quality monitoring.
1. Safe fallback behavior for model-dependent features.

### Designer

1. Design system refinement.
1. Interaction and visual hierarchy consistency.
1. Usability improvements and flow simplification.

### Marketing and Growth

1. SEO, content, and campaign execution.
1. Funnel analytics and conversion optimization.
1. Waitlist/email and social channel operations.

## 11. New Team Member: Getting Started Checklist

1. Clone repository.
1. Install dependencies for frontend and backend.
1. Configure environment variables from example files.
1. Run both apps locally and verify baseline startup.
1. Read roadmap section and pick a scoped issue.
1. Confirm acceptance criteria before coding.
1. Open PR with test evidence and change summary.

## 12. Coding Standards

### Engineering Rules

1. Prefer clean, readable, maintainable code over clever shortcuts.
1. Build reusable components before duplicating UI patterns.
1. Use clear naming aligned with business meaning.
1. Add concise comments only where intent is not obvious.
1. Keep business logic out of presentation components.
1. Validate and sanitize all external input.

### Pull Request Standards

1. Small, focused diffs.
1. Include rationale for architecture-impacting decisions.
1. Include local test/build verification notes.
1. Flag backward-incompatible changes explicitly.

## 13. Future Vision

VitaCollab long-term direction:

1. Become India’s leading patient-owned healthcare data platform.
1. Build a trusted ecosystem where patients control interoperable records.
1. Deliver AI-driven healthcare insights without compromising privacy.
1. Enable hospital-grade collaboration at national scale.

---

## Operating Principle

Build for trust first, scale second, and speed third.

In healthcare systems, correctness, security, and consent integrity are product features, not optional engineering concerns.
