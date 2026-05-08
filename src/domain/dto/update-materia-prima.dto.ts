import { createZodDto } from 'nestjs-zod'
import { CreateMateriaPrimaSchema } from './create-materia-prima.dto'
import z from 'zod'

export const UpdateMateriaPrimaSchema = CreateMateriaPrimaSchema.partial()

export class UpdateMateriaPrimaDto extends createZodDto(UpdateMateriaPrimaSchema) {}
export type UpdateMateriaPrimaInput = z.infer<typeof UpdateMateriaPrimaSchema>
