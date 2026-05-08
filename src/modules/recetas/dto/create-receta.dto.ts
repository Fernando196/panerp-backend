import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const IngredienteSchema = z.object({
  materiaPrimaId: z.string(),
  cantidad: z.number().min(0),
  unidad: z.string(),
  notas: z.string().optional(),
})

const PasoSchema = z.object({
  orden: z.number().int().min(1),
  descripcion: z.string(),
  tiempoMinutos: z.number().int().optional(),
})

export const CreateRecetaSchema = z.object({
  nombre: z.string(),
  descripcion: z.string().optional(),
  rendimientoEsperado: z.number().int().min(1),
  unidadRendimiento: z.string().optional(),
  ingredientes: z.array(IngredienteSchema),
  pasos: z.array(PasoSchema).optional(),
})

export class CreateRecetaDto extends createZodDto(CreateRecetaSchema) {}
export type CreateRecetaInput = z.infer<typeof CreateRecetaSchema>
