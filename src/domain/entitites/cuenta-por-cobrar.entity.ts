import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('cuentas_por_cobrar')
export class CuentaPorCobrar {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) cliente_id!: string
  @Column({ type: 'char', length: 36, nullable: true }) entrega_id!: string
  @Column({ type: 'decimal', precision: 12, scale: 2 }) monto_original!: number
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) monto_pagado!: number
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) interes_acumulado!: number
  @Column({ type: 'date' }) fecha_emision!: Date
  @Column({ type: 'date' }) fecha_vencimiento!: Date
  @Column({ type: 'enum', enum: ['pendiente', 'pagada', 'vencida', 'cancelada'], default: 'pendiente' }) estado!: string
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date
}

@Entity('pagos')
export class Pago {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) cuenta_cobrar_id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ type: 'decimal', precision: 12, scale: 2 }) monto!: number
  @Column({ type: 'enum', enum: ['efectivo', 'transferencia', 'cheque', 'otro'], default: 'efectivo' }) metodo_pago!: string
  @Column({ type: 'date' }) fecha_pago!: Date
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn() created_at!: Date
}

@Entity('transacciones')
export class Transaccion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ type: 'enum', enum: ['ingreso', 'egreso'] }) tipo!: string
  @Column({ type: 'enum', enum: ['venta', 'compra_mp', 'devolucion', 'pago_recibido', 'gasto_operativo', 'ajuste', 'otro'] }) categoria!: string
  @Column({ type: 'decimal', precision: 12, scale: 2 }) monto!: number
  @Column({ type: 'char', length: 36, nullable: true }) referencia_id!: string
  @Column({ length: 60, nullable: true }) referencia_tipo!: string
  @Column({ type: 'text', nullable: true }) descripcion!: string
  @Column({ type: 'date' }) fecha!: Date
  @CreateDateColumn() created_at!: Date
}
