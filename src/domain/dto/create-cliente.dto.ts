import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateClienteSchema = z.object({
  nombre_negocio: z.string(),
  responsable: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  direccion: z.string().optional(),
  horario: z.string().optional(),
  tipo: z.enum(['tienda', 'cafeteria', 'mercado', 'mayoreo']),
  limite_credito: z.number().min(0).optional(),
  tasa_interes_mora: z.number().min(0).optional(),
  notas: z.string().optional(),
})

export class CreateClienteDto extends createZodDto(CreateClienteSchema) {}
export type CreateClienteInput = z.infer<typeof CreateClienteSchema>
