import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Entrega } from './entrega.entity'

@Entity('devoluciones')
export class Devolucion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) entrega_id!: string
  @Column({ type: 'char', length: 36 }) usuario_id!: string
  @Column({ type: 'date' }) fecha_devolucion!: Date
  @Column({ type: 'enum', enum: ['pendiente', 'procesada', 'cancelada'], default: 'pendiente' }) estado!: string
  @Column({ type: 'text', nullable: true }) notas!: string

  @ManyToOne(() => Entrega)
  @JoinColumn({ name: 'entrega_id' })
  entrega!: Entrega
}

@Entity('detalle_devolucion')
export class DetalleDevolucion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) devolucion_id!: string
  @Column({ type: 'char', length: 36 }) detalle_entrega_id!: string
  @Column({ type: 'int', unsigned: true }) cantidad_devuelta!: number
  @Column({ default: false }) reutilizable!: boolean
  @Column({ length: 255, nullable: true }) motivo!: string

  @ManyToOne(() => Devolucion)
  @JoinColumn({ name: 'devolucion_id' })
  devolucion!: Devolucion
}

@Entity('reutilizaciones')
export class Reutilizacion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ type: 'char', length: 36 }) detalle_devolucion_id!: string
  @Column({ type: 'char', length: 36 }) orden_produccion_id!: string
  @Column({ type: 'int', unsigned: true }) cantidad!: number
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn() created_at!: Date
}
