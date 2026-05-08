import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import {  ZodValidationPipe } from 'nestjs-zod'
import { Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  // Prefijo global de API
  app.setGlobalPrefix('api/v1')

  // CORS
  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
  })

  // Pipe global de validación — transforma y valida @Body(), @Query(), @Param()
  app.useGlobalPipes(new ZodValidationPipe())

  // Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter())

  // Interceptores globales
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  )

  const config = new DocumentBuilder()
    .setTitle('PAN ERP API')
    .setDescription('API REST para Panaderia ERP')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)
  document.security = [{ 'access-token': [] }]
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  const port = parseInt(process.env['PORT'] ?? '3001', 10)
  await app.listen(port)

  logger.log(`🚀 API corriendo en: http://localhost:${port}/api/v1`)
  logger.log(`📚 Swagger UI en:    http://localhost:${port}/api/docs`)
}

bootstrap().catch((err: unknown) => {
  console.error('Error al iniciar la aplicación:', err)
  process.exit(1)
})
