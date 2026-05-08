import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Receta } from './receta.entity'
import { Usuario } from './usuario.entity'

@Entity('ordenes_produccion')
export class OrdenProduccion {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ type: 'char', length: 36 })
  receta_id!: string

  @Column({ type: 'char', length: 36 })
  usuario_id!: string

  @Column({ type: 'int', unsigned: true })
  cantidad_a_producir!: number

  @Column({ type: 'int', unsigned: true, default: 0 })
  cantidad_producida!: number

  @Column({ type: 'enum', enum: ['programada', 'en_proceso', 'completada', 'cancelada'], default: 'programada' })
  estado!: string

  @Column({ type: 'date' })
  fecha_programada!: Date

  @Column({ type: 'text', nullable: true })
  notas!: string

  @Column({ type: 'timestamp', nullable: true })
  iniciada_at!: Date

  @Column({ type: 'timestamp', nullable: true })
  completada_at!: Date

  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date

  @ManyToOne(() => Receta)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario
}
