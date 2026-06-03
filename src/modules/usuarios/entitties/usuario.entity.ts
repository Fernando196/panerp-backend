import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Rol } from './rol.entity'

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ name: 'rol_id', type: 'tinyint', unsigned: true })
  rolId!: number

  @Column({ length: 120 })
  nombre!: string

  @Column({ length: 50, name:'nombre_usuario' })
  nombreUsuario!: string

  @Column({ length: 180, unique: true })
  email!: string

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string

  @Column({ default: true })
  activo!: boolean

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol
}
