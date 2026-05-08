import { Receta } from '@/modules/recetas/entitties/receta.entity'
import { Usuario } from '@/modules/usuarios/entitties/usuario.entity'
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity('ordenes_produccion')
export class OrdenProduccion {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ name: 'receta_id', type: 'char', length: 36 })
  recetaId!: string

  @Column({ name: 'usuario_id', type: 'char', length: 36 })
  usuarioId!: string

  @Column({ name: 'cantidad_a_producir', type: 'int', unsigned: true })
  cantidadAProducir!: number

  @Column({ name: 'cantidad_producida', type: 'int', unsigned: true, default: 0 })
  cantidadProducida!: number

  @Column({ type: 'enum', enum: ['programada', 'en_proceso', 'completada', 'cancelada'], default: 'programada' })
  estado!: string

  @Column({ name: 'fecha_programada', type: 'date' })
  fechaProgramada!: Date

  @Column({ type: 'text', nullable: true })
  notas!: string

  @Column({ name: 'iniciada_at', type: 'timestamp', nullable: true })
  iniciadaAt!: Date

  @Column({ name: 'completada_at', type: 'timestamp', nullable: true })
  completadaAt!: Date

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date

  @ManyToOne(() => Receta)
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario
}
