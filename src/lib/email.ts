// v1.4: Unified email service — Resend (prod) or console.log (dev)
// All transactional emails go through here

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
const FROM = process.env.EMAIL_FROM ?? "noreply@paymap.th"
const BRAND_COLOR = "#f5a623"

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 [EMAIL DEV]", { to, subject })
    return true
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    return res.ok
  } catch (err) {
    console.error("[email] send failed", err)
    return false
  }
}

function baseTemplate(title: string, body: string, cta?: { label: string; url: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#18181f;border-radius:24px;padding:32px;border:1px solid #2a2a35">
    <div style="margin-bottom:24px">
      <span style="font-size:20px;font-weight:900;color:${BRAND_COLOR}">payMap</span>
      <span style="font-size:11px;font-family:monospace;color:#666;margin-left:8px;text-transform:uppercase;letter-spacing:0.15em">v1.4</span>
    </div>
    <h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#fff">${title}</h2>
    <div style="color:#aaa;font-size:15px;line-height:1.7">${body}</div>
    ${cta ? `
    <div style="margin:28px 0 0">
      <a href="${cta.url}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px">${cta.label}</a>
    </div>` : ""}
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #2a2a35;font-size:12px;color:#555">
      คุณได้รับอีเมลนี้เนื่องจากมีบัญชีกับ payMap · <a href="${BASE_URL}" style="color:${BRAND_COLOR}">paymap.th</a>
    </div>
  </div>
</body>
</html>`
}

// ── Auth Emails ─────────────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`
  return sendEmail(email, "ยืนยัน Email ของคุณ — payMap", baseTemplate(
    `สวัสดี ${name} 👋`,
    `กรุณายืนยัน email ของคุณเพื่อเริ่มใช้งาน payMap<br>ลิงก์นี้จะหมดอายุใน <strong style="color:#fff">24 ชั่วโมง</strong>`,
    { label: "ยืนยัน Email ✓", url }
  ))
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`
  return sendEmail(email, "รีเซ็ต Password — payMap", baseTemplate(
    "รีเซ็ต Password",
    `สวัสดี ${name}, คุณได้ขอรีเซ็ต password<br>กด <strong style="color:#fff">รีเซ็ต Password</strong> ด้านล่าง ลิงก์หมดอายุใน <strong style="color:#fff">1 ชั่วโมง</strong><br><br>ถ้าคุณไม่ได้ขอ ให้ละเว้นอีเมลนี้`,
    { label: "รีเซ็ต Password", url }
  ))
}

// ── Workspace Invite Emails ─────────────────────────────────────────────────

export async function sendWorkspaceInviteEmail(
  email: string, invitedName: string,
  orgName: string, inviterName: string, role: string
) {
  const url = `${BASE_URL}/login?next=/business`
  return sendEmail(email, `คุณได้รับเชิญเข้า ${orgName} — payMap`, baseTemplate(
    `${inviterName} เชิญคุณเข้า Workspace`,
    `<strong style="color:#fff">${inviterName}</strong> ได้เชิญ <strong style="color:#fff">${invitedName}</strong> เข้าร่วม<br>
     <strong style="color:#38bdf8">${orgName}</strong> ในบทบาท <strong style="color:#fff">${role}</strong><br><br>
     เข้าสู่ระบบเพื่อเริ่มใช้งาน Business Workspace ร่วมกันได้ทันที`,
    { label: `เข้าร่วม ${orgName}`, url }
  ))
}

export async function sendFamilyInviteEmail(
  email: string, invitedName: string,
  familyName: string, inviterName: string, role: string
) {
  const url = `${BASE_URL}/login?next=/dashboard?tab=family`
  const roleLabel: Record<string, string> = { spouse: "คู่สมรส", adult: "สมาชิกผู้ใหญ่", child: "บุตร/หลาน" }
  return sendEmail(email, `คุณได้รับเชิญเข้า Family Workspace — payMap`, baseTemplate(
    `${inviterName} เชิญคุณเข้า Family`,
    `<strong style="color:#fff">${inviterName}</strong> ได้เพิ่มคุณเข้าครอบครัว <strong style="color:#f43f5e">${familyName}</strong><br>
     บทบาท: <strong style="color:#fff">${roleLabel[role] ?? role}</strong><br><br>
     คุณจะสามารถดูสรุปการเงินรวมของทุกคนในบ้านได้`,
    { label: "ดู Family Workspace", url }
  ))
}

// ── Notification Emails ─────────────────────────────────────────────────────

export async function sendBudgetAlertEmail(
  email: string, name: string,
  category: string, used: number, total: number, percent: number
) {
  return sendEmail(email, `⚠️ Budget ${category} ใกล้เต็มแล้ว — payMap`, baseTemplate(
    `Budget Alert — ${category}`,
    `สวัสดี ${name}, <strong style="color:#fff">${category}</strong> ใช้ไปแล้ว <strong style="color:#f59e0b">${percent}%</strong><br>
     ใช้ไปแล้ว: <strong style="color:#fff">฿${used.toLocaleString()}</strong> จาก ฿${total.toLocaleString()}<br><br>
     เข้าระบบเพื่อดูรายละเอียดและปรับแผน`,
    { label: "ดู Budget", url: `${BASE_URL}/dashboard` }
  ))
}

export async function sendSubscriptionRenewalEmail(
  email: string, name: string,
  subscriptionName: string, amount: number, renewDate: string, currency = "THB"
) {
  return sendEmail(email, `🔔 ${subscriptionName} กำลังจะต่ออายุ — payMap`, baseTemplate(
    `ใกล้ถึงเวลาต่ออายุ`,
    `สวัสดี ${name}, <strong style="color:#fff">${subscriptionName}</strong> จะต่ออายุอัตโนมัติในวันที่ <strong style="color:#f59e0b">${renewDate}</strong><br>
     ยอดที่จะถูกเรียกเก็บ: <strong style="color:#fff">${currency} ${amount.toLocaleString()}</strong><br><br>
     ถ้าต้องการยกเลิกหรือเปลี่ยนแปลง กรุณาเข้าระบบก่อนวันนั้น`,
    { label: "จัดการ Subscriptions", url: `${BASE_URL}/dashboard` }
  ))
}

export async function sendMonthlyReportEmail(
  email: string, name: string,
  month: string, income: number, expense: number, net: number, topCategories: { name: string; amount: number }[]
) {
  const catList = topCategories.slice(0,3).map(c => `<li style="margin-bottom:4px"><strong style="color:#fff">${c.name}</strong>: ฿${c.amount.toLocaleString()}</li>`).join("")
  return sendEmail(email, `📊 รายงานการเงินประจำเดือน ${month} — payMap`, baseTemplate(
    `สรุปการเงิน ${month}`,
    `สวัสดี ${name}, นี่คือสรุปการเงินของคุณเดือน <strong style="color:#fff">${month}</strong><br><br>
     <div style="background:#111118;border-radius:14px;padding:16px;margin:12px 0">
       <div style="margin-bottom:8px">💚 รายรับ: <strong style="color:#34d399">฿${income.toLocaleString()}</strong></div>
       <div style="margin-bottom:8px">🔴 รายจ่าย: <strong style="color:#f87171">฿${expense.toLocaleString()}</strong></div>
       <div>💙 คงเหลือ: <strong style="color:${net >= 0 ? "#38bdf8" : "#f87171"}">฿${net.toLocaleString()}</strong></div>
     </div>
     ${catList ? `<strong style="color:#fff">หมวดหมู่ที่จ่ายมากที่สุด:</strong><ul style="padding-left:20px;margin:8px 0">${catList}</ul>` : ""}`,
    { label: "ดูรายงานเต็ม", url: `${BASE_URL}/reports` }
  ))
}

export async function sendPayrollCompletedEmail(
  email: string, name: string,
  orgName: string, month: string, totalNet: number, employeeCount: number
) {
  return sendEmail(email, `✅ Payroll ${month} เสร็จสิ้น — payMap`, baseTemplate(
    `Payroll ${month} เสร็จสิ้น`,
    `สวัสดี ${name}, Payroll ของ <strong style="color:#38bdf8">${orgName}</strong> เดือน <strong style="color:#fff">${month}</strong> ดำเนินการเสร็จสิ้น<br><br>
     พนักงานที่ดำเนินการ: <strong style="color:#fff">${employeeCount} คน</strong><br>
     ยอดรวม Net Salary: <strong style="color:#34d399">฿${totalNet.toLocaleString()}</strong>`,
    { label: "ดู Payroll Report", url: `${BASE_URL}/business` }
  ))
}
