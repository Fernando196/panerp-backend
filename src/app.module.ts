import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { EntregasModule } from './modules/entregas/entregas.module'
import { InventarioModule } from './modules/inventario/inventario.module'
import { ProduccionModule } from './modules/produccion/produccion.module'
import { AuthModule } from './modules/auth/auth.module'
import { CharolasModule } from './modules/charolas/charolas.module'
import { ClientesModule } from './modules/clientes/clientes.module'
import { ContabilidadModule } from './modules/contabilidad/contabilidad.module'
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module'
import { ProductosModule } from './modules/productos/productos.module'
import { RecetasModule } from './modules/recetas/recetas.module'
import { SyncModule } from './modules/sync/sync.module'
import { UsuariosModule } from './modules/usuarios/usuarios.module'
import { Sesion } from './modules/auth/entitties/sesion.entity'
import { Charola } from './modules/charolas/entitties/charola.entity'
import { Cliente } from './modules/clientes/entitties/cliente.entity'
import { CuentaPorCobrar } from './modules/contabilidad/entitties/cuenta-por-cobrar.entity'
import { Pago } from './modules/contabilidad/entitties/pago.entity'
import { Transaccion } from './modules/contabilidad/entitties/transaccion.entity'
import { DetalleDevolucion } from './modules/entregas/entitties/detalle-devolucion.entity'
import { DetalleEntrega } from './modules/entregas/entitties/detalle-entrega.entity'
import { Devolucion } from './modules/entregas/entitties/devolucion.entity'
import { Entrega } from './modules/entregas/entitties/entrega.entity'
import { Reutilizacion } from './modules/entregas/entitties/reutilizacion.entity'
import { ConversionUnidad } from './modules/inventario/entitties/conversion-unidad.entity'
import { MateriaPrima } from './modules/inventario/entitties/materia-prima.entity'
import { MovimientoInventario } from './modules/inventario/entitties/movimiento-inventario.entity'
import { Notificacion } from './modules/notificaciones/entitties/notificacion.entity'
import { OrdenProduccion } from './modules/produccion/entitties/orden-produccion.entity'
import { LoteProducto } from './modules/productos/entitties/lote-producto.entity'
import { ProductoTerminado } from './modules/productos/entitties/producto-terminado.entity'
import { IngredienteReceta } from './modules/recetas/entitties/ingrediente-receta.entity'
import { Receta } from './modules/recetas/entitties/receta.entity'
import { PasoReceta } from './modules/recetas/entitties/paso-receta.entity';
import { SyncQueue } from './modules/sync/entitties/sync-queue.entity'
import { Rol } from './modules/usuarios/entitties/rol.entity'
import { Usuario } from './modules/usuarios/entitties/usuario.entity'

const entities = [
  Sesion,
  Charola,
  Cliente,
  CuentaPorCobrar, Pago, Transaccion,
  DetalleDevolucion, DetalleEntrega, Devolucion, Entrega, Reutilizacion,
  ConversionUnidad, MateriaPrima, MovimientoInventario,
  Notificacion,
  OrdenProduccion,
  LoteProducto, ProductoTerminado,
  IngredienteReceta,PasoReceta, Receta,
  SyncQueue,
  Rol, Usuario,
]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host:     config.get<string>('DATABASE_HOST', 'localhost'),
        port:     config.get<number>('DATABASE_PORT', 3306),
        username: config.get<string>('DATABASE_USER', 'root'),
        password: config.get<string>('DATABASE_PASSWORD', 'root'),
        database: config.get<string>('DATABASE_NAME', 'app_db'),
        entities,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    AuthModule,
    CharolasModule,
    ClientesModule,
    ContabilidadModule,
    EntregasModule,
    InventarioModule,
    NotificacionesModule,
    ProduccionModule,
    ProductosModule,
    RecetasModule,
    SyncModule,
    UsuariosModule
  ],
})
export class AppModule {}
