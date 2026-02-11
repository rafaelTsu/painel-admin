# Feature Specification: Template Logic Blocks

**Feature Branch**: `002-template-logic-blocks`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Empower users to add nested conditional logic (If, If/Else blocks) directly in the Docx Template Web Editor using a low-code drag-and-drop interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Conditional Logic (Priority: P1)

A template editor user wants to conditionally show or hide content in a document based on a variable (e.g., only show "Spouse Name" if "Marital Status" is "Married"), so they can create dynamic templates without downloading the file to Word.

**Why this priority**: Core functionality requested by the user. Without this, users must edit DOCX files locally for any logic, defeating the purpose of the web editor.

**Independent Test**: Can be tested by dragging an IF block into the editor, saving, and verifying the generated PDF/DOCX respects the condition.

**Acceptance Scenarios**:

1. **Given** the user is in the "Web Editor" tab, **When** they drag the "IF Condition" block from the sidebar to the editor, **Then** the text `{#condition} ... {/condition}` appears at the drop location.
2. **Given** an "IF Condition" block in the editor, **When** the user changes "condition" to an existing variable name (e.g., `hasSpouse`), **Then** the logic is saved correctly.
3. **Given** a template with an IF block, **When** the document is generated with the variable set to true, **Then** the content inside the block is shown.
4. **Given** a template with an IF block, **When** the document is generated with the variable set to false, **Then** the content inside the block is hidden.


---

### User Story 2 - Add Conditional Logic with Fallback (IF/ELSE) (Priority: P2)

A user wants to show alternative content if a condition is false (e.g., "Dear Mr." vs "Dear Ms."), so they can handle binary choices efficiently.

**Why this priority**: Increases the expressiveness of the template editor.

**Independent Test**: Drag IF/ELSE block, save, generate with True/False values, verify output.

**Acceptance Scenarios**:

1. **Given** the user is in the "Web Editor" tab, **When** they drag the "IF / ELSE Condition" block from the sidebar, **Then** the text `{#condition} ... {/condition}{^condition} ... {/condition}` appears.
2. **Given** a template with an IF/ELSE block, **When** generation runs with the variable as false, **Then** the content in the second block (represented by `{^...}`) is shown.

---

### Edge Cases

- **Nested Conditions**: System must support dragging a block *inside* another existing block.
- **Invalid Variable Names**: If user leaves "condition" placeholder or types a non-existent variable, it will be treated as false (standard behavior) or text.
- **Broken Syntax**: If user accidentally deletes a closing tag `{/condition}`, the doc generation might fail or show raw tags.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The specific sidebar in the Web Editor MUST display a "Document Logic" section.
- **FR-002**: The "Document Logic" section MUST contain draggable items for "IF Condition" and "IF / ELSE Condition".
- **FR-003**: Dragging "IF Condition" MUST insert the conditional syntax `{#condition} ... {/condition}`.
- **FR-004**: Dragging "IF / ELSE Condition" MUST insert the inverted section syntax `{#condition} ... {/condition}{^condition} ... {/condition}`.
- **FR-005**: The editor MUST handle the drag-and-drop event and insert text at the specific cursor position or drop target.
- **FR-006**: The generated template version MUST save the HTML/DOCX content including these tags.

### Key Entities

- **TemplateVersion**: Stores the content containing the logic tags.
- **Variable**: Referenced by the conditions (boolean or truthy variables).

## Success Criteria *(mandatory)*

- **Efficiency**: Users can add a conditional block in less than 3 clicks/drags.
- **Completeness**: Supports standard boolean logic (If, If/Else).
- **Correctness**: Generated documents accurately reflect the logic states (True -> Show, False -> Hide/Show Else).

## Assumptions

- Users understand they need to replace the placeholder "condition" with their actual variable key.
- The backend `docxtemplater` configuration supports inverted sections (`^`) (Standard feature).
- The `QuillEditor` component supports having these text tags inserted via drag-and-drop.
