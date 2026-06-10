import { z } from 'zod';

const requiredText = (label: string, maxLength?: number) => {
  let schema = z.string().trim().min(1, `${label} es obligatorio.`);

  if (maxLength) {
    schema = schema.max(maxLength, `${label} no puede superar ${maxLength} caracteres.`);
  }

  return schema;
};

export const billingProfileSchema = z.object({
  firstName: requiredText('El nombre', 50),
  lastName: requiredText('El apellido', 50),
  identificationType: requiredText('El tipo de identificación', 20),
  identificationNumber: requiredText('El número de identificación', 20),
  phone: requiredText('El teléfono', 20),
  name: requiredText('El nombre completo para facturación', 100),
  line1: requiredText('La dirección principal', 200),
  line2: z.string().trim().max(120, 'La dirección complementaria no puede superar 120 caracteres.').optional().or(z.literal('')),
  city: requiredText('La ciudad', 100),
  state: requiredText('La provincia o estado', 100),
  postalCode: requiredText('El código postal', 20),
  country: requiredText('El país', 100),
});

export type BillingProfileSchema = z.infer<typeof billingProfileSchema>;
