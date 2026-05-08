import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity('reutilizaciones')
export class Reutilizacion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'detalle_devolucion_id', type: 'char', length: 36 }) detalleDevolucionId!: string
  @Column({ name: 'orden_produccion_id', type: 'char', length: 36 }) ordenProduccionId!: string
  @Column({ type: 'int', unsigned: true }) cantidad!: number
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
}
