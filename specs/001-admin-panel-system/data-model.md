# Data Model: Admin Panel System

This model supports FR-001..FR-040 (RBAC, group scoping, CRUD, template versioning, simulation outputs, import/export, audit trail).

## Conventions

- Primary keys: UUID (`uuid`) for external-facing stability.
- Timestamps: `createdAt`, `updatedAt` (and optional `deletedAt` only if soft-delete is adopted).
- Group ownership: most business entities are owned by a `groupId` to enforce attorney scoping.
- Immutability: versioned and audited records are append-only.

## Entities

## 1) User
Fields
- `id` (uuid, pk)
- `email` (string, unique, required) — FR-008
- `passwordHash` (string, required)
- `role` (enum: `administrator` | `attorney` | `evaluator`, required) — FR-002
- `isActive` (boolean, default true)
- `lastLoginAt` (timestamp, nullable)

Rules
- Email must be unique case-insensitively (normalize to lowercase).
- Deactivation prevents admin-panel access.

## 2) Group
Fields
- `id` (uuid, pk)
- `name` (string, required)
- `description` (string, nullable)

Rules
- Consider `name` unique (global) to avoid import ambiguity (can be relaxed later).

## 3) GroupMembership
Purpose: Assign attorneys to one or more groups — FR-011

Fields
- `id` (uuid, pk)
- `groupId` (uuid, fk → Group.id, required)
- `userId` (uuid, fk → User.id, required)
- `createdByUserId` (uuid, fk → User.id, required)

Constraints
- Unique composite (`groupId`, `userId`)

Rules
- Only `attorney` users can be members.

## 4) Variable
Fields
- `id` (uuid, pk)
- `groupId` (uuid, fk → Group.id, required)
- `key` (string, required) — stable reference name used by templates
- `label` (string, required)
- `type` (enum: `boolean` | `text`, required) — FR-018 (extendable)
- `isActive` (boolean, default true)
- `description` (string, nullable)

Constraints
- Unique composite (`groupId`, `key`) to keep references stable.

## 5) Category
Fields
- `id` (uuid, pk)
- `groupId` (uuid, fk → Group.id, required)
- `name` (string, required)
- `description` (string, nullable)

Constraints
- Unique composite (`groupId`, `name`)

## 6) CategoryVariable (join)
Fields
- `categoryId` (uuid, fk → Category.id)
- `variableId` (uuid, fk → Variable.id)

Constraints
- Unique composite (`categoryId`, `variableId`)

## 7) Template
Represents the mutable identity (name/ownership), while versions hold immutable content — FR-014..FR-030

Fields
- `id` (uuid, pk)
- `groupId` (uuid, fk → Group.id, required)
- `name` (string, required)
- `description` (string, nullable)
- `revision` (int, default 0) — optimistic concurrency
- `createdByUserId` (uuid, fk → User.id)

Constraints
- Unique composite (`groupId`, `name`)

## 8) TemplateVersion
Immutable snapshot on every change — FR-026

Fields
- `id` (uuid, pk)
- `templateId` (uuid, fk → Template.id, required)
- `versionNumber` (int, required, monotonically increasing per template)
- `changeNote` (string, required) — FR-028
- `createdByUserId` (uuid, fk → User.id, required)
- `createdAt` (timestamp, required)
- `docxPath` (string, required) — points to stored DOCX file
- `logicDefinition` (jsonb, nullable) — conditional/nested rules representation
- `referencedVariableKeys` (jsonb, required) — array of variable keys used by template

Constraints
- Unique composite (`templateId`, `versionNumber`)

Rules
- On save/publish, validate:
  - all referenced variable keys exist within `Template.groupId` — FR-025
  - logic is well-formed/deterministic (schema validation)

## 9) SimulationRun
Tracks a test execution of a template version — FR-031..FR-034

Fields
- `id` (uuid, pk)
- `groupId` (uuid, fk → Group.id, required)
- `templateId` (uuid, fk → Template.id, required)
- `templateVersionId` (uuid, fk → TemplateVersion.id, required)
- `requestedByUserId` (uuid, fk → User.id, required)
- `status` (enum: `queued` | `running` | `succeeded` | `failed`, required)
- `outputFormat` (enum: `docx` | `pdf`, required)
- `inputValues` (jsonb, required) — key/value map for variables
- `errorMessage` (string, nullable)
- `startedAt` (timestamp, nullable)
- `finishedAt` (timestamp, nullable)

## 10) GeneratedDocument
Represents an output artifact downloadable by authorized users — FR-033, FR-038

Fields
- `id` (uuid, pk)
- `simulationRunId` (uuid, fk → SimulationRun.id, required)
- `format` (enum: `docx` | `pdf`, required)
- `fileName` (string, required)
- `filePath` (string, required)
- `byteSize` (int, required)
- `sha256` (string, nullable)

## 11) AuditEvent
Append-only audit trail for critical actions — FR-039..FR-040

Fields
- `id` (uuid, pk)
- `actorUserId` (uuid, fk → User.id, nullable) — null allowed for unauthenticated attempts
- `timestamp` (timestamp, required)
- `action` (string, required) — e.g., `auth.login.success`, `authz.denied`, `group.create`
- `targetType` (string, required)
- `targetId` (uuid/string, nullable)
- `groupId` (uuid, nullable)
- `outcome` (enum: `success` | `failure`, required)
- `ipAddress` (string, nullable)
- `userAgent` (string, nullable)
- `metadata` (jsonb, nullable)

## Relationships

- User (1) — (N) GroupMembership — (1) Group
- Group (1) — (N) Variable, Category, Template, SimulationRun
- Category (N) — (N) Variable via CategoryVariable
- Template (1) — (N) TemplateVersion
- TemplateVersion (1) — (N) SimulationRun
- SimulationRun (1) — (N) GeneratedDocument

## State Transitions

- Template editing: update Template → create new TemplateVersion (immutable) → audit `template.version.created`
- Rollback: select old TemplateVersion → create a new TemplateVersion copying that content → audit `template.version.restored`
- Simulation: `queued` → `running` → (`succeeded` | `failed`) with audit on start and finish

