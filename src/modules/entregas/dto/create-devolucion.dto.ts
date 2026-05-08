import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const ItemDevolucionSchema = z.object({
  detalleEntregaId: z.string(),
  cantidadDevuelta: z.number().min(0),
  reutilizable: z.boolean().optional(),
  motivo: z.string().optional(),
})

export const CreateDevolucionSchema = z.object({
  fechaDevolucion: z.string(),
  items: z.array(ItemDevolucionSchema),
})

export class CreateDevolucionDto extends createZodDto(CreateDevolucionSchema) {}
export type CreateDevolucionInput = z.infer<typeof CreateDevolucionSchema>
