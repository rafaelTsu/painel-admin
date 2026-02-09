# Phase 0 Research: Admin Panel System

This document resolves technical unknowns and records key architectural decisions for the feature defined in `specs/001-admin-panel-system/spec.md`.

## Decisions

### 1) Backend runtime & framework
- Decision: Node.js 20 LTS + Express (4.x)
- Rationale: Stable ecosystem, broad middleware support, predictable behavior for admin APIs.
- Alternatives considered:
  - Express 5: viable, but defaulting to the more widely-deployed major line.
  - Fastify/NestJS: higher ceremony or different conventions than requested.

### 2) Architecture + naming convention
- Decision: Strict layered backend architecture with explicit packages:
  - `routes/` (Express route registration)
  - `controllers/` (HTTP boundary, request/response mapping)
  - `services/` (business logic)
  - `models/` (Sequelize models + relations)
  - `middlewares/` (auth/authz, auditing, errors)
  - `validations/` (Joi validators)

  Example layout: `controllers/user.controller.js`, `routes/user.router.js`, `services/user.service.js`, `models/user.model.js`, `validations/user.validator.js`.
- Rationale: This enforces clear dependency direction and consistency across domains, matching your requirement for a classic layered architecture.
- Alternatives considered:
  - Feature folders: rejected because it conflicts with the desired strict layer packaging.

### 3) Authentication strategy (admin SPA)
- Decision: JWT access token (short TTL) + refresh token (httpOnly cookie) with server-side rotation.
- Rationale: Works well for SPA + API, reduces risk of token theft via XSS compared to long-lived localStorage tokens.
- Alternatives considered:
  - Server sessions (`express-session` + Redis): strong option, but adds infra; keep as a future upgrade.

### 4) Authorization model (roles + group scoping)
- Decision: Explicit RBAC (`administrator`, `attorney`, `evaluator`) + group-scoped routes.
  - Group-owned resources are accessed under `/groups/:groupId/...`.
  - Middleware enforces:
    - panel access: admin/attorney only
    - evaluator: always denied + audited
    - attorney: must be a member of `:groupId`
    - admin: allowed for all groups
- Rationale: Makes scoping non-optional and prevents accidental data leakage.
- Alternatives considered:
  - Implicit group context (header-only): can be error-prone; acceptable only if strictly validated.

### 5) ORM + migrations
- Decision: Sequelize + PostgreSQL; migrations managed via Umzug (Sequelize-compatible).
- Rationale: Sequelize matches your request; Umzug is lightweight and works in code + CI.
- Alternatives considered:
  - `sequelize-cli`: common, but can be harder to integrate with custom app boot/test flows.

### 6) Validation
- Decision: Joi validators per domain (`*.validator.js`) validated at controllers/middlewares.
- Rationale: Clear trust boundary; consistent error shapes.
- Alternatives considered:
  - Zod/Yup: not requested.

### 7) DOCX templating and conditional logic
- Decision: Use `docxtemplater` for DOCX rendering with a stored template version snapshot.
- Rationale: Mature tooling for DOCX placeholder replacement and conditional/loop logic; matches “DOCX first” requirement.
- Alternatives considered:
  - `docx-templates`: viable; evaluate later if conditional nesting needs are better met.

### 8) PDF generation
- Decision: Generate PDF by converting the produced DOCX using headless LibreOffice (`soffice`) inside Docker.
- Rationale: Practical, commonly used DOCX→PDF conversion; decouples PDF from template logic.
- Alternatives considered:
  - Direct PDF templating: diverges from “DOCX initial format”.
  - External SaaS converter: introduces data/security concerns.

### 9) File storage (templates + generated documents)
- Decision: Store files on a Docker-mounted volume in development; DB stores metadata + filesystem path.
- Rationale: Fastest path to working simulation/download flows; keeps a seam for later S3/MinIO.
- Alternatives considered:
  - Storing binaries in Postgres: can work but increases DB bloat and backup complexity.

### 10) Template versioning + concurrency
- Decision:
  - Every update creates a new immutable `TemplateVersion` row.
  - Use optimistic concurrency control with a `revision` (integer) on the mutable `Template` record.
- Rationale: Prevents silent overwrites and preserves traceable history.
- Alternatives considered:
  - Pessimistic locking: reduces usability and increases DB contention.

### 11) Import/Export package format
- Decision: Export as a ZIP containing:
  - `manifest.json` (ids, names, versions)
  - template DOCX file(s)
  - `variables.json`, `categories.json` (definitions)
- Rationale: Portable, inspectable, and supports conflict resolution.
- Alternatives considered:
  - Single JSON with base64 file blobs: simpler but less friendly to inspect and often larger.

### 12) Testing strategy
- Decision:
  - Unit tests for services and validation logic (Vitest)
  - Integration tests for API routes (Vitest + Supertest) against a test Postgres
  - Cypress E2E for core admin flows (login, group scoping, CRUD, simulation)
- Rationale: Matches constitution gates (security + reliability) and acceptance scenarios.
- Alternatives considered:
  - E2E-only: too slow and misses service-level correctness.

### 13) Frontend design source of truth
- Decision: Implement the frontend UI to match the existing Figma design as captured by screenshots in `design/` (`captura1.png`..`captura4.png`).
- Rationale: Ensures UX consistency and reduces rework; aligns with Constitution V (UX Consistency & Accessibility).
- Alternatives considered:
  - Designing from scratch: rejected to avoid divergence from established product direction.

Implementation note for non-prototyped flows:
- Keep the same layout primitives (app shell, navigation, page headers), form validation/error messaging style, and table patterns. Use Vuetify components and avoid one-off patterns.

### 14) Frontend architecture
- Decision: Strict layered frontend architecture (no `features/` folders), using:
  - `pages/` (route-level screens)
  - `views/` (app shell/layout)
  - `components/` (reusable UI)
  - `assets/` (static)
  - `services/` (API clients)
  - `stores/` (Pinia)
  - `router/` (route definitions)
  - `shared/` (cross-cutting utilities)

  Naming follows the required `<name>.<layer>.(js|vue)` pattern.
- Rationale: Matches the requested layered architecture approach consistently across backend and frontend while keeping Vue code organized by responsibility.
- Alternatives considered:
  - Feature-based folders: rejected per architecture requirement.

## Resolved Clarifications

- Node version: fixed to Node.js 20 LTS.
- Express major version: fixed to 4.x.
- PDF generation mechanism: LibreOffice conversion in Docker.
- File storage: local volume now, with a clean seam to object storage later.
- Group scoping mechanism: explicit `groupId` in routes for group-owned resources.

