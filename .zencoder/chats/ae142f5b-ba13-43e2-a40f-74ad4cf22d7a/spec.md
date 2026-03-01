# Technical Specification: Morphic SaaS Transformation

## 1. Technical Context
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun 1.2.12
- **Database**: PostgreSQL with Drizzle ORM and `pgvector` extension
- **Authentication**: Supabase Auth
- **Billing**: Stripe (EUR, SEPA, Italian VAT 22%)
- **UI Components**: shadcn/ui, Tailwind CSS, Tremor/Recharts (Charts), Lucide (Icons)

## 2. Implementation Approach

### 2.1 Database Schema (Drizzle)
Extend `lib/db/schema.ts` with the following:
- `users_metadata`: Stores SaaS-specific user data (plan, stripe info, usage).
- `entities`: Stores company/project data with KPI JSON.
- `teams` & `team_members`: For collaboration and shared resources.
- `favorite_lists` & `favorite_entities`: For organized bookmarks with Drag&Drop support.
- `team_messages`: For internal team communication.
- `knowledge_base`: For RAG, including `embedding` column using `vector` type.

### 2.2 Authentication & Authorization
- Middleware-level checks for plan-based access.
- Anonymous mode allows 5 searches/day (tracked by IP or session).
- Registered users get quotas based on their Stripe subscription.

### 2.3 Stripe Integration
- **Products**: Starter (€9), Pro (€29), Enterprise (€99).
- **Tax**: Apply 22% Italian VAT.
- **Checkout**: Hosted Stripe Checkout for subscriptions.
- **Webhooks**: Update `users_metadata.plan` and `usage_limit` on successful payment/subscription change.

### 2.4 Advanced Search & Filtering
- New `/search` page layout with a sidebar for KPI filters (Revenue: €0-€100M+, Growth: 0-100%+).
- Toggle between `GridView` and `ListView` (Table).
- Sorting by KPI values.

### 2.5 Team & Collaboration
- Invitations system via email.
- Shared team dashboard for analysis and favorite lists.
- API quota allocation per team member.

### 2.6 AI RAG (pgvector)
- Integrate `pgvector` for semantic search across Knowledge Base documents.
- Use Morphic workflows to query both the web and the internal Knowledge Base.

## 3. Data Model Changes (Drizzle)

```typescript
// Proposed additions to schema.ts

export const plansEnum = pgEnum('plan', ['anon', 'starter', 'pro', 'enterprise'])

export const usersMetadata = pgTable('users_metadata', {
  id: varchar('id', { length: 255 }).primaryKey().references(() => authUsers.id),
  plan: plansEnum('plan').default('anon'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  usageLimit: integer('usage_limit').default(5),
  usageCurrent: integer('usage_current').default(0),
  lastResetAt: timestamp('last_reset_at').defaultNow()
})

export const entities = pgTable('entities', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  description: text('description'),
  sector: text('sector'),
  kpis: jsonb('kpis').$type<{
    revenue: number,
    growthRate: number,
    marketShare: number,
    churn: number
  }>(),
  createdAt: timestamp('created_at').defaultNow()
})

export const teams = pgTable('teams', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: text('name').notNull(),
  ownerId: varchar('owner_id', { length: 255 }).references(() => usersMetadata.id)
})

export const teamMembers = pgTable('team_members', {
  teamId: varchar('team_id', { length: 191 }).references(() => teams.id),
  userId: varchar('user_id', { length: 255 }).references(() => usersMetadata.id),
  role: text('role').default('member'),
  apiQuota: integer('api_quota').default(0)
})

export const favoriteLists = pgTable('favorite_lists', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => usersMetadata.id),
  teamId: varchar('team_id', { length: 191 }).references(() => teams.id),
  name: text('name').notNull()
})

export const favoriteEntities = pgTable('favorite_entities', {
  listId: varchar('list_id', { length: 191 }).references(() => favoriteLists.id),
  entityId: varchar('entity_id', { length: 191 }).references(() => entities.id),
  order: integer('order').notNull()
})

export const knowledgeBase = pgTable('knowledge_base', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => usersMetadata.id),
  teamId: varchar('team_id', { length: 191 }).references(() => teams.id),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 })
})
```

## 4. Interface Changes
- **Header**: Search bar + KPI filter toggles.
- **Sidebar**: User info, Plan status (Usage indicator 🟢/🔴), Team switcher, API keys.
- **Main Content**: `/search`, `/analyze`, `/compare`, `/favorites`.
- **Admin**: `/admin` with Stripe metrics and KB management.

## 5. Verification Approach
- **Unit Tests**: Test quota logic and plan-based access.
- **Integration Tests**: Stripe webhook handling simulation.
- **UI Tests**: Verify Slider interaction and Grid/List view switching.
- **Lint/Typecheck**: Ensure no regressions in existing Morphic functionality.
