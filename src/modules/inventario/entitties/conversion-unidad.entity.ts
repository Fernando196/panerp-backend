import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('conversiones_unidad')
export class ConversionUnidad {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ name: 'materia_prima_id', type: 'char', length: 36 })
  materiaPrimaId!: string

  @Column({ name: 'unidad_origen', length: 15 })
  unidadOrigen!: string

  @Column({ name: 'unidad_destino', length: 15 })
  unidadDestino!: string

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  factor!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
