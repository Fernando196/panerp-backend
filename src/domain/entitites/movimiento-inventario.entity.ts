import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ type: 'char', length: 36 })
  materia_prima_id!: string

  @Column({ type: 'char', length: 36 })
  usuario_id!: string

  @Column({ type: 'enum', enum: ['entrada', 'salida', 'ajuste', 'desperdicio', 'produccion'] })
  tipo!: string

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  cantidad!: number

  @Column({ length: 15 })
  unidad!: string

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  costo_unitario!: number

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  stock_anterior!: number

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  stock_posterior!: number

  @Column({ type: 'char', length: 36, nullable: true })
  referencia_id!: string

  @Column({ length: 50, nullable: true })
  referencia_tipo!: string

  @Column({ type: 'text', nullable: true })
  notas!: string

  @CreateDateColumn()
  created_at!: Date
}
