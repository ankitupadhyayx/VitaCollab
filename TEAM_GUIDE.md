# VitaCollab Team Operating Guide

Operational handbook for developers, designers, marketers, and product managers working on VitaCollab.

## 1. Project Overview

### What VitaCollab Is
VitaCollab is a privacy-first healthcare SaaS platform where patients control access to medical records while hospitals and providers collaborate through secure, auditable workflows.

### Current Stage
Early Access / Beta with production-oriented architecture and active feature iteration.

### Core Mission
1. Build patient-owned healthcare data workflows.
2. Enable secure, consent-driven collaboration between hospitals and patients.
3. Deliver a trustworthy, scalable healthcare product with strong engineering discipline.

## 2. Project Structure

Repository root contains major runtime units:

1. frontend
2. backend
3. shared
4. deployment files (docker-compose, environment examples, deployment notes)

### Frontend Structure

1. frontend/app
- Next.js App Router pages and route segments.
- Primary location for page-level UI and routing behavior.

2. frontend/components
- Reusable building blocks and domain-oriented component groups.

3. frontend/components/ui
- Primitive UI layer: buttons, cards, shared section patterns.
- Use this layer to enforce consistency and avoid duplicated styles.

4. frontend/lib
- Helpers, utility functions, contracts, and cross-feature utilities.

5. frontend/services
- API service clients and integration wrappers.

6. frontend/hooks
- Reusable React hooks for shared behaviors.

### Backend Structure

1. backend/controllers
- API controller logic and request orchestration.

2. backend/routes
- Route declarations and endpoint mapping.

3. backend/models
- Data schemas and persistence model definitions.

4. backend/middleware
- Authentication, authorization, validation, request guards.

5. backend/services
- Business logic layer.

6. backend/repositories
- Data access abstraction layer.

## 3. Where to Update What

Use this mapping to avoid changing the wrong layer.

1. UI changes
- Update frontend/components and route views under frontend/app.

2. New pages/routes
- Add new route segment under frontend/app/<route>/page.js.

3. API changes
- Update backend/routes and backend/controllers.
- If logic grows, move reusable parts into backend/services.

4. Database changes
- Update backend/models and related repository logic.
- Add migration/seed scripts if required.

5. Auth changes
- Update backend/middleware auth and authorization guards.
- Validate token flow impact across frontend service clients.

## 4. Development Workflow

### Standard Delivery Flow

1. Create a feature branch
- Naming convention: feature/<scope>-<short-description>.

2. Implement feature
- Keep changes scoped and layered (UI/API/DB).

3. Test locally
- Validate both frontend and backend behavior.
- Run lint/build/tests relevant to touched areas.

4. Push branch to GitHub
- Open PR with problem statement, changes, and test proof.

5. Deploy
- Frontend auto-deploy via Vercel.
- Backend deploy via Render/Railway pipeline.

### Recommended PR Checklist

1. Problem solved is clear.
2. No unrelated files changed.
3. API contracts documented.
4. Environment variables updated if needed.
5. Rollback approach identified for risky changes.

## 5. Feature Development Roadmap

### Phase 1: Core Stability

1. Fix UI inconsistencies and interaction bugs.
2. Improve dark mode contrast and component parity.
3. Standardize error handling and empty states.
4. Strengthen API validation and edge-case handling.

### Phase 2: User Features

1. Expand dashboard insights.
2. Improve record history and filtering.
3. Add robust notifications workflow.
4. Improve patient approval timeline clarity.

### Phase 3: Advanced Platform

1. AI integrations for intelligent assistance.
2. Analytics and operational observability dashboards.
3. Hospital API connectors/integration adapters.
4. Advanced admin controls and risk intelligence.

## 6. User Experience Improvements

Immediate UX backlog:

1. Expand testimonials and social proof blocks.
2. Continue landing page conversion improvements.
3. Add first-run onboarding flow and guided tooltips.
4. Improve skeleton/loading states across key views.
5. Add consistent success/failure feedback patterns.

## 7. Security and Performance

### Security Priorities

1. Harden JWT lifecycle and token rotation policies.
2. Add route-level rate limiting.
3. Enforce request validation on all mutation endpoints.
4. Expand audit logging for critical actions.

### Performance Priorities

1. Add/verify DB indexes for frequent queries.
2. Optimize API response payload sizes.
3. Improve frontend bundle hygiene and lazy loading.
4. Add caching strategy for safe read-heavy endpoints.

## 8. Promotion and Growth Playbook

### SEO Foundation

1. Ensure metadata on all public pages.
2. Add sitemap and robots configuration.
3. Improve semantic structure and internal linking.
4. Add schema markup where applicable.

### Launch and Distribution Strategy

1. Social launch sequence (LinkedIn, Instagram, product demos).
2. Publish product explainers and use-case threads.
3. Use landing page CTAs aligned to one primary conversion goal.

### Growth Systems to Build

1. Waitlist system with segmented capture.
2. Email onboarding and lifecycle campaigns.
3. Landing page A/B tests for conversion uplift.
4. Partner onboarding kits for hospitals.

## 9. Deployment and Environment Operations

### Hosting Targets

1. Frontend: Vercel
2. Backend: Render (or Railway)
3. Domain: GoDaddy

### Environment Management

1. Keep separate development and production environment variables.
2. Never commit real secrets.
3. Use environment examples as templates.
4. Document any newly added variable in deployment notes.

### Runtime Separation

1. Dev: local backend + local frontend + local/managed DB.
2. Prod: managed backend/frontend with secure secrets and HTTPS-only endpoints.

## 10. Team Roles and Ownership

### Frontend Developer

1. UI implementation and UX consistency.
2. Route development and client-side state behavior.
3. Responsive and accessibility quality.

### Backend Developer

1. API design and controller/service logic.
2. Data model and query optimization.
3. Auth, validation, security enforcement.

### ML Engineer

1. AI feature prototyping and model integration.
2. Inference pipeline and quality monitoring.
3. Safe fallback behavior for model-dependent features.

### Designer

1. Design system refinement.
2. Interaction and visual hierarchy consistency.
3. Usability improvements and flow simplification.

### Marketing and Growth

1. SEO, content, and campaign execution.
2. Funnel analytics and conversion optimization.
3. Waitlist/email and social channel operations.

## 11. New Team Member: Getting Started Checklist

1. Clone repository.
2. Install dependencies for frontend and backend.
3. Configure environment variables from example files.
4. Run both apps locally and verify baseline startup.
5. Read roadmap section and pick a scoped issue.
6. Confirm acceptance criteria before coding.
7. Open PR with test evidence and change summary.

## 12. Coding Standards

### Engineering Rules

1. Prefer clean, readable, maintainable code over clever shortcuts.
2. Build reusable components before duplicating UI patterns.
3. Use clear naming aligned with business meaning.
4. Add concise comments only where intent is not obvious.
5. Keep business logic out of presentation components.
6. Validate and sanitize all external input.

### Pull Request Standards

1. Small, focused diffs.
2. Include rationale for architecture-impacting decisions.
3. Include local test/build verification notes.
4. Flag backward-incompatible changes explicitly.

## 13. Future Vision

VitaCollab long-term direction:

1. Become India’s leading patient-owned healthcare data platform.
2. Build a trusted ecosystem where patients control interoperable records.
3. Deliver AI-driven healthcare insights without compromising privacy.
4. Enable hospital-grade collaboration at national scale.

---

## Operating Principle

Build for trust first, scale second, and speed third.

In healthcare systems, correctness, security, and consent integrity are product features, not optional engineering concerns.
