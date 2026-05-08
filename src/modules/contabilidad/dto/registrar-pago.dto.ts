import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const RegistrarPagoSchema = z.object({
  monto: z.number().min(0.01),
  metodoPago: z.enum(['efectivo', 'transferencia', 'cheque', 'otro']),
  fechaPago: z.string(),
  notas: z.string().optional(),
})

export class RegistrarPagoDto extends createZodDto(RegistrarPagoSchema) {}
export type RegistrarPagoInput = z.infer<typeof RegistrarPagoSchema>
