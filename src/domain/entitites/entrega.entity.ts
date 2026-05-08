import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Cliente } from './cliente.entity'
import { Usuario } from './usuario.entity'

@Entity('detalle_entrega')
export class DetalleEntrega {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) entrega_id!: string
  @Column({ type: 'char', length: 36 }) lote_producto_id!: string
  @Column({ type: 'char', length: 36, nullable: true }) charola_id!: string
  @Column({ type: 'int', unsigned: true }) cantidad_entregada!: number
  @Column({ type: 'decimal', precision: 10, scale: 2 }) precio_unitario!: number

  @ManyToOne(() => Entrega, e => e.detalles)
  @JoinColumn({ name: 'entrega_id' })
  entrega!: Entrega
}

@Entity('entregas')
export class Entrega {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) cliente_id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ type: 'date' }) fecha_entrega!: Date
  @Column({ type: 'date', nullable: true }) fecha_recoleccion_prog!: Date
  @Column({ type: 'enum', enum: ['preparando', 'entregada', 'recolectada', 'cancelada'], default: 'preparando' }) estado!: string
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) total_entregado_valor!: number
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) total_vendido_valor!: number
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) total_devuelto_valor!: number
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date

  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente!: Cliente
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) usuario!: Usuario
  @OneToMany(() => DetalleEntrega, d => d.entrega) detalles!: DetalleEntrega[]
}
