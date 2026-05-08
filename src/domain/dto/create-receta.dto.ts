import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const IngredienteSchema = z.object({
  materia_prima_id: z.string(),
  cantidad: z.number().min(0),
  unidad: z.string(),
  notas: z.string().optional(),
})

const PasoSchema = z.object({
  orden: z.number().int().min(1),
  descripcion: z.string(),
  tiempo_minutos: z.number().int().optional(),
})

export const CreateRecetaSchema = z.object({
  nombre: z.string(),
  descripcion: z.string().optional(),
  rendimiento_esperado: z.number().int().min(1),
  unidad_rendimiento: z.string().optional(),
  ingredientes: z.array(IngredienteSchema),
  pasos: z.array(PasoSchema).optional(),
})

export class CreateRecetaDto extends createZodDto(CreateRecetaSchema) {}
export type CreateRecetaInput = z.infer<typeof CreateRecetaSchema>
