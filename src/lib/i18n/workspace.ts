import type { SiteLang } from "@/lib/i18n/site"

const workspaceMessages = {
  en: {
    common: {
      overview: "Overview", payroll: "Payroll", accounting: "Accounting", invoices: "Invoices", reconciliation: "Reconciliation",
      controls: "Controls", reports: "Reports", legalCenter: "Legal center", business: "Business", merchant: "Merchant", enterprise: "Enterprise",
      setup: "Setup", ready: "Ready", linked: "Linked", live: "Live", locked: "Locked", required: "required",
      organizations: "Organizations", employees: "Employees", pendingLeave: "Pending leave", currentRun: "Current run", monthlyReports: "Monthly reports", journalEntries: "Journal entries"
    },
    business: {
      title: "Business", subtitle: "Team finance, payroll, accounting, and approvals in one desktop workspace.",
      heroEyebrow: "Business workspace", heroTitle: "Run payroll, approvals, and accounting from one workspace", heroDescription: "A clearer desktop surface for team operations, finance review, and policy-sensitive tasks.",
      links: [
        ["Go to payroll", "Manage employees, leave, and payroll runs from one operational flow."],
        ["Financial reports", "Open business financial reporting and month-end review."],
        ["Plan and feature access", "Review your plan, locked modules, and upgrade requirements."],
      ],
      sectionTitle: "Business operating system", sectionBody: "Bring overview, consent, payroll, accounting, and plan controls together in a cleaner desktop layout.",
      overviewTitle: "Business tools that stay clear as your team grows",
      overviewBody: "Use payroll and core team workflows for free, then unlock accounting, reconciliation, and advanced controls when your business is ready.",
      checklist: [
        ["Free plan stays practical", "Core employee and payroll workflows remain available from day one."],
        ["Accounting gates stay clear", "Advanced accounting and reconciliation remain tied to the right plans."],
        ["Desktop-first structure", "High-frequency actions stay visible and easier to review on large screens."],
      ],
      accounting: {
        title: "Business Accounting", subtitle: "Accounting connected to payroll, invoices, and financial reports in one workspace.",
        heroTitle: "Keep accounting, journals, and close tasks in one place",
        heroBody: "Review chart of accounts, journals, invoices, and reports without jumping across disconnected tools.",
        lockTitle: "Business Accounting is not included in this plan",
        lockBody: "Business Free still covers payroll basics and lightweight invoicing. Full accounting, close, and statements unlock on Business SME and above.",
        moduleTitle: "Accounting modules", moduleBody: "Open the work you need faster with naming that matches the latest product language.",
      },
      payrollPage: {
        title: "Business Payroll", subtitle: "Employees, leave, and payroll execution from one business workspace.",
        moduleTitle: "Operational payroll flows", moduleBody: "Keep HR records, leave requests, and payroll actions together for day-to-day work.",
      },
      invoicesPage: {
        title: "Business Invoices", subtitle: "Create and track invoices in a simpler receivables workflow." },
      reconciliationPage: {
        title: "Business Reconciliation", subtitle: "Review statement matching and month-end checks in one desktop flow." },
    },
    merchant: {
      title: "Merchant", subtitle: "Sales, inventory, accounting, and reminders for stores and everyday operations.",
      heroEyebrow: "Merchant workspace", heroTitle: "Keep store operations clear from inventory to daily sales", heroDescription: "A desktop-friendly workspace for point-of-sale, inventory health, and merchant reporting.",
      accounting: { title: "Merchant Accounting", subtitle: "Connect store accounting, invoices, and reconciliation from one merchant workspace." },
      inventory: { title: "Merchant Inventory", subtitle: "Track products, stock moves, and supplier details in one inventory workspace." },
      sales: { title: "Merchant Sales", subtitle: "Review daily sales, orders, and revenue trends from one merchant dashboard." },
      reconciliation: { title: "Merchant Reconciliation", subtitle: "Match store transactions and ledgers before you close the period." },
    },
    enterprise: {
      title: "Enterprise", subtitle: "Governance, reporting, and oversight across multiple organizations.",
      heroEyebrow: "Enterprise workspace", heroTitle: "Give leadership a cleaner view of controls and reporting", heroDescription: "Keep governance, cross-organization visibility, and reporting access structured for desktop use.",
      controls: { title: "Enterprise Controls", subtitle: "Organizations, memberships, approvals, and policy controls in one place.", lockTitle: "Enterprise Controls require an Enterprise plan", lockBody: "Governance, registry, approvals, and member management are reserved for Enterprise customers." },
      reports: { title: "Enterprise Reports", subtitle: "Executive reporting and cross-organization financial coverage.", lockTitle: "Enterprise Reports require an Enterprise plan", lockBody: "Cross-organization reporting, executive dashboards, and multi-entity close are reserved for Enterprise customers." },
    },
    workbench: {
      employeeLifecycle: ["Employee lifecycle", "Create, update, and archive team records from one workspace so payroll always uses current data."],
      payrollWorkbench: ["Payroll workbench", "Create an organization first to start payroll operations."],
      inventoryCatalog: ["Product catalog", "Create products with pricing and opening stock so your store can start tracking inventory immediately."],
      inventoryAdjust: ["Inventory adjustment", "Record stock-in, stock-out, returns, and manual adjustments from one place."],
      productLifecycle: ["Product lifecycle", "Update prices, thresholds, and archive products without leaving the dashboard."],
      supplierCreate: ["Create supplier", "Add supplier records for purchasing and inventory operations."],
      save: "Save", cancel: "Cancel", edit: "Edit", archive: "Archive", addEmployee: "Add employee", addProduct: "Add product", saveMove: "Save inventory move", addSupplier: "Add supplier",
      noOrganization: "No organization found for this business workspace yet.",
      noProducts: "Add at least one product first.",
      noSuppliers: "No suppliers yet.",
      noEmployees: "No employees yet.",
      successEmployee: "Employee added successfully", successProduct: "Product added successfully", successAdjust: "Inventory updated successfully", successSupplier: "Supplier added successfully",
      actionFailed: "Action failed",
    },
  },
  th: {
    common: {
      overview: "ภาพรวม", payroll: "เงินเดือน", accounting: "บัญชี", invoices: "ใบแจ้งหนี้", reconciliation: "กระทบยอด", controls: "การควบคุม", reports: "รายงาน", legalCenter: "ศูนย์กฎหมาย", business: "ธุรกิจ", merchant: "ร้านค้า", enterprise: "องค์กร", setup: "ตั้งค่า", ready: "พร้อม", linked: "เชื่อมแล้ว", live: "ใช้งานจริง", locked: "ล็อก", required: "ต้องใช้", organizations: "องค์กร", employees: "พนักงาน", pendingLeave: "คำขอลาที่ค้าง", currentRun: "รอบปัจจุบัน", monthlyReports: "รายงานรายเดือน", journalEntries: "สมุดรายวัน"
    },
    business: {
      title: "ธุรกิจ", subtitle: "การเงินทีม เงินเดือน บัญชี และการอนุมัติในพื้นที่ทำงานเดียวสำหรับ PC",
      heroEyebrow: "พื้นที่ธุรกิจ", heroTitle: "จัดการเงินเดือน การอนุมัติ และบัญชีจากพื้นที่เดียว", heroDescription: "มุมมองเดสก์ท็อปที่ชัดขึ้นสำหรับงานทีม การทบทวนการเงิน และงานที่เกี่ยวกับนโยบาย",
      links: [["ไปที่เงินเดือน", "จัดการพนักงาน การลา และรอบเงินเดือนจาก flow เดียว"],["รายงานการเงิน", "เปิดรายงานการเงินและการปิดงวดของธุรกิจ"],["แพ็กเกจและสิทธิ์ใช้งาน", "ตรวจแพ็กเกจ โมดูลที่ถูกล็อก และเงื่อนไขการอัปเกรด"]],
      sectionTitle: "ระบบปฏิบัติการธุรกิจ", sectionBody: "รวมภาพรวม การยินยอม เงินเดือน บัญชี และการควบคุมแพ็กเกจไว้ในมุมมองเดสก์ท็อปที่ชัดกว่าเดิม",
      overviewTitle: "เครื่องมือธุรกิจที่ยังชัดเจนแม้ทีมของคุณเติบโต", overviewBody: "ใช้งานเงินเดือนและ workflow หลักของทีมได้ฟรีก่อน แล้วค่อยปลดล็อกบัญชี กระทบยอด และการควบคุมขั้นสูงเมื่อธุรกิจพร้อม",
      checklist: [["แผนฟรียังใช้งานได้จริง", "workflow พนักงานและเงินเดือนหลักยังเริ่มใช้งานได้ตั้งแต่วันแรก"],["เงื่อนไขบัญชีชัดเจน", "บัญชีและการกระทบยอดขั้นสูงยังผูกกับแพ็กเกจที่เหมาะสม"],["ออกแบบเพื่อเดสก์ท็อป", "งานที่ใช้บ่อยยังมองเห็นและตรวจทานได้ง่ายบนจอใหญ่"]],
      accounting: { title: "บัญชีธุรกิจ", subtitle: "ระบบบัญชีที่เชื่อมกับเงินเดือน ใบแจ้งหนี้ และรายงานการเงินในหน้าจอเดียว", heroTitle: "รวมบัญชี สมุดรายวัน และงานปิดงวดไว้ในที่เดียว", heroBody: "ดูผังบัญชี สมุดรายวัน ใบแจ้งหนี้ และรายงานโดยไม่ต้องสลับหลายเครื่องมือ", lockTitle: "แผนนี้ยังไม่รวมบัญชีธุรกิจ", lockBody: "Business Free ยังใช้ payroll พื้นฐานและใบแจ้งหนี้แบบเบาได้ ส่วนบัญชีเต็ม การปิดงวด และงบการเงินจะปลดล็อกใน Business SME ขึ้นไป", moduleTitle: "โมดูลบัญชี", moduleBody: "เปิดงานที่ต้องใช้ได้เร็วขึ้นด้วยชื่อที่ตรงกับภาษาของระบบล่าสุด" },
      payrollPage: { title: "เงินเดือนธุรกิจ", subtitle: "พนักงาน การลา และการรันเงินเดือนจากพื้นที่ธุรกิจเดียว", moduleTitle: "งานปฏิบัติการเงินเดือน", moduleBody: "รวมข้อมูล HR คำขอลา และงานเงินเดือนไว้ในที่เดียวสำหรับการทำงานทุกวัน" },
      invoicesPage: { title: "ใบแจ้งหนี้ธุรกิจ", subtitle: "สร้างและติดตามใบแจ้งหนี้ใน workflow ลูกหนี้ที่ใช้ง่ายขึ้น" },
      reconciliationPage: { title: "กระทบยอดธุรกิจ", subtitle: "ตรวจ statement และงานปิดงวดใน flow เดสก์ท็อปเดียว" },
    },
    merchant: { title: "ร้านค้า", subtitle: "ยอดขาย สต็อก บัญชี และงานประจำวันของร้านในพื้นที่เดียว", heroEyebrow: "พื้นที่ร้านค้า", heroTitle: "ดูงานหน้าร้านให้ชัดตั้งแต่สต็อกถึงยอดขายประจำวัน", heroDescription: "พื้นที่ทำงานแบบเดสก์ท็อปสำหรับ POS สุขภาพสต็อก และรายงานร้านค้า", accounting: { title: "บัญชีร้านค้า", subtitle: "เชื่อมบัญชีร้านค้า ใบแจ้งหนี้ และการกระทบยอดจากพื้นที่เดียว" }, inventory: { title: "สต็อกร้านค้า", subtitle: "ติดตามสินค้า การเคลื่อนไหวสต็อก และข้อมูลซัพพลายเออร์ในพื้นที่เดียว" }, sales: { title: "ยอดขายร้านค้า", subtitle: "ดูยอดขาย ออเดอร์ และแนวโน้มรายได้ประจำวันจากแดชบอร์ดร้านค้า" }, reconciliation: { title: "กระทบยอดร้านค้า", subtitle: "จับคู่ธุรกรรมร้านค้าและบัญชีก่อนปิดงวด" } },
    enterprise: { title: "องค์กร", subtitle: "การกำกับดูแล รายงาน และการมองภาพรวมหลายองค์กร", heroEyebrow: "พื้นที่องค์กร", heroTitle: "ให้ผู้บริหารเห็นการควบคุมและรายงานได้ชัดขึ้น", heroDescription: "จัด governance ภาพรวมข้ามองค์กร และสิทธิ์การเข้าถึงรายงานให้เหมาะกับการทำงานบนเดสก์ท็อป", controls: { title: "การควบคุมองค์กร", subtitle: "องค์กร สมาชิก การอนุมัติ และนโยบายในที่เดียว", lockTitle: "การควบคุมองค์กรต้องใช้แผน Enterprise", lockBody: "governance, registry, approvals และการจัดการสมาชิกสงวนไว้สำหรับลูกค้า Enterprise" }, reports: { title: "รายงานองค์กร", subtitle: "รายงานผู้บริหารและภาพรวมการเงินข้ามองค์กร", lockTitle: "รายงานองค์กรต้องใช้แผน Enterprise", lockBody: "รายงานข้ามองค์กร แดชบอร์ดผู้บริหาร และการปิดงวดหลายหน่วยงานสงวนไว้สำหรับ Enterprise" } },
    workbench: { employeeLifecycle: ["วงจรพนักงาน", "สร้าง แก้ไข และ archive ข้อมูลทีมจากพื้นที่เดียวเพื่อให้เงินเดือนใช้ข้อมูลล่าสุดเสมอ"], payrollWorkbench: ["พื้นที่ทำงานเงินเดือน", "ต้องมีองค์กรก่อนจึงจะเริ่มงานเงินเดือนได้"], inventoryCatalog: ["คลังสินค้า", "สร้างสินค้า ราคา และสต็อกเริ่มต้นเพื่อเริ่มติดตามสินค้าได้ทันที"], inventoryAdjust: ["ปรับสต็อก", "บันทึก stock-in, stock-out, return และการปรับยอดจากหน้าจอเดียว"], productLifecycle: ["วงจรสินค้า", "แก้ราคา threshold และ archive สินค้าได้โดยไม่ต้องออกจากแดชบอร์ด"], supplierCreate: ["เพิ่มซัพพลายเออร์", "เพิ่มข้อมูลซัพพลายเออร์สำหรับงานจัดซื้อและสต็อก"], save: "บันทึก", cancel: "ยกเลิก", edit: "แก้ไข", archive: "เก็บถาวร", addEmployee: "เพิ่มพนักงาน", addProduct: "เพิ่มสินค้า", saveMove: "บันทึกการเคลื่อนไหวสต็อก", addSupplier: "เพิ่มซัพพลายเออร์", noOrganization: "ยังไม่พบองค์กรสำหรับพื้นที่ธุรกิจนี้", noProducts: "เพิ่มสินค้าอย่างน้อย 1 รายการก่อน", noSuppliers: "ยังไม่มีซัพพลายเออร์", noEmployees: "ยังไม่มีพนักงาน", successEmployee: "เพิ่มพนักงานเรียบร้อย", successProduct: "เพิ่มสินค้าเรียบร้อย", successAdjust: "ปรับสต็อกเรียบร้อย", successSupplier: "เพิ่มซัพพลายเออร์เรียบร้อย", actionFailed: "ทำรายการไม่สำเร็จ" },
  },
  lo: {
    common: { overview: "ພາບລວມ", payroll: "ເງິນເດືອນ", accounting: "ບັນຊີ", invoices: "ໃບແຈ້ງໜີ້", reconciliation: "ກະທົບຍອດ", controls: "ການຄວບຄຸມ", reports: "ລາຍງານ", legalCenter: "ສູນກົດໝາຍ", business: "ທຸລະກິດ", merchant: "ຮ້ານຄ້າ", enterprise: "ອົງກອນ", setup: "ຕັ້ງຄ່າ", ready: "ພ້ອມ", linked: "ເຊື່ອມແລ້ວ", live: "ໃຊ້ງານ", locked: "ລັອກ", required: "ຕ້ອງການ", organizations: "ອົງກອນ", employees: "ພະນັກງານ", pendingLeave: "ການລາຄ້າງ", currentRun: "ຮອບປັດຈຸບັນ", monthlyReports: "ລາຍງານປະຈໍາເດືອນ", journalEntries: "ລາຍການບັນທຶກ" },
    business: { title: "ທຸລະກິດ", subtitle: "ການເງິນທີມ ເງິນເດືອນ ບັນຊີ ແລະການອະນຸມັດໃນພື້ນທີ່ດຽວ", heroEyebrow: "ພື້ນທີ່ທຸລະກິດ", heroTitle: "ຈັດການເງິນເດືອນ ການອະນຸມັດ ແລະບັນຊີໃນພື້ນທີ່ດຽວ", heroDescription: "ມຸມມອງແບບ desktop ສໍາລັບວຽກທີມ ແລະການກວດສອບການເງິນ", links: [["ໄປຫາເງິນເດືອນ", "ຈັດການພະນັກງານ ການລາ ແລະຮອບເງິນເດືອນໃນ flow ດຽວ"],["ລາຍງານການເງິນ", "ເປີດລາຍງານການເງິນ ແລະການປິດງວດ"],["ແຜນ ແລະ ສິດການໃຊ້", "ກວດສອບແຜນ ໂມດູນທີ່ຖືກລັອກ ແລະ ການອັບເກຣດ"]], sectionTitle: "ລະບົບປະຕິບັດການທຸລະກິດ", sectionBody: "ຮວມພາບລວມ ການຍິນຍອມ ເງິນເດືອນ ບັນຊີ ແລະ ການຄວບຄຸມແຜນໄວ້ໃນມຸມມອງດຽວ", overviewTitle: "ເຄື່ອງມືທຸລະກິດທີ່ຊັດເຈນເມື່ອທີມເຕີບໂຕ", overviewBody: "ເລີ່ມໃຊ້ເງິນເດືອນ ແລະ workflow ຫຼັກໄດ້ຟຣີ ແລ້ວຄ່ອຍປົດລັອກບັນຊີ ແລະ ການກະທົບຍອດ", checklist: [["ແຜນຟຣີຍັງໃຊ້ງານໄດ້ຈິງ", "workflow ພະນັກງານ ແລະ ເງິນເດືອນຫຼັກເລີ່ມໄດ້ທັນທີ"],["ການລັອກບັນຊີຊັດເຈນ", "ບັນຊີຂັ້ນສູງ ແລະ ການກະທົບຍອດຍັງຢູ່ໃນແຜນທີ່ເໝາະສົມ"],["ອອກແບບສໍາລັບ desktop", "ວຽກທີ່ໃຊ້ບໍ່ຂາດຢູ່ໃນສາຍຕາແລະກວດທານງ່າຍ"]], accounting: { title: "ບັນຊີທຸລະກິດ", subtitle: "ລະບົບບັນຊີທີ່ເຊື່ອມກັບເງິນເດືອນ ໃບແຈ້ງໜີ້ ແລະລາຍງານການເງິນ", heroTitle: "ຮວມບັນຊີ ບັນທຶກ ແລະ ວຽກປິດງວດໄວ້ໃນບ່ອນດຽວ", heroBody: "ເບິ່ງຜັງບັນຊີ ລາຍການ ໃບແຈ້ງໜີ້ ແລະ ລາຍງານໂດຍບໍ່ຕ້ອງສະຫຼັບເຄື່ອງມື", lockTitle: "ແຜນນີ້ຍັງບໍ່ລວມບັນຊີທຸລະກິດ", lockBody: "Business Free ຍັງໃຊ້ payroll ພື້ນຖານ ແລະ ໃບແຈ້ງໜີ້ແບບເບົາໄດ້ ແຕ່ບັນຊີເຕັມ ແລະ ງົບການເງິນຈະເປີດໃນ Business SME+", moduleTitle: "ໂມດູນບັນຊີ", moduleBody: "ເຂົ້າເຖິງວຽກໄດ້ໄວຂຶ້ນດ້ວຍຊື່ທີ່ກົງກັບພາສາຂອງລະບົບ" }, payrollPage: { title: "ເງິນເດືອນທຸລະກິດ", subtitle: "ພະນັກງານ ການລາ ແລະການຮັນເງິນເດືອນໃນພື້ນທີ່ດຽວ", moduleTitle: "workflow ເງິນເດືອນ", moduleBody: "ຮວມຂໍ້ມູນ HR ຄໍາຂໍລາ ແລະ ວຽກເງິນເດືອນໄວ້ນໍາກັນ" }, invoicesPage: { title: "ໃບແຈ້ງໜີ້ທຸລະກິດ", subtitle: "ສ້າງ ແລະ ຕິດຕາມໃບແຈ້ງໜີ້ໄດ້ງ່າຍຂຶ້ນ" }, reconciliationPage: { title: "ກະທົບຍອດທຸລະກິດ", subtitle: "ກວດ statement ແລະ ວຽກປິດງວດໃນ flow ດຽວ" } },
    merchant: { title: "ຮ້ານຄ້າ", subtitle: "ຍອດຂາຍ ສະຕ໋ອກ ບັນຊີ ແລະ ວຽກປະຈໍາວັນຂອງຮ້ານ", heroEyebrow: "ພື້ນທີ່ຮ້ານຄ້າ", heroTitle: "ເບິ່ງວຽກໜ້າຮ້ານໃຫ້ຊັດ ຈາກສະຕ໋ອກເຖິງຍອດຂາຍ", heroDescription: "ພື້ນທີ່ desktop ສໍາລັບ POS ສຸຂະພາບສະຕ໋ອກ ແລະ ລາຍງານຮ້ານ", accounting: { title: "ບັນຊີຮ້ານຄ້າ", subtitle: "ເຊື່ອມບັນຊີ ໃບແຈ້ງໜີ້ ແລະ ການກະທົບຍອດ" }, inventory: { title: "ສະຕ໋ອກຮ້ານຄ້າ", subtitle: "ຕິດຕາມສິນຄ້າ ການເຄື່ອນໄຫວສະຕ໋ອກ ແລະ ຜູ້ສະໜອງ" }, sales: { title: "ຍອດຂາຍຮ້ານຄ້າ", subtitle: "ເບິ່ງຍອດຂາຍ ອໍເດີ ແລະ ແນວໂນ້ມລາຍຮັບ" }, reconciliation: { title: "ກະທົບຍອດຮ້ານຄ້າ", subtitle: "ຈັບຄູ່ທຸລະກໍາຮ້ານ ແລະ ບັນຊີກ່ອນປິດງວດ" } },
    enterprise: { title: "ອົງກອນ", subtitle: "ການກຳກັບ ລາຍງານ ແລະ ການຄວບຄຸມຂ້າມຫຼາຍອົງກອນ", heroEyebrow: "ພື້ນທີ່ອົງກອນ", heroTitle: "ໃຫ້ຜູ້ບໍລິຫານເຫັນການຄວບຄຸມ ແລະ ລາຍງານໄດ້ຊັດຂຶ້ນ", heroDescription: "ຈັດ governance ການເຂົ້າເຖິງລາຍງານ ແລະ ການເບິ່ງຂ້າມອົງກອນໃຫ້ເໝາະກັບ desktop", controls: { title: "ການຄວບຄຸມອົງກອນ", subtitle: "ອົງກອນ ສະມາຊິກ ການອະນຸມັດ ແລະ ນະໂຍບາຍໃນບ່ອນດຽວ", lockTitle: "ການຄວບຄຸມອົງກອນຕ້ອງໃຊ້ Enterprise", lockBody: "governance ແລະ ການຈັດການສະມາຊິກສຳລັບລູກຄ້າ Enterprise" }, reports: { title: "ລາຍງານອົງກອນ", subtitle: "ລາຍງານຜູ້ບໍລິຫານ ແລະ ພາບກວ້າງຂ້າມອົງກອນ", lockTitle: "ລາຍງານອົງກອນຕ້ອງໃຊ້ Enterprise", lockBody: "ລາຍງານຂ້າມອົງກອນ ແລະ dashboard ຜູ້ບໍລິຫານສະຫງວນໄວ້ສໍາລັບ Enterprise" } },
    workbench: { employeeLifecycle: ["ວົງຈອນພະນັກງານ", "ສ້າງ ແກ້ໄຂ ແລະ ເກັບຖາວອນຂໍ້ມູນທີມງານໃນພື້ນທີ່ດຽວ"], payrollWorkbench: ["ພື້ນທີ່ເງິນເດືອນ", "ຕ້ອງມີອົງກອນກ່ອນຈຶ່ງຈະເລີ່ມວຽກໄດ້"], inventoryCatalog: ["ລາຍການສິນຄ້າ", "ສ້າງສິນຄ້າ ລາຄາ ແລະ ສະຕ໋ອກເລີ່ມຕົ້ນເພື່ອເລີ່ມຕິດຕາມສະຕ໋ອກ"], inventoryAdjust: ["ການປັບສະຕ໋ອກ", "ບັນທຶກເຂົ້າ ອອກ ຄືນ ແລະ ການປັບດ້ວຍມື"], productLifecycle: ["ວົງຈອນສິນຄ້າ", "ປັບລາຄາ ຈຸດເຕືອນ ແລະ ເກັບຖາວອນສິນຄ້າໂດຍບໍ່ອອກຈາກ dashboard"], supplierCreate: ["ເພີ່ມຜູ້ສະໜອງ", "ເພີ່ມຂໍ້ມູນຜູ້ສະໜອງສໍາລັບວຽກຈັດຊື້"], save: "ບັນທຶກ", cancel: "ຍົກເລີກ", edit: "ແກ້ໄຂ", archive: "ເກັບຖາວອນ", addEmployee: "ເພີ່ມພະນັກງານ", addProduct: "ເພີ່ມສິນຄ້າ", saveMove: "ບັນທຶກການເຄື່ອນໄຫວສະຕ໋ອກ", addSupplier: "ເພີ່ມຜູ້ສະໜອງ", noOrganization: "ຍັງບໍ່ພົບອົງກອນສໍາລັບພື້ນທີ່ນີ້", noProducts: "ເພີ່ມສິນຄ້າຢ່າງນ້ອຍ 1 ລາຍການກ່ອນ", noSuppliers: "ຍັງບໍ່ມີຜູ້ສະໜອງ", noEmployees: "ຍັງບໍ່ມີພະນັກງານ", successEmployee: "ເພີ່ມພະນັກງານສໍາເລັດ", successProduct: "ເພີ່ມສິນຄ້າສໍາເລັດ", successAdjust: "ປັບສະຕ໋ອກສໍາເລັດ", successSupplier: "ເພີ່ມຜູ້ສະໜອງສໍາເລັດ", actionFailed: "ດໍາເນີນການບໍ່ສໍາເລັດ" },
  },
} as const

export function getWorkspaceMessages(lang: SiteLang = "en") {
  return (workspaceMessages as unknown as Record<string, (typeof workspaceMessages)["en"]>)[lang] ?? workspaceMessages.en
}
