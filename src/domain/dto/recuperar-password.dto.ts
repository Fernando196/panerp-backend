import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const RecuperarPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export class RecuperarPasswordDto extends createZodDto(RecuperarPasswordSchema) {}
export type RecuperarPasswordInput = z.infer<typeof RecuperarPasswordSchema>
