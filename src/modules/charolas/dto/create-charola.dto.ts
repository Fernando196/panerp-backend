import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateCharolaSchema = z.object({
  numeroInterno: z.string(),
  notas: z.string().optional(),
})

export class CreateCharolaDto extends createZodDto(CreateCharolaSchema) {}
export type CreateCharolaInput = z.infer<typeof CreateCharolaSchema>
