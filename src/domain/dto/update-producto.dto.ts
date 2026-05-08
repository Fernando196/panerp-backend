import { createZodDto } from 'nestjs-zod'
import { CreateProductoSchema } from './create-producto.dto'
import z from 'zod'

export const UpdateProductoSchema = CreateProductoSchema.partial()

export class UpdateProductoDto extends createZodDto(UpdateProductoSchema) {}
export type UpdateProductoInput = z.infer<typeof UpdateProductoSchema>
