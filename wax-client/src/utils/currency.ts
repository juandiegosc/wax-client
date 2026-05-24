export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);

// Mirrors backend: Application.Orders.Commands.CreateOrderCommandHandler.CalculateDeliveryFee
export const calculateDeliveryFee = (subtotalCents: number): number =>
  subtotalCents > 10000 ? 0 : 500;