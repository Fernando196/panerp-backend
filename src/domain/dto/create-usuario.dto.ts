import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateUsuarioSchema = z.object({
  nombre: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  rol_id: z.number().int(),
})

export class CreateUsuarioDto extends createZodDto(CreateUsuarioSchema) {}
export type CreateUsuarioInput = z.infer<typeof CreateUsuarioSchema>
