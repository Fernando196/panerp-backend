import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const FiltrosInventarioSchema = z.object({
  search: z.string().optional(),
  categoria: z.string().optional(),
  stockBajo: z.string().optional(),
})

export class FiltrosInventarioDto extends createZodDto(FiltrosInventarioSchema) {}
export type FiltrosInventarioInput = z.infer<typeof FiltrosInventarioSchema>
