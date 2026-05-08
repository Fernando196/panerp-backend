import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateProductoSchema = z.object({
  receta_id: z.string().optional(),
  nombre: z.string(),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  peso_gramos: z.number().optional(),
  precio_venta: z.number().min(0),
  costo_produccion: z.number().min(0).optional(),
  dias_caducidad: z.number().int().min(1).optional(),
  reutilizable: z.boolean().optional(),
})

export class CreateProductoDto extends createZodDto(CreateProductoSchema) {}
export type CreateProductoInput = z.infer<typeof CreateProductoSchema>
