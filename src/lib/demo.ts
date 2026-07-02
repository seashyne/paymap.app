export type DemoMode = 'personal' | 'business' | 'merchant'

export const demoConfig: Record<DemoMode, {
  email: string;
  redirectTo: string;
  label: string;
  accent: string;
  description: string;
}> = {
  personal: {
    email: 'demo@paymap.th',
    redirectTo: '/dashboard',
    label: 'Personal Finance',
    accent: '#8b5cf6',
    description: 'บัญชีส่วนตัว, งบประมาณ, เงินออม, ภาษี',
  },
  business: {
    email: 'biz@paymap.th',
    redirectTo: '/business',
    label: 'Business Workspace',
    accent: '#38bdf8',
    description: 'HR, payroll, ทีมงาน, รายงาน',
  },
  merchant: {
    email: 'shop@paymap.th',
    redirectTo: '/merchant',
    label: 'Merchant / POS',
    accent: '#fb7185',
    description: 'สต็อก, ขาย, VAT, รายงานยอด',
  },
}

export function isDemoMode(value: string): value is DemoMode {
  return value === 'personal' || value === 'business' || value === 'merchant'
}

export function isDemoEnabled() {
  return (process.env.ENABLE_DEMO ?? (process.env.NODE_ENV === 'production' ? 'false' : 'true')).toLowerCase() === 'true'
}

export const DEMO_SESSION_DAYS = 1
