import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutApi } from '@/features/checkout/api/checkoutApi';

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock('@/services/httpClient', () => ({
  httpClient: { post: mockPost },
}));

describe('checkoutApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('llama a POST /payment y devuelve el basket con clientSecret', async () => {
      const basket = { id: 'b1', items: [], paymentIntentId: 'pi_123', clientSecret: 'pi_123_secret_xyz' };
      mockPost.mockResolvedValue({ data: basket });

      const result = await checkoutApi.createPaymentIntent();

      expect(mockPost).toHaveBeenCalledWith('/payment');
      expect(result).toEqual(basket);
    });
  });

  describe('createOrder', () => {
    it('llama a POST /order con el orderData y devuelve la orden creada', async () => {
      const orderData = {
        paymentSummary: { last4: 4242, brand: 'visa', exp_month: 12, exp_year: 2030 },
      };
      const order = {
        id: 'o1',
        buyerEmail: 'test@wax.com',
        billingAddress: { name: 'X', line1: 'Y', city: 'Z', state: 'S', postalCode: 'P', country: 'EC' },
        paymentSummary: { last4: 4242, brand: 'visa', expMonth: 12, expYear: 2030 },
        deliveryFee: 500,
        discount: 0,
        subtotal: 2000,
        total: 2500,
        orderStatus: 'Pending',
        orderItems: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: null,
      };
      mockPost.mockResolvedValue({ data: order });

      const result = await checkoutApi.createOrder(orderData);

      expect(mockPost).toHaveBeenCalledWith('/order', orderData);
      expect(result).toEqual(order);
    });
  });
});
