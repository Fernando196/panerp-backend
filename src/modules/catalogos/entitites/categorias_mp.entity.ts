import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('categorias_mp')
export class CategoriasMP {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string

  @Column({ length: 150 })
  nombre!: string
}
