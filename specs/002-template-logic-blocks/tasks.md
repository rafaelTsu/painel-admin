# Tasks: Template Logic Blocks

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Status**: Pending

## Phase 1: Setup
- [x] T001 Install angular-expressions dependency in backend `backend/package.json`

## Phase 2: Foundational
- [x] T002 Configure DocxRenderService with angular-expressions parser in `backend/src/services/docx-render.service.js`

## Phase 3: User Story 1 - Add Conditional Logic with Expressions (P1)
**Goal**: Users can drag "IF" blocks into the editor, and the backend correctly renders them using expressions.

- [x] T003 [US1] Create LogicSidebar component with draggable IF block in `frontend/src/components/template-editor/LogicSidebar.vue`
- [x] T004 [US1] Integrate LogicSidebar into TemplateEditor page in `frontend/src/pages/template-editor.page.vue`
- [x] T005 [US1] Implement drag-start handler to transfer `{# condition } ... {/}` text in `frontend/src/pages/template-editor.page.vue`
- [x] T006 [US1] Create integration test for conditional expression rendering in `backend/tests/integration/docx-render.integration.test.js`

## Phase 4: User Story 2 - Add Conditional Logic with Fallback (IF/ELSE) (P2)
**Goal**: Users can drag "IF/ELSE" blocks, and backend handles the fallback logic.

- [x] T007 [US2] Add "IF/ELSE" block to LogicSidebar in `frontend/src/components/template-editor/LogicSidebar.vue`
- [x] T008 [US2] Update drag-start handler to support `{#...}...{^}...{/}` syntax in `frontend/src/pages/template-editor.page.vue`
- [x] T009 [US2] Add test case for IF/ELSE logic in `backend/tests/integration/docx-render.integration.test.js`

## Dependencies
- T002 blocks T006, T009
- T003 blocks T004
- T007 blocks T008

## Implementation Strategy
1.  **Backend Core**: First enable the expression parsing capability. This is safe to deploy even without frontend changes.
2.  **Frontend UI**: Add the sidebar and drag interactions.
3.  **Verification**: Use the integration tests to ensure `docxtemplater` + `angular-expressions` works as expected with various operators.
