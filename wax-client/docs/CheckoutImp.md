# Guía Completa: Arquitectura e Integración de Basket y Checkout (con Stripe)

Una guía detallada de cómo están implementados los módulos de Basket (Carrito) y la pasarela de pagos Checkout (Stripe) a nivel de frontend en el proyecto actual (Restore), y cómo integrarlos o replicarlos en un cliente frontend distinto.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Modelos de Datos Principales](#modelos-de-datos-principales)
3. [Módulo Basket (Carrito)](#módulo-basket-carrito)
4. [Paquetes NPM Utilizados](#paquetes-npm-utilizados)
5. [Flujo de Pago Completo](#flujo-de-pago-completo)
6. [Implementación Detallada - Checkout](#implementación-detallada---checkout)
7. [Adaptación a Componentes Base](#adaptación-a-componentes-base)
8. [Consideraciones de Migración (Nuevo Frontend)](#consideraciones-de-migración-nuevo-frontend)

---

## 🏗️ Arquitectura General

### Stack Actual
```
Frontend Framework: React 19 (RC)
State Management: Redux Toolkit + RTK Query
UI Framework: Material-UI (MUI) v7
Stripe Integration: @stripe/react-stripe-js + @stripe/stripe-js
Form Handling: React Hook Form + Zod
Client State Hydration: Cookies (js-cookie)
```

### Estructura de Carpetas (Checkout)
```
src/
├── app/
│   ├── features/
│   │   ├── checkout/
│   │   │   ├── CheckoutPage.tsx          (Entrada, Stripe Provider)
│   │   │   ├── CheckoutStepper.tsx       (Lógica de pasos, confirmación de pago)
│   │   │   ├── Review.tsx                (Revisión de datos antes de pagar)
│   │   │   ├── CheckoutSuccess.tsx       (Página de éxito)
│   │   │   └── checkoutApi.ts            (RTK Query - Crear Payment Intent)
│   │   ├── basket/
│   │   │   └── basketApi.ts              (RTK Query - Gestión del carrito)
│   │   ├── account/
│   │   │   └── accountApi.ts             (RTK Query - Dirección de envío)
│   │   └── orders/
│   │       ├── orderApi.ts               (RTK Query - Crear orden)
│   │       └── OrderPage.tsx
│   ├── models/
│   │   ├── order.ts                      (Tipos: Order, ShippingAddress)
│   │   ├── basket.ts                     (Tipos: Basket, BasketItem)
│   │   └── user.ts                       (Tipos: User, Address)
│   ├── stores/
│   │   └── store.ts                      (Redux Store configuración)
│   └── shared/
│       └── components/
│           └── OrderSummary.tsx
├── lib/
│   └── hooks/
│       └── useBasket.ts                  (Custom hook - cálculos del carrito)
```

---

## 🧩 Modelos de Datos Principales

Para integrar esto en otro frontend, necesitarás replicar o adaptar estos modelos TypeScript:

### Basket (Carrito)
```typescript
type Basket = {
  basketId: string;
  clientSecret?: string;  // Se usa más adelante para el Payment Intent de Stripe
  items: BasketItem[];
}

type BasketItem = {
  productId: number;
  name: string;
  price: number;
  pictureUrl: string;
  brand: string;
  type: string;
  quantity: number;
}
```

### Order y Payment (Checkout)
```typescript
type Order = {
  id: number;
  buyerEmail: string;
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  orderStatus: string;
  paymentSummary: PaymentSummary;
}

type ShippingAddress = {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

type PaymentSummary = {
  last4: number | string;
  brand: string;
  exp_month: number;
  exp_year: number;
}
```

---

## 🛒 Módulo Basket (Carrito)

El carrito del proyecto actual funciona de manera persistente utilizando una cookie o variable (típicamente llamada `basketId`) para identificar el carrito del usuario.

### Flujo API de Basket (Actual con RTK Query)
1. **`fetchBasket` (GET `/basket`)**: Recupera el estado actual del carrito del usuario.
2. **`addBasketItem` (POST `/basket?productId={id}&quantity={qty}`)**:
   - Si no existe carrito, el backend crea uno nuevo.
   - Aplica **actualización optimista**.
3. **`removeBasketItem` (DELETE `/basket?productId={id}&quantity={qty}`)**:
   - Disminuye la cantidad. Si llega a 0, elimina el artículo completamente.
4. **`clearBasket` (Local Cache)**: Limpia el estado del carrito en el frontend tras el checkout exitoso.

### Flujo de Componentes
* **BasketPage**: Vista principal del listado. Utiliza un custom hook (`useFetchBasketQuery`) para recuperar la data, y renderiza la lista de `BasketItem`. En el lateral, incluye el `OrderSummary` global.
* **BasketItem**: Cada iteración muestra información (precio, foto). Llama directamente a mutaciones de incrementar/decrementar la cantidad disparando updates optimistas en UI antes que termine en red.
* **Hook Reutilizable (`useBasket`)**: Hook en `src/lib/hooks/useBasket.ts` que centraliza cálculos derivados del estado remoto: Sumatorios de Totales, Coste de Envíos según reglas de negocio (ej: si > $100 -> envío gratuito).

---

## 📦 Paquetes NPM Utilizados

### Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@stripe/react-stripe-js` | ^5.6.0 | Provider de Stripe para React |
| `@stripe/stripe-js` | ^8.7.0 | Librería principal de Stripe |
| `@reduxjs/toolkit` | ^2.11.2 | State management avanzado |
| `react-redux` | ^9.2.0 | Bindings de Redux para React |
| `@mui/material` | ^7.3.6 | Componentes UI prediseñados |
| `@mui/icons-material` | ^7.3.6 | Iconos de Material Design |
| `@mui/lab` | ^7.0.0-beta | Componentes experimentales de MUI |
| `react-hook-form` | ^7.71.1 | Gestión de formularios |
| `@hookform/resolvers` | ^5.2.2 | Validación con Zod en formularios |
| `zod` | ^4.3.6 | Validación de esquemas TypeScript |
| `react-router-dom` | ^7.11.0 | Enrutamiento |
| `react-toastify` | ^11.0.5 | Notificaciones toast |
| `date-fns` | ^4.1.0 | Manipulación de fechas |
| `js-cookie` | ^3.0.5 | Gestión de cookies |
| `@emotion/react` | ^11.14.0 | Sistema de CSS-in-JS (dependencia de MUI) |
| `@emotion/styled` | ^11.14.1 | Styled components (dependencia de MUI) |

### Para Replicar en Nuevo Proyecto (sin MUI)

**Mantener:**
- `@stripe/react-stripe-js` y `@stripe/stripe-js`
- `react-query` (en lugar de RTK Query)
- `react-router-dom`
- `react-hook-form` + `@hookform/resolvers` + `zod`
- `react-toastify`
- `date-fns`
- `js-cookie`

**Remover:**
- Redux Toolkit
- MUI completo (@mui/material, @mui/icons-material, @mui/lab)
- Emotion (CSS-in-JS de MUI)

---

## 🔄 Flujo de Pago Completo

### Diagrama del Flujo

```
┌──────────────────┐
│  Usuario abre    │
│ /checkout        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ CheckoutPage carga               │
│ - Crea instancia de Stripe       │
│ - Llama createPaymentIntent()    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Backend crea Payment Intent      │
│ y devuelve clientSecret          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ CheckoutStepper - PASO 1         │
│ (Address)                        │
│ - AddressElement de Stripe       │
│ - Valida dirección              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ CheckoutStepper - PASO 2         │
│ (Payment)                        │
│ - PaymentElement de Stripe       │
│ - Valida método de pago         │
│ - Crea ConfirmationToken        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ CheckoutStepper - PASO 3         │
│ (Review)                         │
│ - Muestra resumen del pedido     │
│ - Confirma datos                 │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Usuario hace clic en "Pay"       │
│ - confirmPayment()               │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 1. Crea la Order en BD           │
│ 2. Confirma pago con Stripe      │
│ 3. Valida confirmationToken      │
└────────┬─────────────────────────┘
         │
         ▼
    ¿Éxito?
     /   \
   SÍ     NO
   │       │
   ▼       ▼
┌──┐   ┌──────┐
│✓ │   │ ✗    │
│  │   │Toast │
└──┘   │error │
   │   └──────┘
   ▼
Navega a
/checkout/success
```

---

## 💻 Implementación Detallada - Checkout

### 1. CheckoutPage.tsx - Entrada y Setup de Stripe

```typescript
// Carga instancia de Stripe desde el archivo
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK_KEY);

export default function CheckoutPage() {
  const {data: basket} = useFetchBasketQuery();
  const [createPaymentIntent, {isLoading}] = useCreatePaymentIntentMutation();
  const created = useRef(false);
  const {darkMode} = useAppSelector(state => state.ui);

  // Effect para crear el Payment Intent una sola vez
  useEffect(() => {
    if (!created.current) {
      createPaymentIntent(undefined);
      created.current = true;
    }
  }, [createPaymentIntent]);

  // Configura el Options para Stripe Elements
  // clientSecret es crítico - vuelve los elementos editable
  const options: StripeElementsOptions | undefined = useMemo(() => {
    if (!basket?.clientSecret) return undefined;
    return {
      clientSecret: basket.clientSecret,
      appearance: {
        labels: 'floating',
        theme: darkMode ? 'night' : 'stripe'
      }
    }
  }, [basket, darkMode]);
  
  return (
    <Grid container spacing={2}>
      <Grid size={8}>
        {!stripePromise || !options || isLoading ? (
          <Typography variant="h6">Loading checkout...</Typography>
        ):(
           // Elements es el provider que envuelve los componentes Stripe
           <Elements stripe={stripePromise} options={options}>
            <CheckoutStepper/>
           </Elements>
        )}
      </Grid>
      <Grid size={4}>
        <OrderSummary/>
      </Grid>
    </Grid>
  )
}
```

**Puntos clave:**
- `loadStripe()` carga la librería de Stripe
- `useRef(false)` previene la llamada duplicada en StrictMode
- `clientSecret` debe venir del backend (Payment Intent)
- `Elements` es el provider que debe envolver los componentes de Stripe
- `appearance` personaliza el tema de los elementos

### 2. checkoutApi.ts - Crear Payment Intent

```typescript
export const checkoutApi = createApi({
    reducerPath: 'checkoutApi',
    baseQuery: baseQueryWithErrorHandling,
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation<Basket, void>({
            query: () => {
                return {
                    url: 'payment',
                    method: 'POST'
                }
            },
            // Este callback actualiza el estado del basket localmente
            // y evita hacer refresh completo
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data: basket } = await queryFulfilled;
                   dispatch(
                    basketApi.util.updateQueryData('fetchBasket', undefined, (draft) => {
                        // El backend devuelve el basket con clientSecret
                        draft.clientSecret = basket.clientSecret;
                    }));
                } catch (error) {
                    console.log('Payment intent creation failed', error);
                }
            }
        })
    })
});
```

**Qué hace el backend:**
- Recibe el carrito actual
- Crea un PaymentIntent en Stripe
- Devuelve `clientSecret` en la respuesta
- El cliente lo usa para validar y procesar el pago

### 3. CheckoutStepper.tsx - Flujo de Pasos

Componente principal que maneja los 3 pasos:

#### Paso 1: Dirección (Address)

```typescript
const handleNext = async () => {
    if (activeStep === 0 && saveAddressChecked && elements) {
        const address = await getStripeAddress();
        if (address) await updateAddress(address);
    }
    // ...resto del código
}

const getStripeAddress = async () => {
    const addressElement = elements?.getElement('address');
    if (!addressElement) return null;
    
    // Stripe AddressElement devuelve los datos validados
    const {value: {name, address}} = await addressElement.getValue();
    
    if (name && address) return {...address, name}
    return null;
}
```

**Stripe AddressElement:**
- Valida automáticamente la dirección
- Integración con bases de datos de direcciones
- Devuelve datos estructurados

#### Paso 2: Pago (Payment)

```typescript
const handleNext = async () => {
    if (activeStep === 1) {
        if (!elements || !stripe) return;
        
        // 1. Valida que los elementos están completos
        const result = await elements.submit();
        if (result.error) return toast.error(result.error.message);
        
        // 2. Crea un ConfirmationToken (reemplaza el token viejo)
        const stripeResult = await stripe.createConfirmationToken({elements});
        if (stripeResult.error) return toast.error(stripeResult.error.message);
        
        // 3. Almacena el token para usarlo al confirmar
        setConfirmationToken(stripeResult.confirmationToken);
    }
}
```

**Flujo de seguridad:**
- `elements.submit()` valida que los campos están completos
- `createConfirmationToken()` cifra los datos del pago en cliente
- El token se envía al backend (nunca los números de tarjeta)

#### Paso 3: Revisión (Review)

```typescript
<Review confirmationToken={confirmationToken} />
```

Muestra un resumen de:
- Dirección de envío (desde `confirmationToken.shipping`)
- Detalles de pago (desde `confirmationToken.payment_method_preview.card`)
- Artículos del carrito y totales

#### Confirmación de Pago

```typescript
const confirmPayment = async () => {
    setSubmitting(true);
    try {
        if (!confirmationToken || !basket?.clientSecret) 
            throw new Error('Unable to process payment');
        
        // 1. Crea la orden en la BD
        const orderModel = await createOrderModel();
        const orderResult = await createOrder(orderModel);
        
        // 2. Confirma el pago con Stripe
        const paymentResult = await stripe?.confirmPayment({
            clientSecret: basket.clientSecret,
            redirect: 'if_required',
            confirmParams: {
                confirmation_token: confirmationToken.id
            }
        });
        
        // 3. Valida el resultado
        if (paymentResult?.paymentIntent?.status === 'succeeded') {
            navigate('/checkout/success', {state: orderResult});
            clearBasket();
        } else if (paymentResult?.error) {
            throw new Error(paymentResult.error.message);
        }
    } catch (error) {
        if (error instanceof Error) {
            toast.error(error.message)
        }
        setActiveStep(step => step - 1);
    } finally {
        setSubmitting(false)
    }
}

const createOrderModel = async () => {
    const shippingAddress = await getStripeAddress();
    const paymentSummary = confirmationToken?.payment_method_preview.card;
    
    if (!shippingAddress || !paymentSummary) 
        throw new Error('Problem creating order');
    
    return {shippingAddress, paymentSummary}
}
```

**Puntos críticos:**
- El backend debe crear la orden ANTES de confirmar el pago
- El `confirmationToken` contiene todos los datos validados
- `confirmPayment()` es idempotente - puede llamarse múltiples veces sin riesgo
- El backend debe verificar que el pago fue exitoso con Stripe antes de procesar

### 4. Review.tsx - Componente de Revisión

```typescript
export default function Review({confirmationToken}: Props) {
  const {basket} = useBasket();

  // Extrae la dirección del token
  const addressString = () => {
    if(!confirmationToken?.shipping) return '';
    const {name, address} = confirmationToken.shipping;
    if (!address) return '';
    return `${name}, ${address.line1}, ...`;  
  }

  // Extrae los datos de la tarjeta
  const paymentString = () => {
    if(!confirmationToken?.payment_method_preview.card) return '';
    const {card} = confirmationToken.payment_method_preview;
    if(!card) return '';
    return `Card ending in ${card.last4}, exp ${card.exp_month}/${card.exp_year}`;
  }

  return (
    <div>
      <Typography>Shipping address: {addressString()}</Typography>
      <Typography>Payment details: {paymentString()}</Typography>
      {/* Lista de items del carrito */}
      <Table>
        {basket?.items.map((item) => (
          <TableRow key={item.productId}>
            <TableCell>{item.name}</TableCell>
            <TableCell>x {item.quantity}</TableCell>
            <TableCell>{item.price}</TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
```

---

## 🔄 Adaptación a Componentes Base

### Cambios Principales

| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| **State Management** | Redux Toolkit + RTK Query | TanStack Query (React Query) |
| **Caching** | RTK Query automatic | React Query useQuery/useMutation |
| **UI Components** | MUI Material Design | HTML + CSS puro / Tailwind |
| **Storage Carrito** | Redux Store | Context API + localStorage |
| **Forms** | React Hook Form + Zod | React Hook Form + Zod (igual) |

### Migración de RTK Query a React Query

#### RTK Query (Actual)
```typescript
export const checkoutApi = createApi({
    reducerPath: 'checkoutApi',
    baseQuery: baseQueryWithErrorHandling,
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation<Basket, void>({
            query: () => ({ url: 'payment', method: 'POST' }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                // Actualización optimista con Redux
            }
        })
    })
});
```

#### React Query (Nuevo)
```typescript
export const useCreatePaymentIntent = () => {
    const queryClient = useQueryClient();
    
    return useMutation(
        async () => {
            const response = await fetch('/api/payment', { method: 'POST' });
            return response.json();
        },
        {
            onSuccess: (data) => {
                // Actualizar el cache de basket
                queryClient.setQueryData(['basket'], (old) => ({
                    ...old,
                    clientSecret: data.clientSecret
                }));
            },
            onError: (error) => {
                toast.error(error.message);
            }
        }
    );
};
```

**Diferencias clave:**
- RTK Query es más centralizado y automático
- React Query requiere manejo manual del cache
- React Query es más granular y flexible

---

## 📝 Guía Paso a Paso para Nuevo Proyecto

### Prerequisitos

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install react-router-dom react-toastify date-fns js-cookie
```

### Paso 1: Configurar Variables de Entorno

```env
VITE_STRIPE_PK_KEY=pk_test_...
VITE_API_URL=http://localhost:3000/api
```

### Paso 2: Crear Context para Carrito (en lugar de Redux)

```typescript
// contexts/BasketContext.tsx
import { createContext, useContext, ReactNode, useState } from 'react';

interface BasketItem {
  productId: number;
  name: string;
  price: number;
  pictureUrl: string;
  quantity: number;
}

interface Basket {
  basketId: string;
  clientSecret?: string;
  items: BasketItem[];
}

interface BasketContextType {
  basket: Basket | null;
  setBasket: (basket: Basket) => void;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider = ({ children }: { children: ReactNode }) => {
  const [basket, setBasket] = useState<Basket | null>(() => {
    // Carga del localStorage al iniciar
    const saved = localStorage.getItem('basket');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetBasket = (newBasket: Basket) => {
    setBasket(newBasket);
    localStorage.setItem('basket', JSON.stringify(newBasket));
  };

  const clearBasket = () => {
    setBasket(null);
    localStorage.removeItem('basket');
  };

  return (
    <BasketContext.Provider value={{ basket, setBasket: handleSetBasket, clearBasket }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket debe usarse dentro de BasketProvider');
  }
  return context;
};
```

### Paso 3: Configurar React Query

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // Antes: cacheTime
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

```typescript
// main.tsx o App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { BasketProvider } from './contexts/BasketContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BasketProvider>
        {/* resto de la app */}
      </BasketProvider>
    </QueryClientProvider>
  );
}
```

### Paso 4: Crear Hooks para API Calls

```typescript
// hooks/useCheckout.ts
import { useMutation } from '@tanstack/react-query';
import { useBasket } from '../contexts/BasketContext';
import { toast } from 'react-toastify';

interface PaymentIntentResponse {
  clientSecret: string;
}

export const useCreatePaymentIntent = () => {
  const { setBasket, basket } = useBasket();

  return useMutation(
    async (): Promise<PaymentIntentResponse> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment`, {
        method: 'POST',
        credentials: 'include', // Envía cookies para autenticación
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return response.json();
    },
    {
      onSuccess: (data) => {
        if (basket) {
          setBasket({ ...basket, clientSecret: data.clientSecret });
        }
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Payment intent creation failed');
      },
    }
  );
};

export const useCreateOrder = () => {
  return useMutation(
    async (orderData: CreateOrderRequest): Promise<Order> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return response.json();
    }
  );
};

export const useFetchBasket = () => {
  return useQuery(
    ['basket'],
    async (): Promise<Basket> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/basket`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch basket');
      }

      return response.json();
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minuto
    }
  );
};

export const useUpdateAddress = () => {
  return useMutation(
    async (address: Address): Promise<Address> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/account/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      return response.json();
    }
  );
};

export const useFetchAddress = () => {
  return useQuery(
    ['address'],
    async (): Promise<Address | null> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/account/address`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    }
  );
};
```

### Paso 5: CheckoutPage Actualizado

```typescript
// components/checkout/CheckoutPage.tsx
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useEffect, useMemo, useRef } from 'react';
import { useCreatePaymentIntent } from '../../hooks/useCheckout';
import { useBasket } from '../../contexts/BasketContext';
import CheckoutStepper from './CheckoutStepper';
import OrderSummary from '../OrderSummary';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK_KEY || '');

export default function CheckoutPage() {
  const { basket, setBasket } = useBasket();
  const { mutate: createPaymentIntent, isLoading } = useCreatePaymentIntent();
  const created = useRef(false);

  // Crear payment intent al cargar
  useEffect(() => {
    if (!created.current) {
      createPaymentIntent();
      created.current = true;
    }
  }, [createPaymentIntent]);

  // Configurar opciones de Stripe
  const options: StripeElementsOptions | undefined = useMemo(() => {
    if (!basket?.clientSecret) return undefined;
    return {
      clientSecret: basket.clientSecret,
      appearance: {
        labels: 'floating',
        theme: 'stripe',
      },
    };
  }, [basket?.clientSecret]);

  if (!stripePromise || !options || isLoading) {
    return <div>Loading checkout...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutStepper />
      </Elements>
      <OrderSummary basket={basket} />
    </div>
  );
}
```

### Paso 6: CheckoutStepper Actualizado

```typescript
// components/checkout/CheckoutStepper.tsx
import { useElements, useStripe } from '@stripe/react-stripe-js';
import type { ConfirmationToken, StripeAddressElementChangeEvent, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBasket } from '../../contexts/BasketContext';
import { useCreateOrder, useUpdateAddress, useFetchAddress } from '../../hooks/useCheckout';
import Review from './Review';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';

const steps = ['Address', 'Payment', 'Review'];

export default function CheckoutStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [addressComplete, setAddressComplete] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<ConfirmationToken | null>(null);

  const elements = useElements();
  const stripe = useStripe();
  const navigate = useNavigate();
  const { basket, clearBasket } = useBasket();
  const { data: addressData } = useFetchAddress();
  const { mutate: updateAddress } = useUpdateAddress();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const handleNext = async () => {
    // Paso 1: Validar y guardar dirección
    if (activeStep === 0) {
      if (saveAddress && elements) {
        const address = await getStripeAddress();
        if (address) {
          updateAddress(address);
        }
      }
    }

    // Paso 2: Validar pago y crear confirmation token
    if (activeStep === 1) {
      if (!elements || !stripe) return;

      const result = await elements.submit();
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      const stripeResult = await stripe.createConfirmationToken({ elements });
      if (stripeResult.error) {
        toast.error(stripeResult.error.message);
        return;
      }

      setConfirmationToken(stripeResult.confirmationToken);
    }

    // Paso 3: Confirmar pago
    if (activeStep === 2) {
      await confirmPayment();
      return;
    }

    if (activeStep < 2) {
      setActiveStep((step) => step + 1);
    }
  };

  const getStripeAddress = async () => {
    const addressElement = elements?.getElement('address');
    if (!addressElement) return null;

    const { value } = await addressElement.getValue();
    if (value.name && value.address) {
      return { ...value.address, name: value.name };
    }
    return null;
  };

  const confirmPayment = async () => {
    try {
      if (!confirmationToken || !basket?.clientSecret) {
        throw new Error('Missing payment information');
      }

      // 1. Crear orden
      const shippingAddress = await getStripeAddress();
      const paymentSummary = confirmationToken?.payment_method_preview.card;

      if (!shippingAddress || !paymentSummary) {
        throw new Error('Problem with order data');
      }

      const order = await createOrder({
        shippingAddress,
        paymentSummary,
      });

      // 2. Confirmar pago
      const paymentResult = await stripe?.confirmPayment({
        clientSecret: basket.clientSecret,
        redirect: 'if_required',
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
      });

      // 3. Validar resultado
      if (paymentResult?.paymentIntent?.status === 'succeeded') {
        clearBasket();
        navigate('/checkout/success', { state: { order } });
      } else if (paymentResult?.error) {
        throw new Error(paymentResult.error.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setActiveStep((step) => step - 1);
    }
  };

  const handleBack = () => {
    setActiveStep((step) => step - 1);
  };

  return (
    <div>
      {/* Stepper simple */}
      <div style={{ display: 'flex', marginBottom: '2rem' }}>
        {steps.map((label, index) => (
          <div
            key={label}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '1rem',
              borderBottom: activeStep === index ? '2px solid #007bff' : '1px solid #ccc',
              cursor: 'pointer',
            }}
            onClick={() => index < activeStep && setActiveStep(index)}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Paso 1: Dirección */}
      {activeStep === 0 && (
        <AddressForm
          defaultAddress={addressData}
          onComplete={setAddressComplete}
        />
      )}

      {/* Paso 2: Pago */}
      {activeStep === 1 && (
        <PaymentForm
          onComplete={setPaymentComplete}
        />
      )}

      {/* Paso 3: Revisión */}
      {activeStep === 2 && (
        <Review confirmationToken={confirmationToken} />
      )}

      {/* Botones de navegación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={
            (activeStep === 0 && !addressComplete) ||
            (activeStep === 1 && !paymentComplete) ||
            isCreatingOrder
          }
        >
          {activeStep === steps.length - 1
            ? `Pay $${(basket?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0).toFixed(2)}`
            : 'Next'}
        </button>
      </div>
    </div>
  );
}
```

### Paso 7: Componentes de Dirección y Pago

```typescript
// components/checkout/AddressForm.tsx
import { AddressElement, useElements } from '@stripe/react-stripe-js';
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import { useEffect } from 'react';
import type { Address } from '../../types';

interface Props {
  defaultAddress?: Address | null;
  onComplete: (complete: boolean) => void;
}

export default function AddressForm({ defaultAddress, onComplete }: Props) {
  const elements = useElements();

  const handleChange = (event: StripeAddressElementChangeEvent) => {
    onComplete(event.complete);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>Shipping Address</h2>
      <AddressElement
        options={{
          mode: 'shipping',
          defaultValues: defaultAddress
            ? {
                name: defaultAddress.name,
                address: {
                  line1: defaultAddress.line1,
                  line2: defaultAddress.line2,
                  city: defaultAddress.city,
                  state: defaultAddress.state,
                  postal_code: defaultAddress.postal_code,
                  country: defaultAddress.country,
                },
              }
            : undefined,
        }}
        onChange={handleChange}
      />
      <label style={{ marginTop: '1rem', display: 'block' }}>
        <input type="checkbox" defaultChecked={false} />
        Save as default address
      </label>
    </div>
  );
}
```

```typescript
// components/checkout/PaymentForm.tsx
import { PaymentElement, useElements } from '@stripe/react-stripe-js';
import type { StripePaymentElementChangeEvent } from '@stripe/stripe-js';

interface Props {
  onComplete: (complete: boolean) => void;
}

export default function PaymentForm({ onComplete }: Props) {
  const elements = useElements();

  const handleChange = (event: StripePaymentElementChangeEvent) => {
    onComplete(event.complete);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>Payment Information</h2>
      <PaymentElement
        onChange={handleChange}
        options={{
          wallets: {
            applePay: 'never',
            googlePay: 'never',
          },
        }}
      />
    </div>
  );
}
```

### Paso 8: Review Component

```typescript
// components/checkout/Review.tsx
import type { ConfirmationToken } from '@stripe/stripe-js';
import { useBasket } from '../../contexts/BasketContext';

interface Props {
  confirmationToken: ConfirmationToken | null;
}

export default function Review({ confirmationToken }: Props) {
  const { basket } = useBasket();

  const addressString = () => {
    if (!confirmationToken?.shipping) return '';
    const { name, address } = confirmationToken.shipping;
    if (!address) return '';
    return `${name}, ${address.line1}, ${address.line2 || ''}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country}`;
  };

  const paymentString = () => {
    if (!confirmationToken?.payment_method_preview.card) return '';
    const { card } = confirmationToken.payment_method_preview;
    if (!card) return '';
    return `Card ending in ${card.last4}, exp ${card.exp_month}/${card.exp_year}, ${card.brand.toUpperCase()}`;
  };

  return (
    <div>
      <h2>Order Review</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Billing and Delivery</h3>
        <dl>
          <dt>Shipping Address</dt>
          <dd>{addressString()}</dd>
          <dt>Payment Details</dt>
          <dd>{paymentString()}</dd>
        </dl>
      </section>

      <section>
        <h3>Items</h3>
        <table style={{ width: '100%' }}>
          <tbody>
            {basket?.items.map((item) => (
              <tr key={item.productId}>
                <td style={{ padding: '1rem' }}>
                  <img
                    src={item.pictureUrl}
                    alt={item.name}
                    style={{ width: 60, height: 60 }}
                  />
                  {item.name}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  x {item.quantity}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  ${item.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

---

## ⚠️ Consideraciones de Migración (Nuevo Frontend)

### 1. Security - Nunca envíes números de tarjeta al servidor

```typescript
// ❌ MALO: Los números de tarjeta nunca deben ir al servidor
const paymentResult = await stripe.confirmPayment({
  clientSecret: basket.clientSecret,
  confirmParams: {
    card_number: "4242 4242 4242 4242" // ¡NUNCA!
  }
});

// ✅ BIEN: Usa confirmation token que Stripe cifra en cliente
const stripeResult = await stripe.createConfirmationToken({ elements });
const paymentResult = await stripe.confirmPayment({
  clientSecret: basket.clientSecret,
  confirmParams: {
    confirmation_token: stripeResult.confirmationToken.id
  }
});
```

### 2. Payment Intent Idempotency

El backend debe generar una `idempotency_key` única para cada orden. Esto permite:
- Reintentar sin duplicar pagos
- Recuperarse de fallos de red

```typescript
// Backend (Node.js + Stripe SDK)
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalInCents,
  currency: 'usd',
  customer: customerId,
  idempotency_key: `order-${orderId}`
}, {
  idempotencyKey: `order-${orderId}`
});
```

### 3. clientSecret debe venir del servidor

```typescript
// ❌ MALO: Crear clientSecret en cliente (expone Public Key)
const { client_secret } = await stripe.paymentIntents.create();

// ✅ BIEN: Backend crea, cliente recibe
const response = await fetch('/api/payment', { method: 'POST' });
const { clientSecret } = await response.json();
```

### 4. Elements debe estar dentro de Elements Provider

```typescript
// ❌ MALO: Elements fuera del provider
const addressElement = useElements(); // Devuelve null!

// ✅ BIEN: Elements dentro de <Elements> provider
function CheckoutPage() {
  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutStepper /> {/* Aquí useElements() funciona */}
    </Elements>
  );
}
```

### 5. Manejo de Errores de Stripe

```typescript
// Tipos de errores que puede devolver Stripe
try {
  const result = await elements.submit();
  if (result.error) {
    // Error de validación (campo incompleto, etc)
    toast.error(result.error.message);
  }
} catch (error) {
  // Error de red o sistema
  toast.error('Network error occurred');
}
```

### 6. Confirmation Token vs Payment Intent Status

```typescript
// El flujo correcto es:
// 1. Crear Payment Intent en backend
// 2. Cliente valida campos y crea Confirmation Token
// 3. Cliente envía Confirmation Token al backend
// 4. Backend confirma pago con Stripe
// 5. Backend retorna PaymentIntent status

// Nunca confíes en el cliente para validar
// El cliente apenas cifra y valida, el servidor confirma
```

### 7. Recovery de Session/Cache

Con React Query, el cache se pierde al recargar. Considera:

```typescript
// Opción 1: Persistir basket en localStorage
const [basket, setBasket] = useState(() => {
  const saved = localStorage.getItem('basket');
  return saved ? JSON.parse(saved) : null;
});

// Opción 2: Refetch al montar
useEffect(() => {
  refetch(); // Refetch basket desde servidor
}, []);

// Opción 3: Usar persistQueryClient de React Query
import { persistQueryClient } from '@tanstack/react-query-persist-client';
```

### 8. Payment Intent Lifecycle

```
REQUIRES_PAYMENT_METHOD
        ↓
REQUIRES_CONFIRMATION (usuario completa formulario)
        ↓
REQUIRES_ACTION (si se necesita 3D Secure, etc)
        ↓
PROCESSING
        ↓
SUCCEEDED ✓ o CANCELED/FAILED ✗
```

### 9. Testing con Tarjetas de Prueba

Stripe proporciona tarjetas para testing:

```
4242 4242 4242 4242 → Pago exitoso
4000 0000 0000 0002 → Tarjeta declinada
4000 0025 0000 3155 → 3D Secure requerido
```

### 10. Ambiente y Variables

```env
# Development
VITE_STRIPE_PK_KEY=pk_test_51234567890...
VITE_API_URL=http://localhost:5000/api

# Production
VITE_STRIPE_PK_KEY=pk_live_987654321...
VITE_API_URL=https://api.example.com/api
```

### 11. Mantener Propagación de Cookies

El backend basa el reconocimiento del `Basket` anónimo en una Cookie enviada en las cabeceras. Tu nuevo frontend **debe** incluir `credentials: 'include'` (o su equivalente para enviar cookies de origen, por ejemplo en preflight / requests de fetch o axios) en todos los requests hacia `/basket` y `/payment`. Sin esto, el carrito no sobrevivirá de una página a otra.

### 12. Cálculos Constantes de UI

Centraliza la lógica de los subtotales, recuentos del carrito (cantidad de _items_ global) y de la tarifa de flete en un custom hook/store global, debido a que múltiples componentes y diseños de Layout requerirán esa reactividad (por ejemplo, el badge rojo sobre el Icono de la cesta en tu NavBar).

---

## 🔗 Referencias Útiles

- **Documentación Stripe**: https://stripe.com/docs
- **Elements**: https://stripe.com/docs/stripe-js/elements/payment-element
- **ConfirmationToken**: https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements#web-create-payment-method
- **PaymentIntent API**: https://stripe.com/docs/api/payment_intents
- **React Query Docs**: https://tanstack.com/query/latest
- **Stripe + React Guide**: https://stripe.com/docs/stripe-js/react

---

## 📊 Comparativa: RTK Query vs React Query

### RTK Query (Proyecto Actual)

**Ventajas:**
- Integrado con Redux
- Caching automático
- `onQueryStarted` para optimistic updates
- Sincronización automática entre queries

**Desventajas:**
- Requiere Redux
- Más boilerplate
- Curva de aprendizaje mayor

### React Query (Nuevo Proyecto)

**Ventajas:**
- Independiente de state management
- Menos boilerplate
- Flexibilidad en caching
- Mejor para HTTP requests

**Desventajas:**
- No sincroniza con Redux
- Requiere manejo manual de cache
- Más responsabilidad del desarrollador

---

## 🎯 Resumen de Arquitectura

```
┌─────────────────────────────────────────┐
│           React + React Query           │
├─────────────────────────────────────────┤
│   ┌────────────────────────────────┐   │
│   │   BasketProvider (Context)     │   │
│   │   - Carrito en localStorage    │   │
│   └────────────────────────────────┘   │
├─────────────────────────────────────────┤
│   ┌────────────────────────────────┐   │
│   │  QueryClientProvider           │   │
│   │  - Cache HTTP requests         │   │
│   │  - Manejo de loading/error     │   │
│   └────────────────────────────────┘   │
├─────────────────────────────────────────┤
│   ┌────────────────────────────────┐   │
│   │  Stripe Elements Provider      │   │
│   │  - Dirección y Pago seguros    │   │
│   │  - ConfirmationToken validado  │   │
│   └────────────────────────────────┘   │
├─────────────────────────────────────────┤
│   ┌────────────────────────────────┐   │
│   │  Componentes Base HTML + CSS   │   │
│   │  - CheckoutStepper             │   │
│   │  - AddressForm                 │   │
│   │  - PaymentForm                 │   │
│   │  - Review                      │   │
│   └────────────────────────────────┘   │
└─────────────────────────────────────────┘

                    ↓ (API calls)
                    
┌─────────────────────────────────────────┐
│         Backend (Node.js/ASP.NET)       │
├─────────────────────────────────────────┤
│  POST /api/payment         → Stripe SDK │
│  POST /api/order           → Database   │
│  POST /account/address     → Database   │
│  GET  /basket              → Database   │
└─────────────────────────────────────────┘

                    ↓ (Webhooks)
                    
┌─────────────────────────────────────────┐
│            Stripe Servers                │
├─────────────────────────────────────────┤
│  Payment Processing        → Backend     │
│  Confirmation Webhook      → Backend     │
└─────────────────────────────────────────┘
```

---

## 📝 Checklist de Implementación

- [ ] Instalar paquetes NPM necesarios
- [ ] Configurar variables de entorno
- [ ] Crear BasketContext
- [ ] Configurar QueryClient
- [ ] Crear hooks de API (useCheckout, etc.)
- [ ] Crear componentes de UI (CheckoutPage, Stepper, Address, Payment)
- [ ] Integrar Stripe Elements
- [ ] Implementar flujo de Payment Intent
- [ ] Implementar flujo de ConfirmationToken
- [ ] Implementar confirmPayment
- [ ] Crear página de éxito (CheckoutSuccess)
- [ ] Agregar manejo de errores
- [ ] Agregar loading states
- [ ] Agregar validación de formas
- [ ] Testear con tarjetas de prueba de Stripe
- [ ] Implementar retry logic
- [ ] Documentar variables de entorno
- [ ] Revisar security checklist

---

Fin de la guía. Esta documentación cubre todos los aspectos técnicos necesarios para replicar la integración de Stripe en un proyecto con React Query y componentes base HTML/CSS.
