import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { ProduccionService } from './produccion.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('produccion')
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  // GET /produccion?fecha=2024-01-15
  @Get()
  findAll(@Query('fecha') fecha?: string) {
    return this.produccionService.findAll(fecha);
  }

  // GET /produccion/hoy
  @Get('hoy')
  hoy() {
    return this.produccionService.hoy();
  }

  // GET /produccion/calendario?inicio=2024-01-01&fin=2024-01-31
  @Get('calendario')
  calendario(@Query('inicio') inicio: string, @Query('fin') fin: string) {
    return this.produccionService.calendario(inicio, fin);
  }

  // GET /produccion/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionService.findOne(id);
  }

  // POST /produccion
  @Roles('administrador', 'produccion')
  @Post()
  create(@Body() dto: CreateOrdenDto, @CurrentUser() user: any) {
    return this.produccionService.create(dto, user.id);
  }

  // PUT /produccion/:id/iniciar
  @Roles('administrador', 'produccion')
  @Put(':id/iniciar')
  iniciar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produccionService.iniciar(id, user.id);
  }

  // PUT /produccion/:id/completar
  @Roles('administrador', 'produccion')
  @Put(':id/completar')
  completar(
    @Param('id') id: string,
    @Body('cantidad_producida') cantidadProducida: number,
    @CurrentUser() user: any,
  ) {
    return this.produccionService.completar(id, cantidadProducida, user.id);
  }

  // PUT /produccion/:id/cancelar
  @Roles('administrador')
  @Put(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.produccionService.cancelar(id);
  }
}
