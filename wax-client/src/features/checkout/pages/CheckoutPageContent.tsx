import { useEffect, useMemo, useRef, useState } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useBasket } from '@/features/basket/hooks/useBasket';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { CheckoutOrderSummary } from '../components/CheckoutOrderSummary';
import { useCreatePaymentIntent } from '../hooks/useCheckout';
import { env } from '@/config/env';
import { routePaths } from '@/routes/routePaths';

const stripePromise = loadStripe(env.stripePk);

// Stripe Appearance no soporta CSS variables (es JSON puro). Calculamos
// la paleta una sola vez por sesión via matchMedia. En mobile usamos la
// version dark; en desktop la light original.
const isMobileViewport =
  typeof globalThis !== 'undefined' && globalThis.matchMedia?.('(max-width: 768px)').matches;

const appearance: Appearance = isMobileViewport
  ? {
      theme: 'night',
      variables: {
        colorPrimary: '#f5f2ec',
        colorBackground: '#1d1a18',
        colorText: '#f5f2ec',
        colorTextSecondary: 'rgba(245, 242, 236, 0.72)',
        colorDanger: '#e88a98',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        borderRadius: '0.35rem',
        spacingUnit: '4px',
        fontSizeBase: '0.92rem',
      },
      rules: {
        '.Input': {
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'none',
          backgroundColor: '#211e1b',
          color: '#f5f2ec',
          padding: '0.75rem',
        },
        '.Input:focus': {
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: 'none',
          outline: '0',
        },
        '.Label': {
          color: 'rgba(192, 192, 192, 0.85)',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: '500',
        },
        '.Tab': {
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: '#1d1a18',
          color: '#f5f2ec',
          boxShadow: 'none',
        },
        '.Tab--selected': {
          borderColor: 'rgba(255, 255, 255, 0.6)',
          backgroundColor: '#211e1b',
          boxShadow: 'none',
        },
      },
    }
  : {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0f0f10',
        colorBackground: '#faf9f6',
        colorText: '#0f0f10',
        colorDanger: '#4f2730',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        borderRadius: '0.35rem',
        spacingUnit: '4px',
        fontSizeBase: '0.92rem',
      },
      rules: {
        '.Input': {
          border: '1px solid rgba(15, 15, 16, 0.16)',
          boxShadow: 'none',
          backgroundColor: '#faf9f6',
          padding: '0.75rem',
        },
        '.Input:focus': {
          border: '1px solid #0f0f10',
          boxShadow: 'none',
          outline: '0',
        },
        '.Label': {
          color: '#71717a',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: '500',
        },
        '.Tab': {
          border: '1px solid rgba(15, 15, 16, 0.12)',
          boxShadow: 'none',
        },
        '.Tab--selected': {
          borderColor: '#0f0f10',
          boxShadow: 'none',
        },
      },
    };

export const CheckoutPageContent = () => {
  const queryClient = useQueryClient();
  const { data: basket, isLoading, isError: isBasketError } = useBasket();
  const {
    mutateAsync: createPaymentIntentAsync,
    isPending: isCreatingIntent,
    isError: isIntentError,
  } = useCreatePaymentIntent();
  const created = useRef(false);
  const [localCreating, setLocalCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Siempre recreamos el PaymentIntent al entrar a checkout: el basket puede
    // haber mutado por fuera (ej. consumer del approve de una cotización añade
    // el item async) y un clientSecret viejo cobraría el monto previo.
    if (!created.current && basket && basket.items.length > 0) {
      created.current = true;
      setLocalCreating(true);
      createPaymentIntentAsync()
        .then((updatedBasket) => {
          queryClient.setQueryData(queryKeys.basket.all, updatedBasket);
          if (mounted) setLocalCreating(false);
        })
        .catch(() => {
          if (mounted) setLocalCreating(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [basket, createPaymentIntentAsync, queryClient]);

  const options = useMemo(() => {
    const clientSecret = basket?.clientSecret;
    if (!clientSecret) return undefined;
    return { clientSecret, appearance };
  }, [basket?.clientSecret]);

  if (isLoading || isCreatingIntent || localCreating) {
    return (
      <div className="checkout-loading">
        <span className="checkout-loading-label">Preparando tu pedido…</span>
      </div>
    );
  }

  if (isBasketError) {
    return (
      <div className="checkout-loading">
        <span className="checkout-loading-label">No pudimos cargar tu carrito.</span>
      </div>
    );
  }

  if (!basket || !basket.items.length) {
    return (
      <section className="checkout-empty">
        <span className="checkout-kicker">Checkout</span>
        <h1 className="checkout-empty-title">Tu carrito está vacío.</h1>
        <Link to={routePaths.catalog} className="basket-cta">
          Ir al catálogo
        </Link>
      </section>
    );
  }

  if (isIntentError) {
    return (
      <div className="checkout-loading">
        <span className="checkout-loading-label">No pudimos preparar tu pago.</span>
        <button
          className="basket-cta"
          onClick={() => {
            created.current = false;
            setLocalCreating(true);
            createPaymentIntentAsync()
              .then((b) => {
                queryClient.setQueryData(queryKeys.basket.all, b);
                setLocalCreating(false);
              })
              .catch(() => setLocalCreating(false));
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="checkout-loading">
        <span className="checkout-loading-label">Preparando tu pedido…</span>
      </div>
    );
  }

  return (
    <section className="checkout-page">
      <header className="checkout-header" style={{ borderBottom: '1px solid rgba(15, 15, 16, 0.08)' }}>
        <div className="checkout-header-copy">
          <span className="checkout-kicker">Checkout</span>
          <h1 className="checkout-title">Tu pedido.</h1>
        </div>
      </header>

      <div className="checkout-layout">
        <Elements stripe={stripePromise} options={options}>
          <CheckoutStepper basket={basket} />
        </Elements>
        <CheckoutOrderSummary basket={basket} />
      </div>
    </section>
  );
};
