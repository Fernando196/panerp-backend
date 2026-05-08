import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { MovimientoDto } from './dto/movimiento.dto';
import { FiltrosInventarioDto } from './dto/filtros-inventario.dto';
import { CreateConversionDto } from './dto/create-conversion.dto';
import { InventarioService } from './inventario.service';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  // GET /inventario?search=harina&categoria=harinas&stockBajo=true
  @Get()
  findAll(@Query() filtros: FiltrosInventarioDto) {
    return this.inventarioService.findAll(filtros);
  }

  // GET /inventario/stock-bajo
  @Get('stock-bajo')
  stockBajo() {
    return this.inventarioService.stockBajo();
  }

  // GET /inventario/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioService.findOne(id);
  }

  // POST /inventario
  @Roles('administrador', 'produccion')
  @Post()
  create(@Body() dto: CreateMateriaPrimaDto, @CurrentUser() user: any) {
    return this.inventarioService.create(dto, user.id);
  }

  // PUT /inventario/:id
  @Roles('administrador', 'produccion')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMateriaPrimaDto, @CurrentUser() user: any) {
    return this.inventarioService.update(id, dto, user.id);
  }

  // DELETE /inventario/:id
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioService.remove(id);
  }

  // GET /inventario/:id/movimientos
  @Get(':id/movimientos')
  movimientos(@Param('id') id: string, @Query('limit') limit = 50) {
    return this.inventarioService.getMovimientos(id, +limit);
  }

  // POST /inventario/:id/entrada
  @Roles('administrador', 'produccion')
  @Post(':id/entrada')
  entrada(@Param('id') id: string, @Body() dto: MovimientoDto, @CurrentUser() user: any) {
    return this.inventarioService.registrarMovimiento(id, 'entrada', dto, user.id);
  }

  // POST /inventario/:id/ajuste
  @Roles('administrador')
  @Post(':id/ajuste')
  ajuste(@Param('id') id: string, @Body() dto: MovimientoDto, @CurrentUser() user: any) {
    return this.inventarioService.registrarMovimiento(id, 'ajuste', dto, user.id);
  }

  // POST /inventario/:id/desperdicio
  @Roles('administrador', 'produccion')
  @Post(':id/desperdicio')
  desperdicio(@Param('id') id: string, @Body() dto: MovimientoDto, @CurrentUser() user: any) {
    return this.inventarioService.registrarMovimiento(id, 'desperdicio', dto, user.id);
  }

  // GET /inventario/:id/conversiones
  @Get(':id/conversiones')
  conversiones(@Param('id') id: string) {
    return this.inventarioService.getConversiones(id);
  }

  // POST /inventario/:id/conversiones
  @Roles('administrador')
  @Post(':id/conversiones')
  addConversion(@Param('id') id: string, @Body() dto: CreateConversionDto) {
    return this.inventarioService.addConversion(id, dto);
  }
}
