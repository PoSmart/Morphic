# Morphic SaaS Transformation Plan

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Phase 1: Technical Specification (Hard)
Create a comprehensive technical specification for the SaaS transformation.
- Define updated Drizzle schema (User roles, Entity, Team, FavoriteList, ChatMessage, KbDoc).
- Plan Stripe integration for Italy (VAT 22%, SEPA, EUR, Metered billing).
- Design the Advanced Search UI with KPI filters (Revenue/Growth sliders).
- Design the Team & API quota management logic.
- Plan pgvector-based RAG integration for personal/team Knowledge Base.
- **Output**: Save to `/workspaces/Morphic/.zencoder/chats/ae142f5b-ba13-43e2-a40f-74ad4cf22d7a/spec.md`.

### [x] Phase 2: Data Model & Auth Extension
- Implement the new database schema with Drizzle.
- Extend Supabase auth with User Roles (Anon, Starter, Pro, Enterprise).
- Add usage tracking logic for search quotas.

### [x] Phase 3: Stripe Billing Integration
- Set up Stripe products/prices for Starter, Pro, Enterprise plans.
- Implement checkout and billing portal integrations.
- Configure webhooks for plan updates and usage metering.
- Handle Italian VAT (22%) and SEPA payments.

### [x] Phase 4: Advanced Search & Analysis UI
- Build the `/search` page with KPI sliders (Revenue/Growth).
- Implement List/Grid view toggle for entities.
- Create the `/analyze` dashboard with Tremor/Recharts for KPI visualization.
- Implement PDF/Slide export for analysis.

### [x] Phase 5: Favorites, Teams & Collaboration
- Implement `/favorites` with custom lists and Drag&Drop.
- Build the `/team` dashboard with email invites and member management.
- Add internal team chat with notifications.
- Implement API Key management with member-specific quotas.

### [x] Phase 6: Advanced AI (RAG) & Admin Panel
- Implement pgvector-based RAG for user/team knowledge bases.
- Build the `/admin` panel for Stripe analytics, user management, and KB uploads.
- Add "Morphic Builder" for custom workflow management.

### [x] Phase 7: Verification & Polishing
- Run full test suite (`bun run test`). [PASSED: 141 tests]
- Perform linting and type checking (`bun lint`, `bun typecheck`). [PASSED]
- Conduct manual verification of the end-to-end SaaS flow. [PASSED: DB Connected & Migrated]
- **Output**: Save report to `/workspaces/Morphic/.zencoder/chats/ae142f5b-ba13-43e2-a40f-74ad4cf22d7a/report.md`.

## Verification Report (2026-03-01)
- **Linting**: Fixed import sorting issues via `bun lint --fix`. Now passing.
- **Type Checking**: `bun typecheck` passed successfully.
- **Tests**: 141 tests passed successfully using `vitest`.
- **Migration**: Successfully completed using Supabase Transaction Pooler (IPv4). Missing SaaS tables were generated and pgvector enabled.
- **Navigation**: Integrated Search, Favorites, Team, and Admin into `AppSidebar` and `UserMenu`.
- **Data**: Seeded initial entities and connected `AdvancedSearch` to real database actions.
- **Server Actions**: Configured `allowedOrigins` in `next.config.mjs` to resolve "Invalid Server Actions request" errors in proxied environments.
