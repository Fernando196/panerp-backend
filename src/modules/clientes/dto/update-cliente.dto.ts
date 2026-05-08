import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { CreateClienteSchema } from './create-cliente.dto'

export const UpdateClienteSchema = CreateClienteSchema.partial()

export class UpdateClienteDto extends createZodDto(UpdateClienteSchema) {}
export type UpdateClienteInput = z.infer<typeof UpdateClienteSchema>
