---
description: Repository Information Overview
alwaysApply: true
---

# Morphic Information

## Summary
Morphic is an AI-powered search engine with a generative UI. It leverages the Vercel AI SDK to provide a streaming search experience with support for multiple AI providers (OpenAI, Anthropic, Google, Ollama) and various search engines (Tavily, Brave, SearXNG, Exa). The application features chat history, authentication via Supabase, and a modular architecture for AI agents and search tools.

## Structure
- **app/**: Next.js App Router containing pages, layouts, and API routes.
- **components/**: React components, including shadcn/ui primitives and feature-specific components like `artifact`, `sidebar`, and `chat`.
- **lib/**: Core application logic:
  - **agents/**: AI research and question generation agents.
  - **tools/**: Search and retrieval tool implementations.
  - **db/**: Database schema (Drizzle ORM) and migration logic.
  - **streaming/**: AI response stream handling.
- **drizzle/**: Database migrations and schema definitions.
- **docs/**: Project documentation (Configuration, Docker).
- **scripts/**: Utility scripts, including a chat CLI and performance testing tools.
- **public/**: Static assets like images and configuration files (`models/*.json`).

## Language & Runtime
**Language**: TypeScript  
**Version**: Node.js 22 (Build), Bun 1.2.12 (Runtime)  
**Build System**: Next.js 16 (App Router)  
**Package Manager**: Bun

## Dependencies
**Main Dependencies**:
- `next`: ^16.1.6
- `react`: ^19.2.0
- `ai`: ^6.0.64 (Vercel AI SDK)
- `drizzle-orm`: ^0.44.3
- `postgres`: ^3.4.5
- `@supabase/supabase-js`: ^2.49.4
- `tailwind-merge`: ^2.6.0
- `zod`: ^4.0.5

**AI & Search SDKs**:
- `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`
- `exa-js`: ^1.0.12
- `ollama-ai-provider-v2`: ^1.5.0

## Build & Installation
```bash
# Install dependencies
bun install

# Development server
bun dev

# Build for production
bun run build

# Start production server
bun start

# Database migrations
bun migrate
```

## Docker

**Dockerfile**: `./Dockerfile`
**Image**: `ghcr.io/miurla/morphic:latest`
**Configuration**: 
- Multi-stage build using `node:22-slim` for building and `oven/bun:1.2.12` for the runner.
- **Docker Compose**: Includes `morphic` app, `postgres:17-alpine`, `redis:alpine`, and `searxng/searxng`.
- **Environment**: Supports `ENABLE_AUTH` for Supabase authentication toggle and `DATABASE_URL` for PostgreSQL connection.

## Testing

**Framework**: Vitest
**Test Location**: `components/__tests__/` and `.test.ts(x)` files alongside source code.
**Naming Convention**: `*.test.ts`, `*.test.tsx`
**Configuration**: `vitest.config.mts`, `vitest.setup.ts`

**Run Command**:

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```
