# Tasks: Template Logic Blocks

## Phase 1: Frontend - UI Components

- [ ] T001 [P] Add "Document Logic" section to sidebar in frontend/src/pages/template-editor.page.vue
- [ ] T002 [P] Implement draggable "IF Condition" and "IF / ELSE Condition" blocks in frontend/src/pages/template-editor.page.vue
- [ ] T003 [P] Add dragstart handlers to insert `{#condition} ... {/condition}` and `{#condition} ... {/condition}{^condition} ... {/condition}` in frontend/src/pages/template-editor.page.vue
- [ ] T004 [P] Style logic blocks to distinguish from variables in frontend/src/pages/template-editor.page.vue

## Phase 2: Frontend - Editor Integration

- [ ] T005 [P] Ensure Quill editor accepts and preserves dropped logic tags in frontend/src/pages/template-editor.page.vue
- [ ] T006 Add (optional) visual feedback for malformed tags in frontend/src/pages/template-editor.page.vue

## Phase 3: Verification & Testing

- [ ] T007 Manual test: Drag logic blocks, rename 'condition', save, and simulate in frontend/src/pages/template-editor.page.vue
- [ ] T008 Verify generated DOCX contains valid docxtemplater tags in backend/src/services/template.service.js

## Polish

- [ ] T009 Review and refactor code for maintainability in frontend/src/pages/template-editor.page.vue
- [ ] T010 Update documentation if needed in specs/002-template-logic-blocks/quickstart.md
