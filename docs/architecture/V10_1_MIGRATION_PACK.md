# PayMap v10.1 Full Migration Pack

รอบนี้ย้ายแกน `auth + workspace + billing + planner` เข้าโครงสร้าง v10 มากขึ้นแบบ progressive migration

## สิ่งที่ย้ายจริง
- `src/features/auth/server/auth-service.ts`
  - login ด้วย email/password
  - register ด้วย email/password
  - firebase session sync
  - switch workspace account
- `src/features/workspace/server/workspace-service.ts`
  - workspace context builder
  - list/find mode accounts
- `src/features/billing/server/billing-service.ts`
  - billing portal
  - stripe checkout session
- `src/features/planner/server/planner-service.ts`
  - planner list/create

## API ใหม่
- `/api/billing/portal`
- `/api/billing/checkout`
- `/api/workspaces/context`
- `/api/workspaces/switch`

## Compatibility
route เดิมของ v9/v10 foundation ยังอยู่ แต่ถูกเปลี่ยนให้ delegate เข้า service layer ใหม่ เพื่อให้ migration ทำแบบค่อยเป็นค่อยไป

## จุดที่ยังไม่ได้ย้ายครบ 100%
- forgot/reset password
- stripe webhook
- planner update/delete routes
- workspace UI switcher ฝั่ง client ทั้งหมด
- billing UI ทุกจุดยังไม่ได้ย้ายหมดทุก fetch path
