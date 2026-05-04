import { AddressElement } from '@stripe/react-stripe-js';
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import type { Address } from '@/lib/types/user';

interface Props {
  savedAddress?: Address | null;
  onComplete: (complete: boolean) => void;
}

export const AddressStep = ({ savedAddress, onComplete }: Props) => {
  const handleChange = (event: StripeAddressElementChangeEvent) => {
    onComplete(event.complete);
  };

  return (
    <div className="checkout-step">
      <h2 className="checkout-step-title">Dirección de envío</h2>
      <AddressElement
        options={{
          mode: 'shipping',
          defaultValues: savedAddress
            ? {
                name: savedAddress.name,
                address: {
                  line1: savedAddress.line1,
                  line2: savedAddress.line2 ?? '',
                  city: savedAddress.city,
                  state: savedAddress.state,
                  postal_code: savedAddress.postalCode,
                  country: savedAddress.country || 'MX',
                },
              }
            : undefined,
        }}
        onChange={handleChange}
      />
    </div>
  );
};
