import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const RegistrarPagoSchema = z.object({
  monto: z.number().min(0.01),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'cheque', 'otro']),
  fecha_pago: z.string(),
  notas: z.string().optional(),
})

export class RegistrarPagoDto extends createZodDto(RegistrarPagoSchema) {}
export type RegistrarPagoInput = z.infer<typeof RegistrarPagoSchema>
