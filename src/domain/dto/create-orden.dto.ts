import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateOrdenSchema = z.object({
  receta_id: z.string(),
  cantidad_a_producir: z.number().int().min(1),
  fecha_programada: z.string(),
  notas: z.string().optional(),
})

export class CreateOrdenDto extends createZodDto(CreateOrdenSchema) {}
export type CreateOrdenInput = z.infer<typeof CreateOrdenSchema>
