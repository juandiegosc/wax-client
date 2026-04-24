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
  identificationType: requiredText('El tipo de identificacion', 20),
  identificationNumber: requiredText('El numero de identificacion', 20),
  phone: requiredText('El telefono', 20),
  name: requiredText('El nombre completo para facturacion', 100),
  line1: requiredText('La direccion principal', 200),
  line2: z.string().trim().max(120, 'La direccion complementaria no puede superar 120 caracteres.').optional().or(z.literal('')),
  city: requiredText('La ciudad', 100),
  state: requiredText('La provincia o estado', 100),
  postalCode: requiredText('El codigo postal', 20),
  country: requiredText('El pais', 100),
});

export type BillingProfileSchema = z.infer<typeof billingProfileSchema>;