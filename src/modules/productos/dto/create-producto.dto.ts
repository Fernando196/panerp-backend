import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateProductoSchema = z.object({
  recetaId: z.string().optional(),
  nombre: z.string(),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  pesoGramos: z.number().optional(),
  precioVenta: z.number().min(0),
  costoProduccion: z.number().min(0).optional(),
  diasCaducidad: z.number().int().min(1).optional(),
  reutilizable: z.boolean().optional(),
})

export class CreateProductoDto extends createZodDto(CreateProductoSchema) {}
export type CreateProductoInput = z.infer<typeof CreateProductoSchema>
