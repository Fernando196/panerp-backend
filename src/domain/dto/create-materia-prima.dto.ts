import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateMateriaPrimaSchema = z.object({
  nombre: z.string(),
  categoria: z.string().optional(),
  lugar_compra: z.string().optional(),
  unidad_principal: z.string(),
  costo_por_unidad: z.number().min(0),
  stock_actual: z.number().min(0),
  stock_minimo: z.number().min(0),
  fecha_caducidad: z.string().optional(),
})

export class CreateMateriaPrimaDto extends createZodDto(CreateMateriaPrimaSchema) {}
export type CreateMateriaPrimaInput = z.infer<typeof CreateMateriaPrimaSchema>
