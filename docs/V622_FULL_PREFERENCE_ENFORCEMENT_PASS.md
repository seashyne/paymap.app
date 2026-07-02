# PayMap v6.2.2 Full Preference Enforcement Pass

สิ่งที่เพิ่มในรอบนี้
- redirect ผู้ใช้ที่ล็อกอินแล้วจาก landing page ไปยังหน้า default page ตาม UI preferences
- login และ firebase session จะใช้ default page จาก DB เมื่อไม่ได้ส่ง next path มา
- บังคับใช้ `showCharts` กับหน้า dashboard/report หลักและ widget สำคัญ
- เพิ่ม fallback state เมื่อปิด charts เพื่อให้หน้าจอไม่โล่งและยังพาไป Appearance settings ได้
- page/client components หลักที่รับ enforcement แล้ว: personal workspace dashboard, business dashboard, merchant dashboard, reports center, net worth, simulation, enterprise dashboard

หมายเหตุ
- enforcement รอบนี้เน้นหน้าหลักที่ผู้ใช้เข้าใช้จริงบ่อยที่สุดก่อน
- component chart ย่อยบางตัวในหน้ารองหรือ flow เก่าอาจยังไม่ได้ผูก preference ครบ 100%
- logic `defaultPage` ถูกทำแบบ mode-aware เพื่อกันไม่ให้ personal user ถูกส่งไป business/merchant page โดยตรง
