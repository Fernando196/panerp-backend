import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('materia_prima')
export class MateriaPrima {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ length: 150 })
  nombre!: string

  @Column({ length: 80, nullable: true })
  categoria!: string

  @Column({ name: 'lugar_compra', length: 150, nullable: true })
  lugarCompra!: string

  @Column({ name: 'unidad_principal', length: 15 })
  unidadPrincipal!: string

  @Column({ name: 'costo_por_unidad', type: 'decimal', precision: 12, scale: 4, default: 0 })
  costoPorUnidad!: number

  @Column({ name: 'stock_actual', type: 'decimal', precision: 14, scale: 4, default: 0 })
  stockActual!: number

  @Column({ name: 'stock_minimo', type: 'decimal', precision: 14, scale: 4, default: 0 })
  stockMinimo!: number

  @Column({ name: 'fecha_ultima_compra', type: 'date', nullable: true })
  fechaUltimaCompra!: Date

  @Column({ name: 'fecha_caducidad', type: 'date', nullable: true })
  fechaCaducidad!: Date

  @Column({ default: true })
  activo!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date
}
