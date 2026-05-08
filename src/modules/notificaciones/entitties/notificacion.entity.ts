import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('notificaciones')
export class Notificacion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ type: 'enum', enum: ['inventario_bajo', 'deuda_vencida', 'producto_caducando', 'produccion_pendiente', 'devolucion_pendiente', 'cobranza', 'sistema'] }) tipo!: string
  @Column({ length: 150 }) titulo!: string
  @Column({ type: 'text' }) mensaje!: string
  @Column({ default: false }) leida!: boolean
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
}
