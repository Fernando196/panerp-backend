import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Usuario } from './usuario.entity'

@Entity('sesiones')
export class Sesion {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ type: 'char', length: 36 })
  usuario_id!: string

  @Column({ type: 'varchar', length: 255 })
  token_hash!: string

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string

  @Column({ type: 'text', nullable: true })
  user_agent!: string

  @Column({ type: 'timestamp' })
  expira_at!: Date

  @CreateDateColumn()
  created_at!: Date

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario
}
