# Data Model: Template Logic Blocks

## Existing Entities

### TemplateVersion

**Description**: Stores the content of a template version, including the new logic tags.

| Field | Type | Description |
| :--- | :--- | :--- |
| `content` | `TEXT` (HTML/XML) | Contains the document structure with embedded logic tags (e.g., `{# role == 'admin' }`). |
| `variables` | `JSON` | Metadata about variables used (optional, for UI hints). |

### Variable

**Description**: Defines the data available for logic evaluation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `key` | `STRING` | The identifier used in expressions (e.g., `role`, `amount`). |
| `type` | `ENUM` | `String`, `Number`, `Boolean`, `Date`. |

## Logic Syntax (Virtual Model)

The logic is not stored as structured data but parsed at runtime during document generation.

**Expression Structure**:
- **Delimiters**: `{{# ... }}` (Start/If), `{{^ ... }}` (Else/Inverted - must repeat condition for expressions), `{{/}}` (End)
- **Operators**: `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `!`, `+`, `-`, `*`, `/`, `%`
- **Literals**: `'string'`, `123`, `true`, `false`, `null`
- **Variables**: `variableName`, `object.property`

**Example**:
```text
{{# user.age >= 18 && user.status == 'active' }}
  User is an adult active member.
{{/}}
{{^ user.age >= 18 && user.status == 'active' }}
  User is a minor or inactive.
{{/}}
```
