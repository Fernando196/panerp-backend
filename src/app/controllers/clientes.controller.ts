import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientesService } from '../services/clientes.service';
import { CreateClienteDto } from '../../domain/dto/create-cliente.dto';
import { UpdateClienteDto } from '../../domain/dto/update-cliente.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // GET /clientes?search=xxx&tipo=tienda&bloqueado=true
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('bloqueado') bloqueado?: string,
  ) {
    return this.clientesService.findAll({ search, tipo, bloqueado });
  }

  // GET /clientes/morosos
  @Get('morosos')
  morosos() {
    return this.clientesService.morosos();
  }

  // GET /clientes/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  // GET /clientes/:id/historial
  @Get(':id/historial')
  historial(@Param('id') id: string) {
    return this.clientesService.historial(id);
  }

  // POST /clientes
  @Roles('administrador', 'contabilidad')
  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  // PUT /clientes/:id
  @Roles('administrador', 'contabilidad')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  // PUT /clientes/:id/bloquear
  @Roles('administrador', 'contabilidad')
  @Put(':id/bloquear')
  bloquear(@Param('id') id: string) {
    return this.clientesService.setBloqueado(id, true);
  }

  // PUT /clientes/:id/desbloquear
  @Roles('administrador', 'contabilidad')
  @Put(':id/desbloquear')
  desbloquear(@Param('id') id: string) {
    return this.clientesService.setBloqueado(id, false);
  }

  // DELETE /clientes/:id
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
