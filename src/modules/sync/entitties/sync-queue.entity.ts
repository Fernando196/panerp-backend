import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ length: 80 }) tabla!: string
  @Column({ type: 'enum', enum: ['INSERT', 'UPDATE', 'DELETE'] }) operacion!: string
  @Column({ name: 'registro_id', type: 'char', length: 36 }) registroId!: string
  @Column({ type: 'json' }) payload!: Record<string, unknown>
  @Column({ type: 'tinyint', unsigned: true, default: 0 }) intentos!: number
  @Column({ default: false }) sincronizado!: boolean
  @Column({ name: 'error_mensaje', type: 'text', nullable: true }) errorMensaje!: string
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @Column({ name: 'sincronizado_at', type: 'timestamp', nullable: true }) sincronizadoAt!: Date
}
