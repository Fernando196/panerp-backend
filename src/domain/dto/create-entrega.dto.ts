import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const ItemEntregaSchema = z.object({
  lote_producto_id: z.string(),
  charola_id: z.string().optional(),
  cantidad: z.number().min(1),
  precio_unitario: z.number().min(0),
})

export const CreateEntregaSchema = z.object({
  cliente_id: z.string(),
  fecha_entrega: z.string(),
  fecha_recoleccion_prog: z.string().optional(),
  items: z.array(ItemEntregaSchema),
})

export class CreateEntregaDto extends createZodDto(CreateEntregaSchema) {}
export type CreateEntregaInput = z.infer<typeof CreateEntregaSchema>
