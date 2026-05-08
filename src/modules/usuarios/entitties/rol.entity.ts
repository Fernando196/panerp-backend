import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm"

@Entity('roles')
export class Rol {
  @PrimaryColumn({ type: 'tinyint', unsigned: true })
  id!: number

  @Column({ length: 50, unique: true })
  nombre!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}