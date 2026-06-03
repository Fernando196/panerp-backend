import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export class LoginDto extends createZodDto(LoginSchema) {}
export type LoginInput = z.infer<typeof LoginSchema>
