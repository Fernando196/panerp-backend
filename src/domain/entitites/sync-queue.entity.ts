import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ length: 80 }) tabla!: string
  @Column({ type: 'enum', enum: ['INSERT', 'UPDATE', 'DELETE'] }) operacion!: string
  @Column({ type: 'char', length: 36 }) registro_id!: string
  @Column({ type: 'json' }) payload!: Record<string, unknown>
  @Column({ type: 'tinyint', unsigned: true, default: 0 }) intentos!: number
  @Column({ default: false }) sincronizado!: boolean
  @Column({ type: 'text', nullable: true }) error_mensaje!: string
  @CreateDateColumn() created_at!: Date
  @Column({ type: 'timestamp', nullable: true }) sincronizado_at!: Date
}
