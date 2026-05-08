import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ name: 'materia_prima_id', type: 'char', length: 36 })
  materiaPrimaId!: string

  @Column({ name: 'usuario_id', type: 'char', length: 36 })
  usuarioId!: string

  @Column({ type: 'enum', enum: ['entrada', 'salida', 'ajuste', 'desperdicio', 'produccion'] })
  tipo!: string

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  cantidad!: number

  @Column({ length: 15 })
  unidad!: string

  @Column({ name: 'costo_unitario', type: 'decimal', precision: 12, scale: 4, nullable: true })
  costoUnitario!: number

  @Column({ name: 'stock_anterior', type: 'decimal', precision: 14, scale: 4 })
  stockAnterior!: number

  @Column({ name: 'stock_posterior', type: 'decimal', precision: 14, scale: 4 })
  stockPosterior!: number

  @Column({ name: 'referencia_id', type: 'char', length: 36, nullable: true })
  referenciaId!: string

  @Column({ name: 'referencia_tipo', length: 50, nullable: true })
  referenciaTipo!: string

  @Column({ type: 'text', nullable: true })
  notas!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
