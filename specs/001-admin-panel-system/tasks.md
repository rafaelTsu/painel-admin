---

description: "Task list for Administrative Panel System implementation"

---

# Tasks: Administrative Panel System

**Input**: Design documents from `specs/001-admin-panel-system/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: INCLUDED (spec requires User Scenarios & Testing).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format

- Every task MUST use: `- [ ] T### [P?] [US?] Description with file path`
- `[P]` only when the task can be done in parallel (different files, no dependency)
- `[US1]/[US2]/[US3]` only for user story phases (NOT Setup/Foundational/Polish)

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create backend folder structure per plan in backend/src/{routes,controllers,services,models,middlewares,validations,db,shared} and backend/tests/{unit,integration}
- [X] T002 Create frontend folder structure per plan in frontend/src/{assets,components,pages,views,router,services,stores,shared} and frontend/cypress/e2e
- [X] T003 Initialize backend Node project in backend/package.json (scripts: dev,start,test,lint,format,db:migrate)
- [X] T004 Initialize frontend Vite+Vue3 (Options API) project in frontend/package.json with Vuetify and Pinia
- [X] T005 [P] Add backend lint/format config in backend/eslint.config.js and backend/prettier.config.cjs
- [X] T006 [P] Add frontend lint/format config in frontend/eslint.config.js and frontend/prettier.config.cjs
- [X] T007 Add backend Vitest config in backend/vitest.config.js
- [X] T008 Add frontend Vitest config in frontend/vitest.config.js
- [X] T009 Add Cypress config in frontend/cypress.config.js
- [X] T010 Create Docker Compose stack in docker-compose.yml (services: db, backend, frontend; volumes for postgres + files)
- [X] T011 [P] Add backend Dockerfile in backend/Dockerfile (Node 20, include LibreOffice for PDF conversion)
- [X] T012 [P] Add frontend Dockerfile in frontend/Dockerfile (Vite build + dev server)
- [X] T013 Add env examples in backend/.env.example and frontend/.env.example
- [X] T014 [P] Add repo-level README run instructions in README.md referencing specs/001-admin-panel-system/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [X] T015 Implement backend env loader in backend/src/env.config.js (required envs: DATABASE_URL, JWT secrets, FILES_BASE_PATH)
- [X] T016 Setup Sequelize connection in backend/src/db/sequelize.db.js using DATABASE_URL
- [X] T017 Implement migrations runner with Umzug in backend/src/db/migrate.db.js and backend/src/db/migrations/README.md
- [X] T018 Implement base Express app bootstrap in backend/src/app.server.js (JSON, CORS, request logging)
- [X] T019 Implement centralized error handling middleware in backend/src/middlewares/error.middleware.js
- [X] T020 Implement pagination helpers in backend/src/shared/pagination.util.js and error helpers in backend/src/shared/errors.util.js
- [X] T021 Implement AuditEvent model in backend/src/models/audit-event.model.js (per data-model.md)
- [X] T022 Implement audit service in backend/src/services/audit.service.js and audit middleware in backend/src/middlewares/audit.middleware.js
- [X] T023 Implement auth middleware skeleton in backend/src/middlewares/auth.middleware.js (extract user from JWT, attach req.user)
- [X] T024 Implement role guard middleware in backend/src/middlewares/require-role.middleware.js (admin/attorney only)
- [X] T025 Implement group membership guard in backend/src/middlewares/require-group-membership.middleware.js (attorney must belong to :groupId)
- [X] T026 Add health endpoint in backend/src/routes/health.router.js and wire in backend/src/app.server.js
- [X] T027 Add integration test harness (test db URL, migrations) in backend/tests/integration/_setup.test.js

**Checkpoint**: Foundation ready (db/migrations, app bootstrap, audit, auth/authz middleware skeletons).

---

## Phase 3: User Story 1 — Secure Access, Users, and Groups (Priority: P1) 🎯 MVP

**Goal**: Authenticated access with role-based restrictions; admins manage users/groups; attorneys scoped to memberships; evaluators denied and audited.

**Independent Test**: Create admin/attorney/evaluator; create groups; assign attorney to groups; verify admin sees all groups; attorney sees only memberships; evaluator denied and denial audited.

### Tests for User Story 1

- [X] T028 [P] [US1] Add auth integration tests for login and /auth/me in backend/tests/integration/auth.integration.test.js
- [X] T029 [P] [US1] Add authorization tests (evaluator denied, attorney scoped) in backend/tests/integration/authz.integration.test.js
- [X] T030 [P] [US1] Add audit logging tests for denied access in backend/tests/integration/audit.integration.test.js

### Backend implementation (US1)

- [X] T031 [P] [US1] Implement User model in backend/src/models/user.model.js
- [X] T032 [P] [US1] Implement Group model in backend/src/models/group.model.js
- [X] T033 [P] [US1] Implement Membership model in backend/src/models/membership.model.js
- [X] T034 [US1] Define Sequelize relations in backend/src/models/index.model.js (User↔Membership↔Group)
- [X] T035 [P] [US1] Implement auth validators in backend/src/validations/auth.validator.js
- [X] T036 [US1] Implement auth service in backend/src/services/auth.service.js (password hashing, JWT issue/verify, refresh flow)
- [X] T037 [US1] Implement auth controller in backend/src/controllers/auth.controller.js
- [X] T038 [US1] Implement auth routes in backend/src/routes/auth.router.js
- [X] T039 [P] [US1] Implement user validators in backend/src/validations/user.validator.js
- [X] T040 [US1] Implement user service in backend/src/services/user.service.js (admin CRUD, unique email, deactivate)
- [X] T041 [US1] Implement user controller in backend/src/controllers/user.controller.js
- [X] T042 [US1] Implement user routes in backend/src/routes/user.router.js (admin-only)
- [X] T043 [P] [US1] Implement group validators in backend/src/validations/group.validator.js
- [X] T044 [US1] Implement group service in backend/src/services/group.service.js (admin CRUD, list scoped for attorney)
- [X] T045 [US1] Implement group controller in backend/src/controllers/group.controller.js
- [X] T046 [US1] Implement group routes in backend/src/routes/group.router.js (includes memberships add/remove admin-only)
- [X] T047 [US1] Wire routes + middleware order in backend/src/app.server.js (audit → auth → role guard → routers)
- [X] T048 [US1] Ensure all US1 actions write audit events in backend/src/services/audit.service.js (user/group CRUD, membership changes, auth failures)

### Frontend implementation (US1)

- [X] T049 [P] [US1] Implement API client in frontend/src/shared/api.service.js (base URL, auth header, error normalization)
- [X] T050 [P] [US1] Implement auth store in frontend/src/stores/auth.store.js (token/user state)
- [X] T051 [US1] Implement auth service in frontend/src/services/auth.service.js (login, me)
- [X] T052 [US1] Implement login page in frontend/src/pages/login.page.vue (Vuetify form + Joi-like frontend validation rules)
- [X] T053 [P] [US1] Implement user service in frontend/src/services/user.service.js
- [X] T054 [P] [US1] Implement group service in frontend/src/services/group.service.js
- [X] T055 [US1] Implement user store in frontend/src/stores/user.store.js
- [X] T056 [US1] Implement group store in frontend/src/stores/group.store.js (includes selectedGroupId for scoping)
- [X] T057 [US1] Implement app shell view in frontend/src/views/app.view.vue (navigation consistent with `design/` screenshots)
- [X] T058 [US1] Implement router + guards in frontend/src/router/routes.router.js (block evaluator; require auth)
- [X] T059 [US1] Implement users page in frontend/src/pages/user.page.vue and form component in frontend/src/components/user-form.component.vue
- [X] T060 [US1] Implement groups page in frontend/src/pages/group.page.vue and form component in frontend/src/components/group-form.component.vue (membership assignment UI for admins)

### E2E (US1)

- [X] T061 [US1] Add Cypress E2E for login + role denial + scoped group listing in frontend/cypress/e2e/us1-auth-groups.cy.js

**Checkpoint**: US1 complete and independently testable.

---

## Phase 4: User Story 2 — Templates, Variables, Categories, and Versioning (Priority: P2)

**Goal**: Group-scoped CRUD for variables/categories/templates with immutable template versioning and validation.

**Independent Test**: Create variables and categories; create a template; upload DOCX to create versions; verify older versions immutable and listed; validate missing variable references are rejected.

### Tests for User Story 2

- [X] T062 [P] [US2] Add integration tests for variables/categories CRUD with group scoping in backend/tests/integration/variable-category.integration.test.js
- [X] T063 [P] [US2] Add integration tests for template creation + versioning in backend/tests/integration/template-version.integration.test.js

### Backend implementation (US2)

- [X] T064 [P] [US2] Implement Variable model in backend/src/models/variable.model.js
- [X] T065 [P] [US2] Implement Category model in backend/src/models/category.model.js and join model in backend/src/models/category-variable.model.js
- [X] T066 [US2] Define Variable/Category relations in backend/src/models/index.model.js (Group ownership + joins)
- [X] T067 [P] [US2] Implement variable validators in backend/src/validations/variable.validator.js
- [X] T068 [US2] Implement variable service/controller/routes in backend/src/services/variable.service.js, backend/src/controllers/variable.controller.js, backend/src/routes/variable.router.js (under /groups/:groupId)
- [X] T069 [P] [US2] Implement category validators in backend/src/validations/category.validator.js
- [X] T070 [US2] Implement category service/controller/routes in backend/src/services/category.service.js, backend/src/controllers/category.controller.js, backend/src/routes/category.router.js (include category-variable assignment)
- [X] T071 [P] [US2] Implement Template and TemplateVersion models in backend/src/models/template.model.js and backend/src/models/template-version.model.js
- [X] T072 [US2] Define Template relations in backend/src/models/index.model.js (Template→TemplateVersion, Group ownership)
- [X] T073 [P] [US2] Implement template validators in backend/src/validations/template.validator.js (including referencedVariableKeys validation)
- [X] T074 [US2] Implement storage service for template files in backend/src/services/storage.service.js (paths under FILES_BASE_PATH)
- [X] T075 [US2] Implement template service/controller/routes in backend/src/services/template.service.js, backend/src/controllers/template.controller.js, backend/src/routes/template.router.js (create template, list, list versions, upload DOCX → new version, restore version)
- [X] T076 [US2] Ensure audit events for template CRUD/versioning in backend/src/services/audit.service.js

### Frontend implementation (US2)

- [X] T077 [P] [US2] Implement variable service/store in frontend/src/services/variable.service.js and frontend/src/stores/variable.store.js
- [X] T078 [P] [US2] Implement category service/store in frontend/src/services/category.service.js and frontend/src/stores/category.store.js
- [X] T079 [P] [US2] Implement template service/store in frontend/src/services/template.service.js and frontend/src/stores/template.store.js
- [X] T080 [US2] Implement templates page in frontend/src/pages/template.page.vue (list templates by selected group)
- [X] T081 [US2] Implement template editor page in frontend/src/pages/template-editor.page.vue (DOCX upload, version list component)
- [X] T082 [US2] Implement version list component in frontend/src/components/template-version-list.component.vue

**Checkpoint**: US2 complete and independently testable.

---

## Phase 5: User Story 3 — Simulation + Import/Export (Priority: P3)

**Goal**: Simulate a specific template version with variable values and generate DOCX/PDF outputs; import/export templates; download generated files; audit everything.

**Independent Test**: Run simulation with values → produce DOCX/PDF download; export template package; import into another group with conflict strategy; simulate imported template; verify audit logs.

### Tests for User Story 3

- [X] T083 [P] [US3] Add integration tests for simulation run + document download authz in backend/tests/integration/simulation.integration.test.js
- [X] T084 [P] [US3] Add integration tests for export/import flows in backend/tests/integration/import-export.integration.test.js

### Backend implementation (US3)

- [X] T085 [P] [US3] Implement SimulationRun and GeneratedDocument models in backend/src/models/simulation-run.model.js and backend/src/models/generated-document.model.js
- [X] T086 [US3] Define Simulation relations in backend/src/models/index.model.js (SimulationRun→GeneratedDocument, group ownership)
- [X] T087 [P] [US3] Implement simulation validators in backend/src/validations/simulation.validator.js
- [X] T088 [US3] Implement DOCX render service in backend/src/services/docx-render.service.js using docxtemplater
- [X] T089 [US3] Implement PDF convert service in backend/src/services/pdf-convert.service.js using LibreOffice in backend container
- [X] T090 [US3] Implement simulation service/controller/routes in backend/src/services/simulation.service.js, backend/src/controllers/simulation.controller.js, backend/src/routes/simulation.router.js (create run, status, download)
- [X] T091 [US3] Implement import/export service in backend/src/services/import-export.service.js (zip manifest + conflict strategies)
- [X] T092 [US3] Add import/export endpoints to backend/src/routes/template.router.js (export template, import into group)
- [X] T093 [US3] Ensure audit events for simulation/import/export/download in backend/src/services/audit.service.js

### Frontend implementation (US3)

- [X] T094 [P] [US3] Implement simulation service/store in frontend/src/services/simulation.service.js and frontend/src/stores/simulation.store.js
- [X] T095 [US3] Implement simulation page in frontend/src/pages/simulation.page.vue (variable input form based on template referenced variables; download links)
- [X] T096 [US3] Add export/import UI actions to frontend/src/pages/template.page.vue (download export zip, upload import zip)

### E2E (US3)

- [X] T097 [US3] Add Cypress E2E for simulation run + download in frontend/cypress/e2e/us3-simulation.cy.js

**Checkpoint**: US3 complete and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T098 [P] Add security hardening headers and CORS rules in backend/src/app.server.js
- [X] T099 Add rate limiting for auth endpoints in backend/src/middlewares/rate-limit.middleware.js and wire into backend/src/routes/auth.router.js
- [X] T100 Add OpenAPI-driven contract test smoke checks in backend/tests/integration/openapi-smoke.integration.test.js referencing specs/001-admin-panel-system/contracts/openapi.yaml
- [X] T101 Document architecture + runbook updates in specs/001-admin-panel-system/quickstart.md
- [X] T102 Validate quickstart steps by running docker compose locally and updating specs/001-admin-panel-system/quickstart.md with any corrections

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; blocks all user stories
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on US1 (requires auth, group scoping, base entities)
- **US3 (Phase 5)**: depends on US2 (requires templates/versions/variables/categories) and US1
- **Polish (Phase 6)**: after desired user stories are complete

### User Story Dependencies

- **US1 → US2 → US3** is the intended order for lowest risk.
- With multiple developers, once US1 is stable, US2 backend and US2 frontend can proceed in parallel.

---

## Parallel Execution Examples

### US1 parallel opportunities

- Write tests in parallel:
  - T028, T029, T030
- Implement independent models/validators in parallel:
  - T031, T032, T033, T035, T039, T043
- Implement independent frontend primitives in parallel:
  - T049, T050, T053, T054

### US2 parallel opportunities

- Implement independent models/validators in parallel:
  - T064, T065, T067, T069, T071, T073
- Implement frontend service/store pairs in parallel:
  - T077, T078, T079

### US3 parallel opportunities

- Implement render/conversion services in parallel:
  - T088, T089
- Implement models/validators in parallel:
  - T085, T087

---

## Implementation Strategy

### MVP First

1. Complete Setup + Foundational
2. Complete US1 (end-to-end: backend authz + UI login/users/groups + audits)
3. Stop and validate US1 acceptance scenarios + Cypress flow

### Incremental Delivery

- Add US2 next (variables/categories/templates/versioning)
- Add US3 last (simulation + import/export)
- Keep each story independently testable after completion
