import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Ingresa un correo valido.'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
});

export type LoginSchema = z.infer<typeof loginSchema>;