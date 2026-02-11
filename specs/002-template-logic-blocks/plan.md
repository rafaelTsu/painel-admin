# Implementation Plan: Template Logic Blocks

**Branch**: `002-template-logic-blocks` | **Date**: 2026-02-11 | **Spec**: [specs/002-template-logic-blocks/spec.md](../spec.md)
**Input**: Feature specification from `specs/002-template-logic-blocks/spec.md`

## Summary

Empower users to add nested conditional logic (If, If/Else blocks) directly in the Docx Template Web Editor using a low-code drag-and-drop interface. This leverages the existing `docxtemplater` backend logic by inserting the correct syntax tags (`{#var}...{/var}` and `{#var}...{/}{^var}...{/}`) into the editor.

## Technical Context

**Language/Version**: Node.js 20 (Backend), Vue 3 + Vite (Frontend)
**Primary Dependencies**: `docxtemplater` (Backend), `vue-quill` (Frontend Editor)
**Storage**: PostgreSQL (Template versions are stored as files, metadata in DB)
**Testing**: Vitest (Unit), Cypress (E2E)
**Target Platform**: Web Browser (Chrome/Firefox/Edge)
**Project Type**: Web Application
**Performance Goals**: Instant drag-and-drop feedback; Document generation < 2s.
**Constraints**: Must use existing `docxtemplater` logic (no new backend template engine).

## Constitution Check

*GATE: Passed.*

## Project Structure

### Documentation (this feature)

```text
specs/002-template-logic-blocks/
├── plan.md              # This file
├── research.md          # N/A (Low complexity, syntax confirmed)
└── checklists/
    └── requirements.md
```

### Source Code

```text
backend/
├── src/
│   └── services/
│       └── template.service.js  # Validation logic (if needed) and HTML<->DOCX conversion

frontend/
├── src/
│   ├── pages/
│   │   └── template-editor.page.vue # Main UI for Logic Blocks
│   └── stores/
│       └── template.store.js    # Data handling
```

## Implementation Phases

### Phase 1: Frontend - UI Components

**Goal**: Enable users to view and drag Logic Blocks into the editor.

- [x] **Add "Document Logic" Section**: Update sidebar in `template-editor.page.vue` to list "IF Condition" and "IF / ELSE Condition".
- [x] **Implement Drag Logic**: Add `dragstart` handlers to inject the correct raw text syntax.
  - `IF`: `{#condition} ... {/condition}`
  - `IF/ELSE`: `{#condition} ... {/condition}{^condition} ... {/condition}`
- [ ] **Styles & Usability**: Ensure the draggable items are clearly distinguishable from variables.

### Phase 2: Frontend - Editor Integration

**Goal**: Ensure the generated tags are preserved and editable.

- [x] **Quill Integration**: Verify `vue-quill` accepts the dropped text. (Confirmed via standard HTML5 DnD behavior).
- [ ] **Validation (Optional)**: visual feedback if tags are malformed (Out of scope for simple changes, but good to keep in mind).

### Phase 3: Verification & Testing

**Goal**: Verify end-to-end functionality.

- [ ] **Manual Test**: Drag blocks, rename 'condition' to variable, save, download/simulate.
- [ ] **Data Integrity**: Verify generated DOCX contains valid XML tags for `docxtemplater`.

## Complexity Tracking

Low complexity. Feature primarily uses existing text-insertion capabilities of the editor and standard features of the backend template engine.
