import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Receta } from './receta.entity'

@Entity('ingredientes_receta')
export class IngredienteReceta {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'receta_id', type: 'char', length: 36 }) recetaId!: string
  @Column({ name: 'materia_prima_id', type: 'char', length: 36 }) materiaPrimaId!: string
  @Column({ type: 'decimal', precision: 14, scale: 4 }) cantidad!: number
  @Column({ length: 15 }) unidad!: string
  @Column({ length: 255, nullable: true }) notas!: string

  @ManyToOne(() => Receta, r => r.ingredientes)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta
}
