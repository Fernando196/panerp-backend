import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'

@Entity('clientes')
export class Cliente {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'nombre_negocio', length: 150 }) nombreNegocio!: string
  @Column({ length: 120, nullable: true }) responsable!: string
  @Column({ length: 20, nullable: true }) telefono!: string
  @Column({ length: 180, nullable: true }) email!: string
  @Column({ type: 'text', nullable: true }) direccion!: string
  @Column({ length: 120, nullable: true }) horario!: string
  @Column({ type: 'enum', enum: ['tienda', 'cafeteria', 'mercado', 'mayoreo'], default: 'tienda' }) tipo!: string
  @Column({ name: 'limite_credito', type: 'decimal', precision: 12, scale: 2, default: 1000 }) limiteCredito!: number
  @Column({ name: 'saldo_pendiente', type: 'decimal', precision: 12, scale: 2, default: 0 }) saldoPendiente!: number
  @Column({ name: 'tasa_interes_mora', type: 'decimal', precision: 5, scale: 2, default: 0 }) tasaInteresMora!: number
  @Column({ default: false }) bloqueado!: boolean
  @Column({ default: true }) activo!: boolean
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true }) deletedAt!: Date
}
