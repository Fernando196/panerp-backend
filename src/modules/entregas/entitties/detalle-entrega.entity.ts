import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Entrega } from './entrega.entity'

@Entity('detalle_entrega')
export class DetalleEntrega {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'entrega_id', type: 'char', length: 36 }) entregaId!: string
  @Column({ name: 'lote_producto_id', type: 'char', length: 36 }) loteProductoId!: string
  @Column({ name: 'charola_id', type: 'char', length: 36, nullable: true }) charolaId!: string
  @Column({ name: 'cantidad_entregada', type: 'int', unsigned: true }) cantidadEntregada!: number
  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 }) precioUnitario!: number

  @ManyToOne(() => Entrega, e => e.detalles)
  @JoinColumn({ name: 'entrega_id' })
  entrega!: Entrega
}
