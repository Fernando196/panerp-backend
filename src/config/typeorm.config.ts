import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { Charola } from '@/modules/charolas/entitties/charola.entity'
import { Cliente } from '@/modules/clientes/entitties/cliente.entity'
import { ConversionUnidad } from '@/modules/inventario/entitties/conversion-unidad.entity'
import { CuentaPorCobrar } from '@/modules/contabilidad/entitties/cuenta-por-cobrar.entity'
import { DetalleDevolucion } from '@/modules/entregas/entitties/detalle-devolucion.entity'
import { Entrega } from '@/modules/entregas/entitties/entrega.entity'
import { MateriaPrima } from '@/modules/inventario/entitties/materia-prima.entity'
import { MovimientoInventario } from '@/modules/inventario/entitties/movimiento-inventario.entity'
import { Notificacion } from '@/modules/notificaciones/entitties/notificacion.entity'
import { ProductoTerminado } from '@/modules/productos/entitties/producto-terminado.entity'
import { Receta } from '@/modules/recetas/entitties/receta.entity'
import { SyncQueue } from '@/modules/sync/entitties/sync-queue.entity'
import { Usuario } from '@/modules/usuarios/entitties/usuario.entity'
import { OrdenProduccion } from '@/modules/produccion/entitties/orden-produccion.entity'
import { Sesion } from '@/modules/auth/entitties/sesion.entity'

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
