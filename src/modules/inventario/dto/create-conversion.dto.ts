import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateConversionSchema = z.object({
  unidadOrigen: z.string(),
  unidadDestino: z.string(),
  factor: z.number().min(0),
})

export class CreateConversionDto extends createZodDto(CreateConversionSchema) {}
export type CreateConversionInput = z.infer<typeof CreateConversionSchema>
