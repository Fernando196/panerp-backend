import { createZodDto } from 'nestjs-zod'
import { CreateRecetaSchema } from './create-receta.dto'
import z from 'zod'

export const UpdateRecetaSchema = CreateRecetaSchema.partial()

export class UpdateRecetaDto extends createZodDto(UpdateRecetaSchema) {}
export type UpdateRecetaInput = z.infer<typeof UpdateRecetaSchema>
