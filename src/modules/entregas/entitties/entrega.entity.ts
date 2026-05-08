import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Cliente } from '../../clientes/entitties/cliente.entity'
import { Usuario } from '../../usuarios/entitties/usuario.entity'
import { DetalleEntrega } from './detalle-entrega.entity'

@Entity('entregas')
export class Entrega {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'cliente_id', type: 'char', length: 36 }) clienteId!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ name: 'fecha_entrega', type: 'date' }) fechaEntrega!: Date
  @Column({ name: 'fecha_recoleccion_prog', type: 'date', nullable: true }) fechaRecoleccionProg!: Date
  @Column({ type: 'enum', enum: ['preparando', 'entregada', 'recolectada', 'cancelada'], default: 'preparando' }) estado!: string
  @Column({ name: 'total_entregado_valor', type: 'decimal', precision: 12, scale: 2, default: 0 }) totalEntregadoValor!: number
  @Column({ name: 'total_vendido_valor', type: 'decimal', precision: 12, scale: 2, default: 0 }) totalVendidoValor!: number
  @Column({ name: 'total_devuelto_valor', type: 'decimal', precision: 12, scale: 2, default: 0 }) totalDevueltoValor!: number
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at'}) updatedAt!: Date

  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente!: Cliente
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) usuario!: Usuario
  @OneToMany(() => DetalleEntrega, d => d.entrega) detalles!: DetalleEntrega[]
}
