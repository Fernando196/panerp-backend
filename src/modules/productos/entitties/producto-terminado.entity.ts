import { Receta } from '@/modules/recetas/entitties/receta.entity'
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity('productos_terminados')
export class ProductoTerminado {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'receta_id', type: 'char', length: 36, nullable: true }) recetaId!: string
  @Column({ length: 150 }) nombre!: string
  @Column({ length: 80, nullable: true }) categoria!: string
  @Column({ type: 'text', nullable: true }) descripcion!: string
  @Column({ name: 'peso_gramos', type: 'decimal', precision: 8, scale: 2, nullable: true }) pesoGramos!: number
  @Column({ name: 'precio_venta', type: 'decimal', precision: 10, scale: 2, default: 0 }) precioVenta!: number
  @Column({ name: 'costo_produccion', type: 'decimal', precision: 10, scale: 4, default: 0 }) costoProduccion!: number
  @Column({ name: 'dias_caducidad', type: 'tinyint', unsigned: true, nullable: true }) diasCaducidad!: number
  @Column({ default: false }) reutilizable!: boolean
  @Column({ default: true }) activo!: boolean
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true }) deletedAt!: Date

  @ManyToOne(() => Receta)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta
}
