import { PaymentElement } from '@stripe/react-stripe-js';
import type { StripePaymentElementChangeEvent } from '@stripe/stripe-js';

interface Props {
  onComplete: (complete: boolean) => void;
}

export const PaymentStep = ({ onComplete }: Props) => {
  const handleChange = (event: StripePaymentElementChangeEvent) => {
    onComplete(event.complete);
  };

  return (
    <div className="checkout-step">
      <h2 className="checkout-step-title">Información de pago</h2>
      <PaymentElement
        options={{
          wallets: { applePay: 'never', googlePay: 'never' },
        }}
        onChange={handleChange}
      />
    </div>
  );
};
