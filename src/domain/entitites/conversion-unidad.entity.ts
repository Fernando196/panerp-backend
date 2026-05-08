import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('conversiones_unidad')
export class ConversionUnidad {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ type: 'char', length: 36 })
  materia_prima_id!: string

  @Column({ length: 15 })
  unidad_origen!: string

  @Column({ length: 15 })
  unidad_destino!: string

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  factor!: number

  @CreateDateColumn()
  created_at!: Date
}
