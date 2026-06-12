import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña.'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof registerSchema>;
