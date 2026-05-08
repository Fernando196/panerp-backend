import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Receta } from './receta.entity'

@Entity('pasos_receta')
export class PasoReceta {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'receta_id', type: 'char', length: 36 }) recetaId!: string
  @Column({ type: 'tinyint', unsigned: true }) orden!: number
  @Column({ type: 'text' }) descripcion!: string
  @Column({ name: 'tiempo_minutos', type: 'smallint', unsigned: true, nullable: true }) tiempoMinutos!: number

  @ManyToOne(() => Receta, r => r.pasos)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta
}
