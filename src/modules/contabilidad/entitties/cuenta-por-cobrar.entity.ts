import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('cuentas_por_cobrar')
export class CuentaPorCobrar {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'cliente_id', type: 'char', length: 36 }) clienteId!: string
  @Column({ name: 'entrega_id', type: 'char', length: 36, nullable: true }) entregaId!: string
  @Column({ name: 'monto_original', type: 'decimal', precision: 12, scale: 2 }) montoOriginal!: number
  @Column({ name: 'monto_pagado', type: 'decimal', precision: 12, scale: 2, default: 0 }) montoPagado!: number
  @Column({ name: 'interes_acumulado', type: 'decimal', precision: 12, scale: 2, default: 0 }) interesAcumulado!: number
  @Column({ name: 'fecha_emision', type: 'date' }) fechaEmision!: Date
  @Column({ name: 'fecha_vencimiento', type: 'date' }) fechaVencimiento!: Date
  @Column({ type: 'enum', enum: ['pendiente', 'pagada', 'vencida', 'cancelada'], default: 'pendiente' }) estado!: string
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date
}
