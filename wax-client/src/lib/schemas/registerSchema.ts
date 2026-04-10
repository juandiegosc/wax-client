import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Ingresa un correo valido.'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
  confirmPassword: z.string().min(6, 'Confirma tu contrasena.'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Las contrasenas no coinciden.',
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof registerSchema>;