export type PlanId = 'anon' | 'starter' | 'pro' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number
  priceYearly: number
  quota: number
  features: string[]
}

export const PLANS: Record<PlanId, Plan & { stripePriceIdMonthly?: string; stripePriceIdYearly?: string }> = {
  anon: {
    id: 'anon',
    name: 'Anonymous',
    priceMonthly: 0,
    priceYearly: 0,
    quota: 5,
    features: ['Basic Search']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 9, // + IVA 22%
    priceYearly: 90,
    quota: 100,
    features: ['100 researches', '5 teams', 'PDF Export'],
    stripePriceIdMonthly: 'price_starter_monthly_dummy',
    stripePriceIdYearly: 'price_starter_yearly_dummy'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29, // + IVA 22%
    priceYearly: 290,
    quota: 1000,
    features: ['1.000 researches', '20 teams', 'Whitelabel', 'Chat AI'],
    stripePriceIdMonthly: 'price_pro_monthly_dummy',
    stripePriceIdYearly: 'price_pro_yearly_dummy'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 99, // + IVA 22%
    priceYearly: 990,
    quota: Infinity,
    features: ['Unlimited researches', 'Admin Morphic', 'API access'],
    stripePriceIdMonthly: 'price_enterprise_monthly_dummy',
    stripePriceIdYearly: 'price_enterprise_yearly_dummy'
  }
}

export const ITALIAN_VAT_RATE = 0.22
