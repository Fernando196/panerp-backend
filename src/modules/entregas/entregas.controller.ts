import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { CreateDevolucionDto } from './dto/create-devolucion.dto';
import { EntregasService } from './entregas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  // GET /entregas?clienteId=xxx&estado=entregada&fecha=2024-01-15
  @Get()
  findAll(
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.entregasService.findAll({ clienteId, estado, fecha });
  }

  // GET /entregas/pendientes-recoleccion
  @Get('pendientes-recoleccion')
  pendientesRecoleccion() {
    return this.entregasService.pendientesRecoleccion();
  }

  // GET /entregas/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entregasService.findOne(id);
  }

  // GET /entregas/:id/nota-pdf
  @Get(':id/nota-pdf')
  notaPdf(@Param('id') id: string) {
    return this.entregasService.generarNotaPdf(id);
  }

  // POST /entregas
  @Roles('administrador', 'repartidor')
  @Post()
  create(@Body() dto: CreateEntregaDto, @CurrentUser() user: any) {
    return this.entregasService.create(dto, user.id);
  }

  // PUT /entregas/:id/entregar
  @Roles('administrador', 'repartidor')
  @Put(':id/entregar')
  entregar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.entregasService.cambiarEstado(id, 'entregada', user.id);
  }

  // POST /entregas/:id/devolucion
  @Roles('administrador', 'repartidor')
  @Post(':id/devolucion')
  devolucion(
    @Param('id') id: string,
    @Body() dto: CreateDevolucionDto,
    @CurrentUser() user: any,
  ) {
    return this.entregasService.registrarDevolucion(id, dto, user.id);
  }

  // POST /entregas/reutilizar
  @Roles('administrador', 'produccion')
  @Post('reutilizar')
  reutilizar(
    @Body() body: { detalleDevolucionId: string; ordenProduccionId: string; cantidad: number },
  ) {
    return this.entregasService.reutilizar(body);
  }
}
