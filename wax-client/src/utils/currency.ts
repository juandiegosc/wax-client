export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);

// IVA del 15% sobre el subtotal. Refleja el backend: PaymentService computa
// (long)(subtotal * 0.15m), que trunca; usamos Math.trunc para que el total
// mostrado coincida exactamente con el monto cobrado en Stripe.
export const calculateDeliveryFee = (subtotalCents: number): number =>
  Math.trunc(subtotalCents * 0.15);