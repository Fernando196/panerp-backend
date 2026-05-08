import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateClienteSchema = z.object({
  nombreNegocio: z.string(),
  responsable: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  direccion: z.string().optional(),
  horario: z.string().optional(),
  tipo: z.enum(['tienda', 'cafeteria', 'mercado', 'mayoreo']),
  limiteCredito: z.number().min(0).optional(),
  tasaInteresMora: z.number().min(0).optional(),
  notas: z.string().optional(),
})

export class CreateClienteDto extends createZodDto(CreateClienteSchema) {}
export type CreateClienteInput = z.infer<typeof CreateClienteSchema>
