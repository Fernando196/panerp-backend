# CLAUDE.md — panerp-backend

> Archivo de instrucciones para Claude Code. Lee esto antes de tocar cualquier archivo.

## Contexto del proyecto

**panerp-backend** es la REST API del ERP para panadería, construida con:
- **NestJS 10** — framework Node.js con arquitectura modular
- **TypeScript strict** — sin `any`, decoradores tipados
- **TypeORM** — ORM para MySQL
- **nestjs-zod + Zod** — validación de schemas (NO usar class-validator)
- **@nestjs/swagger 8** — documentación automática (compatible con NestJS 10)
- **JWT + Passport** — autenticación stateless
- **ThrottlerModule** — rate limiting global

## Estructura de carpetas

```
src/
├── main.ts                      # Bootstrap: Swagger, ZodValidationPipe, CORS, filtros
├── app.module.ts                # Módulo raíz: TypeORM, Config, Throttler, imports
├── app/
│   ├── controllers/             # Controladores HTTP (un archivo por dominio)
│   ├── services/                # Lógica de negocio (un archivo por dominio)
│   ├── modules/                 # Módulos NestJS (un archivo por dominio)
│   ├── strategies/              # Estrategias Passport (jwt.strategy.ts)
│   └── gateway/                 # WebSocket gateways (notificaciones.gateway.ts)
├── domain/
│   ├── dto/                     # Todos los DTOs con Zod schemas (planos, sin subcarpetas)
│   └── entitites/               # Todas las entidades TypeORM (planas, sin subcarpetas)
├── common/
│   ├── decorators/              # @CurrentUser, @Public, @Roles
│   ├── guards/                  # JwtAuthGuard, RolesGuard
│   ├── filters/                 # GlobalExceptionFilter
│   └── interceptors/            # LoggingInterceptor, TransformInterceptor
└── config/
    └── typeorm.config.ts        # Configuración TypeORM
```

> **Nota:** Los DTOs y entidades son planos en `src/domain/` — NO están organizados por feature.
> Las entidades tienen un typo histórico en la carpeta: `entitites` (con doble 'i') — no renombrar.

## Módulos del sistema

| Módulo | Archivo módulo | Controller | Service |
|--------|---------------|------------|---------|
| Auth | auth.module.ts | auth.controller.ts | auth.service.ts |
| Usuarios | usuarios.module.ts | usuarios.controller.ts | usuarios.service.ts |
| Clientes | clientes.module.ts | clientes.controller.ts | clientes.service.ts |
| Inventario | inventario.module.ts | inventario.controller.ts | inventario.service.ts |
| Produccion | produccion.module.ts | produccion.controller.ts | produccion.service.ts |
| Productos | productos.module.ts | productos.controller.ts | productos.service.ts |
| Recetas | recetas.module.ts | recetas.controller.ts | recetas.service.ts |
| Entregas | entregas.module.ts | entregas.controller.ts | entregas.service.ts |
| Charolas | charolas.module.ts | charolas.controller.ts | charolas.service.ts |
| Contabilidad | contabilidad.module.ts | contabilidad.controller.ts | contabilidad.service.ts |
| Notificaciones | notificaciones.module.ts | — | notificaciones.service.ts |
| Sync | sync.module.ts | sync.controller.ts | sync.service.ts |

## Reglas de TypeScript

- **NUNCA uses `any`**. Usa `unknown` + narrowing o el tipo correcto.
- Los servicios devuelven tipos explícitos: `Promise<Usuario>`, no `Promise<any>`.
- Usa `readonly` en propiedades que no cambian.
- Los repositorios retornan `Entity | null`, no `Entity | undefined`.

## Reglas de arquitectura

### Controladores
- Solo reciben la request y llaman al servicio — sin lógica de negocio
- Usan decoradores de Swagger en TODOS los endpoints
- Siempre especifican el código HTTP de respuesta con `@HttpCode`

```typescript
@Controller('clientes')
@ApiTags('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOneOrFail(id)
  }
}
```

### Servicios
- Contienen la lógica de negocio
- Lanzan excepciones de NestJS (`NotFoundException`, `ConflictException`, etc.)
- No saben nada de HTTP

```typescript
async findOneOrFail(id: string): Promise<Cliente> {
  const cliente = await this.clientesRepository.findOne({ where: { id } })
  if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`)
  return cliente
}
```

### DTOs con nestjs-zod

Todos los DTOs viven en `src/domain/dto/`. Patrón estándar:

```typescript
// src/domain/dto/create-ejemplo.dto.ts
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const CreateEjemploSchema = z.object({
  nombre: z.string(),
  email: z.string().email('Email inválido'),
  cantidad: z.number().min(0),
  tipo: z.enum(['a', 'b', 'c']),
  notas: z.string().optional(),
})

export class CreateEjemploDto extends createZodDto(CreateEjemploSchema) {}
```

Para DTOs de actualización (todos los campos opcionales):

```typescript
// src/domain/dto/update-ejemplo.dto.ts
import { createZodDto } from 'nestjs-zod'
import { CreateEjemploSchema } from './create-ejemplo.dto'

export const UpdateEjemploSchema = CreateEjemploSchema.partial()

export class UpdateEjemploDto extends createZodDto(UpdateEjemploSchema) {}
```

Para objetos anidados (arrays de sub-objetos):

```typescript
const ItemSchema = z.object({
  id: z.string(),
  cantidad: z.number().min(1),
})

export const CreatePedidoSchema = z.object({
  cliente_id: z.string(),
  items: z.array(ItemSchema),
})

export class CreatePedidoDto extends createZodDto(CreatePedidoSchema) {}
```

### Entidades TypeORM

```typescript
// src/domain/entitites/ejemplo.entity.ts
@Entity('ejemplos')
export class Ejemplo {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  nombre!: string

  @Column({ select: false })  // no exponer en queries por defecto
  campo_privado!: string

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date
}
```

## Seguridad

- Siempre hashea contraseñas con bcrypt (cost factor ≥ 10)
- Los endpoints privados usan `@UseGuards(JwtAuthGuard)` — a nivel de controlador, no de método
- Zod sanitiza todos los inputs automáticamente via `ZodValidationPipe` global
- Nunca retornes campos de contraseña en las respuestas
- Rate limiting configurado globalmente en `ThrottlerModule`

## Prohibido

- NO usar `class-validator` ni `class-transformer` — usar Zod
- NO usar `@nestjs/mapped-types` `PartialType` — usar `Schema.partial()` de Zod
- NO hacer queries directas en el controlador — usar servicios
- NO usar `find()` sin condiciones — puede retornar miles de registros
- NO exponer errores de DB al cliente — `GlobalExceptionFilter` los intercepta

## Comandos útiles

```bash
npm run start:dev   # Servidor con hot-reload
npm run build       # Build de producción
npm run start:prod  # Servidor de producción
npm run test        # Jest unit tests
npm run typeorm     # CLI de TypeORM (migraciones)
```

## URLs importantes

- API base: `http://localhost:3001/api/v1`
- Swagger UI: `http://localhost:3001/api/docs`
