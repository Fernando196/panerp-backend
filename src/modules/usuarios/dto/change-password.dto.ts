import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const ChangePasswordSchema = z.object({
  nuevaPassword: z.string().min(6),
})

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
