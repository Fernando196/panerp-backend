import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const MovimientoSchema = z.object({
  cantidad: z.number().min(0),
  unidad: z.string(),
  costo_unitario: z.number().optional(),
  notas: z.string().optional(),
  referencia_id: z.string().optional(),
  referencia_tipo: z.string().optional(),
})

export class MovimientoDto extends createZodDto(MovimientoSchema) {}
export type MovimientoInput = z.infer<typeof MovimientoSchema>
