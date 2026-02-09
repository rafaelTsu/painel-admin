\# Implementation Plan: Administrative Panel System

**Branch**: `001-admin-panel-system` | **Date**: 2026-02-09 | **Spec**: `specs/001-admin-panel-system/spec.md`
**Input**: Feature specification from `specs/001-admin-panel-system/spec.md`

## Summary

Build an authenticated Administrative Panel where only administrators and attorneys can access the system, with strict group scoping for attorneys. Provide CRUD for users, groups, templates, variables, and categories; template versioning with audit logs; and simulation runs that generate DOCX/PDF outputs, including import/export of templates and download/export of generated files.

Backend will be Node.js/Express with layered modules (routers/controllers/middlewares/services/models) using Sequelize + PostgreSQL, Joi validation, and Vitest tests. Frontend will be Vue 3 (Options API) + Vite + Vuetify, Pinia state management, Cypress E2E, and Docker containerization for both applications.

## Technical Context

**Language/Version**: Backend Node.js 20 LTS (JavaScript); Frontend JavaScript (Vue 3 Options API)

**Primary Dependencies**:
- Backend: Express, Sequelize, PostgreSQL driver, Joi (validation), Vitest (unit/integration), Supertest (HTTP test helper)
- Frontend: Vue 3, Vite, Vuetify, Pinia, Axios (API client), Cypress (E2E)

**Storage**:
- PostgreSQL for all relational entities (users, groups, memberships, templates metadata, versions metadata, simulations, audit events)
- File storage for DOCX templates and generated simulation outputs (initially as a mounted filesystem volume via Docker; design keeps a clear seam to move to S3/MinIO later)

**Testing**:
- Backend: Vitest for unit + integration (request-level) tests, using a dedicated PostgreSQL test database
- Frontend: Vitest for unit tests (where valuable), Cypress for end-to-end flows

**Target Platform**:
- Linux server (Dockerized), local development via Docker Compose

**Project Type**:
- Web application (separate backend + frontend)

**Performance Goals**:
- CRUD endpoints: <200ms p95 for typical list/detail/update operations under normal load
- Simulation: typical runs produce DOCX/PDF within 15 seconds (aligns to SC-003)

**Constraints**:
- Security-first admin surface: server-side authz on every request; deny evaluator access; strict group scoping for attorneys
- Auditability: all critical actions logged with actor/timestamp/action/target/group context/outcome
- Reliability: deterministic validation, actionable errors; avoid N+1 queries; paginate unbounded lists
- Frontend UX: MUST follow the established Figma design (screenshots in `design/`). Flows not prototyped MUST reuse the same layout, navigation, form/table patterns, and Vuetify components to maintain consistency.

**Scale/Scope**:
- Initial scope: single admin panel with core entities and workflows for access, template management/versioning, simulation, import/export

**Naming Convention (required)**:
- Backend files: `<name>.<layer>.js` (examples: `user.controller.js`, `auth.middleware.js`, `template.service.js`, `group.router.js`)
- Frontend files: same pattern adapted to file type (examples: `user.page.vue`, `group.view.vue`, `template-form.component.vue`, `auth.service.js`, `groups.store.js`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS
  - Plan and contracts map directly to FR-001..FR-040 and the three user stories.
- **II. Code Quality & SOLID**: PASS
  - Layered module boundaries (router/controller/service/model) and shared cross-cutting middleware (authz/audit).
- **III. Security First**: PASS
  - Server-side authn/authz for every route; least-privilege RBAC + explicit group scoping; Joi validation at API boundary; secrets via env.
- **IV. Performance & Reliability**: PASS
  - Pagination/limits on lists; Sequelize eager loading guidance; simulation work bounded with timeouts and clear failure logging.
- **V. UX Consistency & Accessibility**: PASS
  - Vuetify components for consistent forms/tables; predictable navigation; destructive-action confirmations.

No constitution violations are required for this plan.

**Post-Phase-1 Re-check (2026-02-09)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-panel-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
backend/
├── Dockerfile
├── package.json
├── vitest.config.js
├── eslint.config.js
├── prettier.config.cjs
├── .env.example
├── src/
│   ├── app.server.js
│   ├── env.config.js
│   ├── db/
│   │   ├── sequelize.db.js
│   │   ├── migrate.db.js
│   │   └── migrations/
│   │       └── README.md
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── auth.router.js
│   │   ├── user.router.js
│   │   ├── group.router.js
│   │   ├── variable.router.js
│   │   ├── category.router.js
│   │   ├── template.router.js
│   │   └── simulation.router.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── group.controller.js
│   │   ├── variable.controller.js
│   │   ├── category.controller.js
│   │   ├── template.controller.js
│   │   └── simulation.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── group.service.js
│   │   ├── variable.service.js
│   │   ├── category.service.js
│   │   ├── template.service.js
│   │   ├── simulation.service.js
│   │   ├── audit.service.js
│   │   ├── storage.service.js
│   │   ├── docx-render.service.js
│   │   ├── pdf-convert.service.js
│   │   └── import-export.service.js
│   ├── models/
│   │   ├── index.model.js
│   │   ├── user.model.js
│   │   ├── group.model.js
│   │   ├── membership.model.js
│   │   ├── variable.model.js
│   │   ├── category.model.js
│   │   ├── category-variable.model.js
│   │   ├── template.model.js
│   │   ├── template-version.model.js
│   │   ├── simulation-run.model.js
│   │   ├── generated-document.model.js
│   │   └── audit-event.model.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── require-role.middleware.js
│   │   ├── require-group-membership.middleware.js
│   │   ├── audit.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── error.middleware.js
│   ├── validations/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── group.validator.js
│   │   ├── variable.validator.js
│   │   ├── category.validator.js
│   │   ├── template.validator.js
│   │   └── simulation.validator.js
│   └── shared/
│       ├── errors.util.js
│       └── pagination.util.js
└── tests/
  ├── unit/
  └── integration/

frontend/
├── Dockerfile
├── package.json
├── vitest.config.js
├── eslint.config.js
├── prettier.config.cjs
├── cypress.config.js
├── .env.example
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── user-form.component.vue
│   │   ├── group-form.component.vue
│   │   └── template-version-list.component.vue
│   ├── pages/
│   │   ├── login.page.vue
│   │   ├── user.page.vue
│   │   ├── group.page.vue
│   │   ├── template.page.vue
│   │   ├── template-editor.page.vue
│   │   └── simulation.page.vue
│   ├── views/
│   │   └── app.view.vue
│   ├── router/
│   │   └── routes.router.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── group.service.js
│   │   ├── template.service.js
│   │   └── simulation.service.js
│   ├── stores/
│   │   ├── auth.store.js
│   │   ├── user.store.js
│   │   ├── group.store.js
│   │   ├── template.store.js
│   │   └── simulation.store.js
│   └── shared/
│       ├── api.service.js
│       └── errors.util.js
└── cypress/
  └── e2e/
```

**Structure Decision**: Web application layout with separate `backend/` and `frontend/` folders. Backend uses strict layered architecture (`routes/`, `controllers/`, `services/`, `models/`, `middlewares/`, `validations/`) with the required `<name>.<layer>.js` naming. Frontend also uses strict layered architecture (`pages/`, `views/`, `components/`, `assets/`, `services/`, `stores/`, `router/`, `shared/`), still following `<name>.<layer>.(js|vue)`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

> No constitution violations are introduced by this plan; this section is intentionally left unused.
