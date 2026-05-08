import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('charolas')
export class Charola {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ length: 30, unique: true }) numero_interno!: string
  @Column({ type: 'enum', enum: ['disponible', 'en_entrega', 'devuelta', 'baja'], default: 'disponible' }) estado!: string
  @Column({ type: 'text', nullable: true }) notas!: string
  @Column({ default: true }) activo!: boolean
  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date
}
