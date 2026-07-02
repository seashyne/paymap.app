# PayMap v10 Production Architecture

## Goals
- Full SaaS architecture
- Clean folder structure
- Scale path toward 100k users
- Easy developer maintenance

## Layers
1. `src/app` — route layer and page composition
2. `src/features` — product modules and feature-owned UI/server glue
3. `src/shared` — reusable design system, common schemas, common utilities
4. `src/server` — database access, services, background jobs, audit, analytics
5. `src/middleware` — auth, workspace, rate-limit gates
6. `src/instrumentation` — monitoring and tracing entrypoints

## Core principles
- Every business write path goes through service layer
- Every multi-tenant entity is keyed by `workspaceId`
- Route handlers stay thin
- Shared UI tokens are centralized
- Background work leaves request lifecycle
- Observability is first-class
