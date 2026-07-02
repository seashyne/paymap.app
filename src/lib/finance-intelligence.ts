
export type Insight = { title: string; body: string; severity?: "info" | "warning" | "success" };
export type RecurringDetection = { merchant: string; amount: number; interval: string; confidence: number; nextExpected?: string };

const DAY = 86400000;

export function buildFinancialHealthScore(input: {
  monthIncome: number;
  monthExpense: number;
  recurringMonthlyCost: number;
  budgetOverCount: number;
  activeGoals: number;
}) {
  const savingsRate = input.monthIncome > 0 ? Math.max(0, (input.monthIncome - input.monthExpense) / input.monthIncome) : 0;
  let score = 50;
  score += Math.min(20, Math.round(savingsRate * 40));
  score += input.recurringMonthlyCost <= input.monthIncome * 0.15 ? 10 : input.recurringMonthlyCost <= input.monthIncome * 0.25 ? 4 : -6;
  score += input.budgetOverCount === 0 ? 10 : -Math.min(12, input.budgetOverCount * 4);
  score += input.activeGoals > 0 ? 8 : 0;
  score = Math.max(0, Math.min(100, score));
  const band = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'risk';
  return { score, band };
}

export function detectRecurringTransactions(transactions: Array<{ note?: string | null; amount: number; happenedAt: string | Date }>): RecurringDetection[] {
  const groups = new Map<string, Array<{ amount: number; happenedAt: number }>>();
  for (const tx of transactions) {
    const merchant = (tx.note || '').trim();
    if (!merchant) continue;
    const key = `${merchant.toLowerCase()}::${Number(tx.amount).toFixed(0)}`;
    const arr = groups.get(key) || [];
    arr.push({ amount: Number(tx.amount), happenedAt: new Date(tx.happenedAt).getTime() });
    groups.set(key, arr);
  }
  const results: RecurringDetection[] = [];
  for (const [key, arr] of groups) {
    if (arr.length < 2) continue;
    arr.sort((a, b) => a.happenedAt - b.happenedAt);
    const diffs = arr.slice(1).map((x, i) => Math.round((x.happenedAt - arr[i].happenedAt) / DAY));
    const avg = diffs.reduce((s, d) => s + d, 0) / diffs.length;
    let interval = '';
    let confidence = 0;
    if (avg >= 27 && avg <= 33) { interval = 'monthly'; confidence = 92; }
    else if (avg >= 6 && avg <= 8) { interval = 'weekly'; confidence = 88; }
    else if (avg >= 1 && avg <= 2) { interval = 'daily'; confidence = 82; }
    if (!interval) continue;
    const [merchant] = key.split('::');
    const last = arr[arr.length - 1].happenedAt;
    const next = new Date(last + avg * DAY);
    results.push({ merchant, amount: arr[0].amount, interval, confidence, nextExpected: next.toISOString() });
  }
  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

export function buildSpendingInsights(input: {
  monthIncome: number;
  monthExpense: number;
  topCategory?: { name: string; amount: number } | null;
  recurringMonthlyCost: number;
  dueSoon: number;
  recurringDetections: RecurringDetection[];
}): Insight[] {
  const savingsRate = input.monthIncome > 0 ? Math.round(((input.monthIncome - input.monthExpense) / input.monthIncome) * 100) : 0;
  const insights: Insight[] = [];
  insights.push({ title: 'Financial health', body: `คุณออมเงินได้ประมาณ ${savingsRate}% ของรายรับเดือนนี้`, severity: savingsRate >= 20 ? 'success' : 'info' });
  if (input.topCategory) insights.push({ title: 'Top spending', body: `หมวดใช้จ่ายสูงสุดคือ ${input.topCategory.name} (${Math.round(input.topCategory.amount).toLocaleString()})`, severity: 'info' });
  if (input.recurringMonthlyCost > 0) insights.push({ title: 'Recurring load', body: `ค่าใช้จ่ายประจำราว ${Math.round(input.recurringMonthlyCost).toLocaleString()} ต่อเดือน`, severity: input.recurringMonthlyCost > input.monthIncome * 0.25 ? 'warning' : 'info' });
  if (input.dueSoon > 0) insights.push({ title: 'Upcoming bills', body: `มีรายการ subscription ครบกำหนด ${input.dueSoon} รายการใน 7 วัน`, severity: 'warning' });
  if (input.recurringDetections.length > 0) insights.push({ title: 'Recurring detected', body: `ระบบตรวจพบ recurring transaction ${input.recurringDetections.length} รายการ`, severity: 'success' });
  return insights.slice(0, 5);
}

export function buildMonthlySummary(input: { monthIncome: number; monthExpense: number; score: number; dueSoon: number; topCategory?: { name: string; amount: number } | null }) {
  return {
    headline: input.monthIncome >= input.monthExpense ? 'เดือนนี้ยังคุมกระแสเงินสดได้' : 'เดือนนี้รายจ่ายสูงกว่ารายรับ',
    summary: `รายรับ ${Math.round(input.monthIncome).toLocaleString()} · รายจ่าย ${Math.round(input.monthExpense).toLocaleString()} · Health score ${input.score}/100`,
    callouts: [
      input.topCategory ? `จับตาหมวด ${input.topCategory.name}` : 'ยังไม่มีหมวดค่าใช้จ่ายเด่น',
      input.dueSoon > 0 ? `มีบิลใกล้ครบกำหนด ${input.dueSoon} รายการ` : 'ไม่มีบิลเร่งด่วนในสัปดาห์นี้',
    ],
  };
}

export function suggestCategory(note: string | null | undefined) {
  const v = (note || '').toLowerCase();
  const rules = [
    { keyword: 'grab', category: 'Transport', confidence: 90 },
    { keyword: 'netflix', category: 'Subscription', confidence: 96 },
    { keyword: 'spotify', category: 'Subscription', confidence: 96 },
    { keyword: 'starbucks', category: 'Food & Drink', confidence: 88 },
    { keyword: 'shopee', category: 'Shopping', confidence: 86 },
    { keyword: 'lazada', category: 'Shopping', confidence: 86 },
  ];
  return rules.find((r) => v.includes(r.keyword)) || null;
}
