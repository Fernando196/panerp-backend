import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateConversionSchema = z.object({
  unidad_origen: z.string(),
  unidad_destino: z.string(),
  factor: z.number().min(0),
})

export class CreateConversionDto extends createZodDto(CreateConversionSchema) {}
export type CreateConversionInput = z.infer<typeof CreateConversionSchema>
