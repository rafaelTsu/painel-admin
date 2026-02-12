# Quickstart: Template Logic Blocks

## Setup

1.  **Frontend**: The editor sidebar now has a "Logic Blocks" section.
2.  **Backend**: No configuration required. The generation engine handles the new logic automatically.

## Usage

### 1. Adding Logic

1.  Open a template in the **Web Editor**.
2.  Drag an **IF Condition** block from the sidebar.
3.  Drop it into the document content.
4.  Edit the placeholder text `{{# condition }}` to your expression (e.g., `{{# amount > 1000 }}`).

### 2. Using Expressions

Expressions support standard JavaScript operators:
- **Comparison**: `==`, `!=`, `>`, `<`, `>=`, `<=`
- **Logical**: `&&`, `||`, `!`
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`
- **String**: `'text'`, `"text"` (Standard quotes recommended)

**Example**:
```text
{{# user.role == 'admin' && user.active }}
  Content for active admins.
{{/}}
{{^ user.role == 'admin' && user.active }}
  Content for everyone else.
{{/}}
```

### 3. Testing Logic

1.  Save the template version.
2.  Click **Simulate**.
3.  Provide test data in the variables form (e.g., `role: 'admin'`, `active: true`).
4.  Generate the document and verify the output.
