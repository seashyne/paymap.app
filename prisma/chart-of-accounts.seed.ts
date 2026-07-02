export const DEFAULT_CHART_OF_ACCOUNTS = [
  { code: "1100", name: "Cash",                nameTH: "เงินสด",                  type: "asset" },
  { code: "1110", name: "Bank Account",        nameTH: "เงินฝากธนาคาร",            type: "asset" },
  { code: "1200", name: "Accounts Receivable", nameTH: "ลูกหนี้การค้า",            type: "asset" },
  { code: "1300", name: "Inventory",           nameTH: "สินค้าคงเหลือ",            type: "asset" },
  { code: "1500", name: "Fixed Assets",        nameTH: "สินทรัพย์ถาวร",            type: "asset" },

  { code: "2100", name: "Accounts Payable",    nameTH: "เจ้าหนี้การค้า",           type: "liability" },
  { code: "2200", name: "Short-term Loans",    nameTH: "เงินกู้ระยะสั้น",          type: "liability" },
  { code: "2300", name: "VAT Payable",         nameTH: "ภาษีมูลค่าเพิ่มค้างจ่าย", type: "liability" },
  { code: "2400", name: "Salary Payable",      nameTH: "เงินเดือนค้างจ่าย",        type: "liability" },

  { code: "3100", name: "Owner Equity",        nameTH: "ทุนเจ้าของ",               type: "equity" },
  { code: "3200", name: "Retained Earnings",   nameTH: "กำไรสะสม",                type: "equity" },

  { code: "4100", name: "Sales Revenue",       nameTH: "รายได้จากการขาย",          type: "revenue" },
  { code: "4200", name: "Service Revenue",     nameTH: "รายได้จากบริการ",          type: "revenue" },
  { code: "4300", name: "Other Income",        nameTH: "รายได้อื่น",              type: "revenue" },

  { code: "5100", name: "Cost of Goods Sold",  nameTH: "ต้นทุนสินค้า",            type: "expense" },
  { code: "5200", name: "Salary Expense",      nameTH: "ค่าใช้จ่ายเงินเดือน",     type: "expense" },
  { code: "5300", name: "Rent Expense",        nameTH: "ค่าเช่า",                  type: "expense" },
  { code: "5400", name: "Utilities",           nameTH: "ค่าสาธารณูปโภค",          type: "expense" },
  { code: "5500", name: "Marketing Expense",   nameTH: "ค่าการตลาด",              type: "expense" },
  { code: "5600", name: "Tax Expense",         nameTH: "ภาษีเงินได้",             type: "expense" },
  { code: "5900", name: "Other Expense",       nameTH: "ค่าใช้จ่ายอื่น",          type: "expense" },
] as const
