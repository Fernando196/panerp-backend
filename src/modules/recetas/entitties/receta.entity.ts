import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { PasoReceta } from './paso-receta.entity'
import { IngredienteReceta } from './ingrediente-receta.entity'
import { ProductoTerminado } from '@/modules/productos/entitties/producto-terminado.entity'

@Entity('recetas')
export class Receta {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ length: 150 }) nombre!: string
  @Column({ type: 'text', nullable: true }) descripcion!: string
  @Column({ name: 'rendimiento_esperado', type: 'int', unsigned: true, default: 1 }) rendimientoEsperado!: number
  @Column({ name: 'unidad_rendimiento', length: 50, default: 'piezas' }) unidadRendimiento!: string
  @Column({ name: 'costo_estimado', type: 'decimal', precision: 12, scale: 2, default: 0 }) costoEstimado!: number
  @Column({ name: 'tiempo_total_minutos', type: 'int', unsigned: true, nullable: true }) tiempoTotalMinutos!: number
  @Column({ default: true }) activo!: boolean
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true }) deletedAt!: Date

  @OneToMany(() => IngredienteReceta, i => i.receta) ingredientes!: IngredienteReceta[]
  @OneToMany(() => PasoReceta, p => p.receta) pasos!: PasoReceta[]
  @OneToMany(()=> ProductoTerminado, p => p.receta) productos!: ProductoTerminado[]
}
