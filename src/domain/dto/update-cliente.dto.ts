import { createZodDto } from 'nestjs-zod'
import { CreateClienteSchema } from './create-cliente.dto'
import z from 'zod'

export const UpdateClienteSchema = CreateClienteSchema.partial()

export class UpdateClienteDto extends createZodDto(UpdateClienteSchema) {}
export type UpdateClienteInput = z.infer<typeof UpdateClienteSchema>
