export function formatCurrency(amount: number, currency = 'RWF'): string {
  if (currency === 'RWF') {
    return `${amount.toLocaleString('en-RW')} RWF`
  }
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

export function planPrice(
  plan: { price?: number; price_monthly?: number; price_yearly?: number },
  billingCycle: 'monthly' | 'yearly',
): number {
  if (billingCycle === 'yearly') {
    return plan.price_yearly ?? Math.round((plan.price_monthly ?? plan.price ?? 0) * 10)
  }
  return plan.price_monthly ?? plan.price ?? 0
}
