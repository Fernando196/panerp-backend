import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('notificaciones')
export class Notificacion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ type: 'enum', enum: ['inventario_bajo', 'deuda_vencida', 'producto_caducando', 'produccion_pendiente', 'devolucion_pendiente', 'cobranza', 'sistema'] }) tipo!: string
  @Column({ length: 150 }) titulo!: string
  @Column({ type: 'text' }) mensaje!: string
  @Column({ default: false }) leida!: boolean
  @CreateDateColumn() created_at!: Date
}
