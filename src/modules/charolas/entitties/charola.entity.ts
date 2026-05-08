import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('charolas')
export class Charola {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string
  @Column({ name: 'numero_interno', length: 30, unique: true }) numeroInterno!: string
  @Column({ type: 'enum', enum: ['disponible', 'en_entrega', 'devuelta', 'baja'], default: 'disponible' }) estado!: string
  @Column({ type: 'text', nullable: true }) notas!: string
  @Column({ default: true }) activo!: boolean
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date
}
