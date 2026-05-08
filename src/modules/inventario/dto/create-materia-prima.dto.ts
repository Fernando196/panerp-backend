import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateMateriaPrimaSchema = z.object({
  nombre: z.string(),
  categoria: z.string().optional(),
  lugarCompra: z.string().optional(),
  unidadPrincipal: z.string(),
  costoPorUnidad: z.number().min(0),
  stockActual: z.number().min(0),
  stockMinimo: z.number().min(0),
  fechaCaducidad: z.string().optional(),
})

export class CreateMateriaPrimaDto extends createZodDto(CreateMateriaPrimaSchema) {}
export type CreateMateriaPrimaInput = z.infer<typeof CreateMateriaPrimaSchema>
