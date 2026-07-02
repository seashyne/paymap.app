# PayMap v15.2.1 — Build-fix and Route Audit Pass

สิ่งที่ปรับในรอบนี้

- ขยาย auth guard ใน middleware ให้ครอบคลุม `/analytics`, `/planner`, `/tax`, `/workspace`, `/enterprise`, `/admin` และ route ย่อยสำคัญ
- ขยาย `requestedWorkspace()` ให้รู้จัก personal/business/merchant/enterprise/admin ครบตาม route matrix
- เปลี่ยน desktop-only policy ให้พา mobile/iPad ไป `/download` สำหรับทุกหน้าเว็บ ยกเว้น asset และ API
- เพิ่ม helper กลาง `src/lib/desktop-only.ts` เพื่อใช้ร่วมกันทั้ง server/client guard
- เพิ่ม `src/lib/v152-flow-audit.ts` สำหรับสรุปสถานะ wiring ของ route matrix รอบ v15.2
- อัปเดตหน้า `/status` ให้สะท้อนการตรวจ route coverage ของ v15.2

สิ่งที่ยังต้อง verify ใน environment จริง

- `next build` หลังติดตั้ง dependencies และรัน `prisma generate`
- env ของ auth, database, email, stripe, firebase, r2, redis
- flow เชิงลึกของ enterprise aggregate reports และ admin saas metrics
- route ที่เป็น UI-heavy/analytics-heavy ซึ่งต้องมี data จริงก่อนจึงจะตรวจครบได้
