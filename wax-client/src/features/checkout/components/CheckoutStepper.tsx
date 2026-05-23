import { useState } from 'react';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import type { ConfirmationToken } from '@stripe/stripe-js';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { AddressStep } from './AddressStep';
import { PaymentStep } from './PaymentStep';
import { ReviewStep } from './ReviewStep';
import { useCreateOrder } from '../hooks/useCheckout';
import { useUserAddress } from '@/lib/hooks/useAccount';
import { queryKeys } from '@/lib/queryKeys';
import { routePaths } from '@/routes/routePaths';
import { calculateDeliveryFee, formatCurrency } from '@/utils/currency';
import type { Basket } from '@/features/basket/types/basket.types';
import type { PaymentSummaryInput } from '@/lib/types/order';

const STEPS = ['Dirección', 'Pago', 'Revisión'];

interface Props {
  basket: Basket;
}

export const CheckoutStepper = ({ basket }: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [addressComplete, setAddressComplete] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<ConfirmationToken | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const elements = useElements();
  const stripe = useStripe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: savedAddress } = useUserAddress();
  const { mutateAsync: createOrder } = useCreateOrder();

  const handleNext = async () => {
    if (activeStep === 1) {
      if (!elements || !stripe) return;

      const submitResult = await elements.submit();
      if (submitResult.error) {
        toast.error(submitResult.error.message);
        return;
      }

      const tokenResult = await stripe.createConfirmationToken({ elements });
      if (tokenResult.error) {
        toast.error(tokenResult.error.message);
        return;
      }

      setConfirmationToken(tokenResult.confirmationToken);
    }

    if (activeStep === 2) {
      await confirmPayment();
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const confirmPayment = async () => {
    setIsSubmitting(true);
    try {
      if (!confirmationToken || !basket.clientSecret) {
        throw new Error('Faltan datos de pago');
      }

      const card = confirmationToken.payment_method_preview.card;
      if (!card) {
        throw new Error('Datos de la tarjeta incompletos');
      }

      // El backend recibe solo paymentSummary — la billingAddress la obtiene de Stripe
      // Los campos de expiración van en snake_case según CreateOrderDto del API
      const paymentSummary: PaymentSummaryInput = {
        last4: parseInt(card.last4, 10),
        brand: card.brand,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
      };

      const order = await createOrder({ paymentSummary });

      const paymentResult = await stripe?.confirmPayment({
        clientSecret: basket.clientSecret,
        redirect: 'if_required',
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
      });

      if (paymentResult?.paymentIntent?.status === 'succeeded') {
        await queryClient.invalidateQueries({ queryKey: queryKeys.basket.all });
        navigate(routePaths.checkoutSuccess, { state: { order } });
      } else if (paymentResult?.error) {
        throw new Error(paymentResult.error.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago');
      setActiveStep((prev) => Math.max(0, prev - 1));
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = basket.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const isNextDisabled =
    (activeStep === 0 && !addressComplete) ||
    (activeStep === 1 && !paymentComplete) ||
    isSubmitting;

  return (
    <div className="checkout-stepper">
      <nav className="checkout-nav">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`checkout-nav-step${i === activeStep ? ' is-active' : ''}${i < activeStep ? ' is-done' : ''}`}
          >
            <span className="checkout-nav-num">
              {i < activeStep ? '✓' : String(i + 1).padStart(2, '0')}
            </span>
            <span className="checkout-nav-label">{label}</span>
          </div>
        ))}
      </nav>

      <div className="checkout-content">
        {/* Stripe requiere que AddressElement y PaymentElement permanezcan montados
            en todo momento — getElement('address') retorna null si el elemento fue
            desmontado, lo que rompe getStripeAddress() en el paso de confirmación */}
        <div style={{ display: activeStep === 0 ? 'block' : 'none' }}>
          <AddressStep savedAddress={savedAddress} onComplete={setAddressComplete} />
        </div>
        <div style={{ display: activeStep === 1 ? 'block' : 'none' }}>
          <PaymentStep onComplete={setPaymentComplete} />
        </div>
        <div style={{ display: activeStep === 2 ? 'block' : 'none' }}>
          <ReviewStep confirmationToken={confirmationToken} basket={basket} />
        </div>
      </div>

      <div className="checkout-actions">
        {activeStep > 0 && (
          <button
            className="checkout-btn-back"
            onClick={() => setActiveStep((prev) => prev - 1)}
            disabled={isSubmitting}
          >
            Volver
          </button>
        )}
        <button className="checkout-btn-next" onClick={handleNext} disabled={isNextDisabled}>
          {activeStep === 2
            ? isSubmitting
              ? 'Procesando...'
              : `Pagar ${formatCurrency(total)}`
            : 'Continuar'}
        </button>
      </div>
    </div>
  );
};
