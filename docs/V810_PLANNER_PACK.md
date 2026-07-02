# PayMap v8.1 Planner Pack

This pack adds three planner-oriented surfaces without introducing new database tables:

- `/planner` personal planner
- `/business/calendar` business operations calendar
- `/merchant/reminders` merchant restock & sales reminders

## What it uses

The pages read from existing models already present in the app:

- subscriptions
- installments
- loans
- budgets
- transactions with notes
- payroll runs
- invoices
- leave requests
- merchant products
- purchase orders
- sales orders
- vat reports

## Intent

The pack keeps the implementation low-risk by reusing current data and surfacing it in a planning-friendly UI rather than adding a brand-new planner persistence system.
