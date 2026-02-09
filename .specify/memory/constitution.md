<!--
Sync Impact Report

- Version change: template (unversioned) → 1.0.0
- Modified principles: Template placeholders → concrete principles (new set)
- Added sections: None (filled existing template sections)
- Removed sections: None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md (removed broken reference to missing commands docs)
	- ⚠ pending: .specify/templates/commands/*.md (folder missing; create if you want command docs in-repo)
- Follow-up TODOs: None
-->

# Painel Admin Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)
All work MUST be driven by written intent (spec → plan → tasks) before code changes.

- Every change MUST trace to a spec, task, or bug report with clear acceptance criteria.
- “Vibe coding” is only allowed inside the boundaries of the spec; if the spec is unclear,
	update it first.
- Requirements MUST be phrased as testable statements (Given/When/Then, assertions, or
	measurable outcomes).
- Scope creep MUST be rejected or explicitly re-scoped in the spec/plan.

Rationale: The admin panel is high-impact; spec-driven work reduces regressions and
unreviewable complexity.

### II. Code Quality & SOLID by Default
Code MUST be readable, modular, and refactor-friendly.

- Modules/classes/functions MUST have a single responsibility and clear boundaries.
- Dependencies MUST point inward (Dependency Inversion): UI depends on interfaces/services,
	not the other way around.
- Prefer composition over inheritance; avoid “god” services/components.
- Shared utilities MUST be truly cross-cutting; otherwise keep logic near the feature.
- Lint/format tooling MUST be enabled for all supported languages in this repo.
- Public APIs (internal packages/modules, routes, contracts) MUST be documented and stable.

Rationale: Admin systems evolve quickly; SOLID design keeps change cheap and safe.

### III. Security First (Admin Panel = High Privilege)
Security is a feature. The admin panel MUST be designed as a high-privilege surface.

- Authentication and authorization MUST be enforced server-side for every action.
- Authorization MUST be explicit and least-privilege (RBAC/ABAC); no “frontend-only” gating.
- Inputs MUST be validated and normalized at trust boundaries (API, forms, webhooks).
- Secrets MUST never be committed; configuration MUST use environment variables/secret stores.
- Sensitive actions MUST be auditable (who/what/when/where) and tamper-resistant.
- Data exposure MUST be minimized (PII masking/redaction, scoped queries, secure defaults).
- Dependencies MUST be kept current; known critical vulnerabilities MUST be addressed before
	release.

Rationale: Admin features can exfiltrate data or alter business state; prevention and audit
are mandatory.

### IV. Performance & Reliability Budgets
Performance and reliability MUST be treated as product requirements.

- Define and respect budgets (latency, payload size, memory) for core admin flows.
- Avoid N+1 queries and unbounded lists; pagination/limits are mandatory for large datasets.
- Expensive operations MUST provide safe UX (progress, cancellation where applicable,
	idempotency, and clear failure handling).
- Errors MUST be handled deterministically with actionable messages for users and structured
	details for logs.

Rationale: Admin users often operate on large datasets; slow tools cause operational risk.

### V. UX Consistency & Accessibility
The admin panel MUST feel cohesive and predictable.

- Reuse the established design system/components; avoid one-off patterns.
- Navigation, page layout, forms, and tables MUST follow consistent conventions.
- Destructive actions MUST be clearly indicated and protected (confirmation and/or undo
	depending on context).
- Accessibility MUST be considered (keyboard navigation, focus management, labels, contrast,
	error messaging).

Rationale: Consistency reduces training/support costs and prevents dangerous mistakes.

## Administrative Panel Standards

- Access control: Every view and action MUST have an explicit permission requirement.
- Auditability: Create/update/delete, role/permission changes, and data exports MUST produce
	audit logs.
- Safety: Bulk operations MUST have guardrails (preview counts, confirmation, and clear
	failure reporting).
- Data handling: Exports/downloads MUST be access-controlled, logged, and scoped.
- Observability: The system MUST emit enough logs/metrics to debug production issues without
	reproducing locally.
- Compatibility: Changes MUST not break existing workflows without a migration plan.

## Development Workflow & Quality Gates

- Definition of Done (DoD) MUST include: spec alignment, code review, lint/format passing,
	and updated docs where behavior changes.
- Reviews MUST check for: SOLID boundaries, security gates, performance concerns, and UX
	consistency.
- Tests SHOULD be added when they materially reduce risk. At minimum, add tests for:
	authorization rules, critical admin flows, and bug regressions.
- Breaking changes MUST be flagged early and communicated; introduce migrations/adapters
	where feasible.
- Refactors MUST be behavior-preserving and split from feature work when it improves review
	clarity.

## Governance

- This constitution supersedes local habits and individual preferences.
- Every feature plan MUST include a “Constitution Check” gate and record any violations plus
	justification.
- Amendment process:
	- Propose change as a PR editing this file.
	- Include rationale, impact assessment, and any required migrations.
	- Require approval from project maintainers/owners.
- Versioning policy (Semantic Versioning):
	- MAJOR: Backward-incompatible governance change or principle removal/redefinition.
	- MINOR: New principle/section added or materially expanded guidance.
	- PATCH: Clarifications, typo fixes, non-semantic refinements.
- Compliance expectation: PRs SHOULD reference which principles are relevant; reviewers MAY
	request explicit mapping for risky changes (security/performance/admin permissions).

**Version**: 1.0.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-09
