# Phase 0: Research Findings

## 1. Expression Parsing Strategy

**Decision**: Use `angular-expressions` library with `docxtemplater`.

**Rationale**:
- **Security**: It avoids `eval()`, preventing arbitrary code execution. It parses expressions against a specific context object.
- **Compatibility**: It is the recommended solution by `docxtemplater` maintainers for supporting complex logic (e.g., `user.role == 'admin'`, `price > 100`).
- **Performance**: It compiles expressions efficiently.

**Alternatives Considered**:
- **Native JS `eval` / `Function`**: Rejected due to critical security risks (RCE).
- **Custom Parser**: Rejected due to high implementation complexity and maintenance burden.
- **`expr-eval`**: A viable alternative, but `angular-expressions` is more commonly used with `docxtemplater` and has a filter system similar to Angular templates.

## 2. Frontend Drag-and-Drop Strategy

**Decision**: Use Native HTML5 Drag-and-Drop API with `text/plain` data transfer.

**Rationale**:
- **Simplicity**: No external libraries or complex Quill modules required.
- **Integration**: Quill natively handles dropping text at the cursor position.
- **Output**: The dropped content is plain text (e.g., `{#condition}`), which is exactly what `docxtemplater` expects in the DOCX file.

**Alternatives Considered**:
- **Custom Quill Blots (Embeds)**: Would render a UI component (like a chip) in the editor. Rejected because:
    1. It complicates the `html-to-docx` conversion (need to serialize the blot back to text tags).
    2. The requirement is to edit the logic text (e.g. change variable name), which is harder with immutable blots.
- **`vue-draggable`**: Good for lists, but overkill for dropping individual items into a text editor.

## 3. Syntax Confirmation

**Decision**: Use standard `docxtemplater` tag syntax with Angular expressions inside.

**Pattern**:
- **IF**: `{# condition } ... {/}`
- **IF/ELSE**: `{# condition } ... {^} ... {/}` (Note: `^` is the standard inverted section tag, equivalent to "else" in mustache/docxtemplater).

**Example**:
```text
{# role == 'admin' }
  ADMIN ONLY CONTENT
{^}
  REGULAR USER CONTENT
{/}
```

**Implementation Details**:
- The backend `ExpressionParser` will sanitize smart quotes (which often appear when copy-pasting) before parsing.
- Frontend will inject these exact strings on drop.
