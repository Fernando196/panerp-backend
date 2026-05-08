import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { ProductoTerminado } from './producto-terminado.entity'

@Entity('lotes_producto')
export class LoteProducto {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'producto_id', type: 'char', length: 36 }) productoId!: string
  @Column({ name: 'orden_produccion_id', type: 'char', length: 36, nullable: true }) ordenProduccionId!: string
  @Column({ name: 'numero_lote', length: 50, unique: true }) numeroLote!: string
  @Column({ name: 'cantidad_inicial', type: 'int', unsigned: true }) cantidadInicial!: number
  @Column({ name: 'cantidad_disponible', type: 'int', unsigned: true }) cantidadDisponible!: number
  @Column({ name: 'cantidad_vendida', type: 'int', unsigned: true, default: 0 }) cantidadVendida!: number
  @Column({ name: 'cantidad_devuelta', type: 'int', unsigned: true, default: 0 }) cantidadDevuelta!: number
  @Column({ name: 'cantidad_desperdicio', type: 'int', unsigned: true, default: 0 }) cantidadDesperdicio!: number
  @Column({ name: 'fecha_elaboracion', type: 'date' }) fechaElaboracion!: Date
  @Column({ name: 'fecha_caducidad', type: 'date', nullable: true }) fechaCaducidad!: Date
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date

  @ManyToOne(() => ProductoTerminado)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoTerminado
}
