# payMap v23 Architecture

Version: 2.3.0

## Product model

payMap v23 uses **one account, many workspaces**.

A single user account can own or join multiple workspaces:

- Personal workspace
- Merchant workspace
- Business workspace

The platform shares a common core:

- authentication
- billing
- notifications
- files / storage
- audit logs
- reports
- permissions

Product modules sit on top of the core:

- Personal module
- Merchant module
- Business module

## Architecture goals

1. Keep onboarding simple: create one workspace first.
2. Allow expansion later: add Merchant or Business without new account.
3. Gate features by workspace plan, not by user.
4. Make each product better than Excel through automation, validation, and dashboards.

## Route strategy

Recommended route layout:

- `/dashboard` -> legacy Personal workspace landing
- `/merchant` -> legacy Merchant landing
- `/business` -> legacy Business landing
- `/w/[slug]/dashboard` -> long-term workspace-aware route
- `/w/[slug]/settings`
- `/w/[slug]/billing`

Current project can keep legacy routes while gradually moving to `/w/[slug]/*`.

## Shared core services

### Auth service
- login
- register
- social auth
- session restore
- last active workspace

### Workspace service
- create workspace
- switch workspace
- list workspaces
- invite members
- member roles

### Billing service
- subscription per workspace
- invoices
- feature gates
- plan limits

### Files service
- receipts
- payslips
- reports
- imports

### Audit service
- actor
- action
- entity
- before/after
- workspace context

## Product modules

### Personal
- accounts
- transactions
- categories
- budgets
- savings goals
- recurring transactions
- tax helper
- monthly close reports

### Merchant
- stores
- products
- inventory
- stock movements
- customers
- sales
- suppliers
- purchase orders
- VAT reports
- analytics

### Business
- companies
- employees
- departments
- payroll runs
- payslips
- leave requests
- tax filings
- bank transfer batches

## Better than Excel principles

Each module should win against Excel by providing:

- automatic validation
- starter templates
- recurring workflows
- alerts and reminders
- dashboards and insights
- audit history
- export + collaboration

## Migration path from v22.3

### Phase 1
- keep current routes
- add shared plan-gate helpers
- add workspace registry
- add permission matrix
- add blueprint schema

### Phase 2
- move product logic into `src/features/*`
- introduce `/w/[slug]/*`
- move subscriptions from user-level to workspace-level

### Phase 3
- unify onboarding
- seed starter data per workspace type
- add background jobs / Redis queue

## Delivery included in v23 blueprint package

This version adds:

- architecture documentation
- route map
- permission matrix
- workspace registry helper
- feature gate helper
- starter module blueprints
- draft Prisma schema blueprint for workspace-first design

These additions are intentionally low-risk and do not overwrite current production routes yet.
