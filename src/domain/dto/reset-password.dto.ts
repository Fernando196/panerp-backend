import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const ResetPasswordSchema = z.object({
  token: z.string(),
  nueva_password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
