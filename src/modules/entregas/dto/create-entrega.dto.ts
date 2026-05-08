import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const ItemEntregaSchema = z.object({
  id: z.string(),
  loteProductoId: z.string(),
  charolaId: z.string().optional(),
  cantidad: z.number().min(1),
  precioUnitario: z.number().min(0),
})

export const CreateEntregaSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  fechaEntrega: z.string(),
  fechaRecoleccionProg: z.string().optional(),
  items: z.array(ItemEntregaSchema),
})

export class CreateEntregaDto extends createZodDto(CreateEntregaSchema) {}
export type CreateEntregaInput = z.infer<typeof CreateEntregaSchema>
