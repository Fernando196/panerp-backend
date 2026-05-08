import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const UpdateUsuarioSchema = z.object({
  nombre: z.string().optional(),
  email: z.string().email().optional(),
  rolId: z.number().int().optional(),
})

export class UpdateUsuarioDto extends createZodDto(UpdateUsuarioSchema) {}
export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>
