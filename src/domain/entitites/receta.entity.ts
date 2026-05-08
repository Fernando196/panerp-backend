import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm'

@Entity('recetas')
export class Receta {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ length: 150 }) nombre!: string
  @Column({ type: 'text', nullable: true }) descripcion!: string
  @Column({ type: 'int', unsigned: true, default: 1 }) rendimiento_esperado!: number
  @Column({ length: 50, default: 'piezas' }) unidad_rendimiento!: string
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) costo_estimado!: number
  @Column({ type: 'int', unsigned: true, nullable: true }) tiempo_total_minutos!: number
  @Column({ default: true }) activo!: boolean
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date
  @Column({ type: 'timestamp', nullable: true }) deleted_at!: Date

  @OneToMany(() => IngredienteReceta, i => i.receta) ingredientes!: IngredienteReceta[]
  @OneToMany(() => PasoReceta, p => p.receta) pasos!: PasoReceta[]
}

@Entity('ingredientes_receta')
export class IngredienteReceta {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) receta_id!: string
  @Column({ type: 'char', length: 36 }) materia_prima_id!: string
  @Column({ type: 'decimal', precision: 14, scale: 4 }) cantidad!: number
  @Column({ length: 15 }) unidad!: string
  @Column({ length: 255, nullable: true }) notas!: string

  @ManyToOne(() => Receta, r => r.ingredientes)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta
}

@Entity('pasos_receta')
export class PasoReceta {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) receta_id!: string
  @Column({ type: 'tinyint', unsigned: true }) orden!: number
  @Column({ type: 'text' }) descripcion!: string
  @Column({ type: 'smallint', unsigned: true, nullable: true }) tiempo_minutos!: number

  @ManyToOne(() => Receta, r => r.pasos)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta
}
