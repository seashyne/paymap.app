# PayMap v7.2.1 — Public/Auth Surface Rewrite

รุ่นนี้เก็บหน้า public และ auth ให้มี visual language เดียวกับ v7.2 มากขึ้น โดยเน้นหน้า:

- /login
- /register
- /pricing
- /help
- /legal
- /terms
- /privacy

## สิ่งที่เปลี่ยน

- เพิ่ม shared component `src/components/public/PublicShell.tsx`
- เพิ่ม utility classes สำหรับ public/auth surface ใน `src/app/globals.css`
- rewrite หน้า login และ register ให้ใช้ shell เดียวกับหน้าสาธารณะ
- rewrite หน้า pricing, help, legal, privacy และ terms ให้ใช้ header/footer/spacing/typography เดียวกัน
- อัปเดต version เป็น 7.2.1

## หมายเหตุ

รอบนี้เป็นการยกหน้า public/auth ให้เข้าชุดกับ product UI โดยไม่ไปเปลี่ยน flow การทำงานหลักของฟอร์มและ API เพื่อจำกัด regression risk.
