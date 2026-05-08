import { Usuario } from '@/modules/usuarios/entitties/usuario.entity'
import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity('sesiones')
export class Sesion {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ name: 'usuario_id', type: 'char', length: 36 })
  usuarioId!: string

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string

  @Column({ name: 'expira_at', type: 'timestamp' })
  expiraAt!: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario
}
