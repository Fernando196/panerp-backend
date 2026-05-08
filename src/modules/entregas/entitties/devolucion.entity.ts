import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Entrega } from './entrega.entity'

@Entity('devoluciones')
export class Devolucion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'entrega_id', type: 'char', length: 36 }) entregaId!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ name: 'fecha_devolucion', type: 'date' }) fechaDevolucion!: Date
  @Column({ type: 'enum', enum: ['pendiente', 'procesada', 'cancelada'], default: 'pendiente' }) estado!: string
  @Column({ type: 'text', nullable: true }) notas!: string

  @ManyToOne(() => Entrega)
  @JoinColumn({ name: 'entrega_id' })
  entrega!: Entrega
}
