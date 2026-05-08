import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity('transacciones')
export class Transaccion {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ type: 'enum', enum: ['ingreso', 'egreso'] }) tipo!: string
  @Column({ type: 'enum', enum: ['venta', 'compra_mp', 'devolucion', 'pago_recibido', 'gasto_operativo', 'ajuste', 'otro'] }) categoria!: string
  @Column({ type: 'decimal', precision: 12, scale: 2 }) monto!: number
  @Column({ name: 'referencia_id', type: 'char', length: 36, nullable: true }) referenciaId!: string
  @Column({ name: 'referencia_tipo', length: 60, nullable: true }) referenciaTipo!: string
  @Column({ type: 'text', nullable: true }) descripcion!: string
  @Column({ type: 'date' }) fecha!: Date
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
}
