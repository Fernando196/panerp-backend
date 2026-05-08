import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity('pagos')
export class Pago {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'cuenta_cobrar_id', type: 'char', length: 36 }) cuentaCobrarId!: string
  @Column({ name: 'usuario_id', type: 'char', length: 36 }) usuarioId!: string
  @Column({ type: 'decimal', precision: 12, scale: 2 }) monto!: number
  @Column({ name: 'metodo_pago', type: 'enum', enum: ['efectivo', 'transferencia', 'cheque', 'otro'], default: 'efectivo' }) metodoPago!: string
  @Column({ name: 'fecha_pago', type: 'date' }) fechaPago!: Date
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
}
