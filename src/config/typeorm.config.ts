import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { Charola } from '@/domain/entitites/charola.entity'
import { Cliente } from '@/domain/entitites/cliente.entity'
import { ConversionUnidad } from '@/domain/entitites/conversion-unidad.entity'
import { CuentaPorCobrar } from '@/domain/entitites/cuenta-por-cobrar.entity'
import { DetalleDevolucion } from '@/domain/entitites/detalle-devolucion.entity'
import { Entrega } from '@/domain/entitites/entrega.entity'
import { MateriaPrima } from '@/domain/entitites/materia-prima.entity'
import { MovimientoInventario } from '@/domain/entitites/movimiento-inventario.entity'
import { Notificacion } from '@/domain/entitites/notificacion.entity'
import { OrdenProduccion } from '@/domain/entitites/orden-produccion.entity'
import { ProductoTerminado } from '@/domain/entitites/producto-terminado.entity'
import { Receta } from '@/domain/entitites/receta.entity'
import { Sesion } from '@/domain/entitites/sesion.entity'
import { SyncQueue } from '@/domain/entitites/sync-queue.entity'
import { Usuario } from '@/domain/entitites/usuario.entity'

dotenv.config()

export default new DataSource({
  type: 'mysql',
  host: process.env['DATABASE_HOST'] ?? 'localhost',
  port: Number(process.env['DATABASE_PORT'] ?? 3306),
  username: process.env['DATABASE_USER'] ?? 'root',
  password: process.env['DATABASE_PASSWORD'] ?? 'root',
  database: process.env['DATABASE_NAME'] ?? 'app_db',
  entities: [Charola,Cliente,ConversionUnidad,CuentaPorCobrar,DetalleDevolucion,Entrega,MateriaPrima,MovimientoInventario,Notificacion,OrdenProduccion,ProductoTerminado,Receta,Sesion,SyncQueue,Usuario],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
})
