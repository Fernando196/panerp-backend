import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('materia_prima')
export class MateriaPrima {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ length: 150 })
  nombre!: string

  @Column({ length: 80, nullable: true })
  categoria!: string

  @Column({ length: 150, nullable: true })
  lugar_compra!: string

  @Column({ length: 15 })
  unidad_principal!: string

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  costo_por_unidad!: number

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  stock_actual!: number

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  stock_minimo!: number

  @Column({ type: 'date', nullable: true })
  fecha_ultima_compra!: Date

  @Column({ type: 'date', nullable: true })
  fecha_caducidad!: Date

  @Column({ default: true })
  activo!: boolean

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date
}
