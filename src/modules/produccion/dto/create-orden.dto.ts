import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateOrdenSchema = z.object({
  recetaId: z.string(),
  cantidadAProducir: z.number().int().min(1),
  fechaProgramada: z.string(),
  notas: z.string().optional(),
})

export class CreateOrdenDto extends createZodDto(CreateOrdenSchema) {}
export type CreateOrdenInput = z.infer<typeof CreateOrdenSchema>
