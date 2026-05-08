import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Devolucion } from './devolucion.entity'

@Entity('detalle_devolucion')
export class DetalleDevolucion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'devolucion_id', type: 'char', length: 36 }) devolucionId!: string
  @Column({ name: 'detalle_entrega_id', type: 'char', length: 36 }) detalleEntregaId!: string
  @Column({ name: 'cantidad_devuelta', type: 'int', unsigned: true }) cantidadDevuelta!: number
  @Column({ default: false }) reutilizable!: boolean
  @Column({ length: 255, nullable: true }) motivo!: string

  @ManyToOne(() => Devolucion)
  @JoinColumn({ name: 'devolucion_id' })
  devolucion!: Devolucion
}
