import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity('roles')
export class Rol {
  @PrimaryColumn({ type: 'tinyint', unsigned: true })
  id!: number

  @Column({ length: 50, unique: true })
  nombre!: string

  @CreateDateColumn()
  created_at!: Date
}

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ type: 'tinyint', unsigned: true })
  rol_id!: number

  @Column({ length: 120 })
  nombre!: string

  @Column({ length: 180, unique: true })
  email!: string

  @Column({ length: 255 })
  password_hash!: string

  @Column({ default: true })
  activo!: boolean

  @CreateDateColumn() created_at!: Date
  @UpdateDateColumn() updated_at!: Date

  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol
}
