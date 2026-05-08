import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity('productos_terminados')
export class ProductoTerminado {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36, nullable: true }) receta_id!: string
  @Column({ length: 150 }) nombre!: string
  @Column({ length: 80, nullable: true }) categoria!: string
  @Column({ type: 'text', nullable: true }) descripcion!: string
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true }) peso_gramos!: number
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) precio_venta!: number
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 }) costo_produccion!: number
  @Column({ type: 'tinyint', unsigned: true, nullable: true }) dias_caducidad!: number
  @Column({ default: false }) reutilizable!: boolean
  @Column({ default: true }) activo!: boolean
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date
  @Column({ type: 'timestamp', nullable: true }) deleted_at!: Date
}

@Entity('lotes_producto')
export class LoteProducto {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) producto_id!: string
  @Column({ type: 'char', length: 36, nullable: true }) orden_produccion_id!: string
  @Column({ length: 50, unique: true }) numero_lote!: string
  @Column({ type: 'int', unsigned: true }) cantidad_inicial!: number
  @Column({ type: 'int', unsigned: true }) cantidad_disponible!: number
  @Column({ type: 'int', unsigned: true, default: 0 }) cantidad_vendida!: number
  @Column({ type: 'int', unsigned: true, default: 0 }) cantidad_devuelta!: number
  @Column({ type: 'int', unsigned: true, default: 0 }) cantidad_desperdicio!: number
  @Column({ type: 'date' }) fecha_elaboracion!: Date
  @Column({ type: 'date', nullable: true }) fecha_caducidad!: Date
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date

  @ManyToOne(() => ProductoTerminado)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoTerminado
}
