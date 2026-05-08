import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('clientes')
export class Cliente {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ length: 150 }) nombre_negocio!: string
  @Column({ length: 120, nullable: true }) responsable!: string
  @Column({ length: 20, nullable: true }) telefono!: string
  @Column({ length: 180, nullable: true }) email!: string
  @Column({ type: 'text', nullable: true }) direccion!: string
  @Column({ length: 120, nullable: true }) horario!: string
  @Column({ type: 'enum', enum: ['tienda', 'cafeteria', 'mercado', 'mayoreo'], default: 'tienda' }) tipo!: string
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1000 }) limite_credito!: number
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) saldo_pendiente!: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) tasa_interes_mora!: number
  @Column({ default: false }) bloqueado!: boolean
  @Column({ default: true }) activo!: boolean
  @Column({ type: 'text', nullable: true }) notas!: string
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date
  @Column({ type: 'timestamp', nullable: true }) deleted_at!: Date
}
