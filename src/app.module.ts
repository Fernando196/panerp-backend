import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './app/modules/auth.module'
import { EntregasModule } from './app/modules/entregas.module'
import { InventarioModule } from './app/modules/inventario.module'
import { ProduccionModule } from './app/modules/produccion.module'
import { Sesion } from './domain/entitites/sesion.entity'
import { DetalleDevolucion } from './domain/entitites/detalle-devolucion.entity'
import { Entrega } from './domain/entitites/entrega.entity'
import { ConversionUnidad } from './domain/entitites/conversion-unidad.entity'
import { MateriaPrima } from './domain/entitites/materia-prima.entity'
import { MovimientoInventario } from './domain/entitites/movimiento-inventario.entity'
import { OrdenProduccion } from './domain/entitites/orden-produccion.entity'

const entities = [Sesion,DetalleDevolucion,Entrega,ConversionUnidad,MateriaPrima,MovimientoInventario,OrdenProduccion]

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
    EntregasModule,
    InventarioModule,
    ProduccionModule,
  ],
})
export class AppModule {}
