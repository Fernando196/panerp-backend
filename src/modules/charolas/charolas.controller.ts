import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCharolaDto } from './dto/create-charola.dto';
import { CharolasService } from './charolas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('charolas')
export class CharolasController {
  constructor(private readonly charolasService: CharolasService) {}

  // GET /charolas?estado=disponible
  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.charolasService.findAll(estado);
  }

  // GET /charolas/disponibles
  @Get('disponibles')
  disponibles() {
    return this.charolasService.findAll('disponible');
  }

  // GET /charolas/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.charolasService.findOne(id);
  }

  // POST /charolas
  @Roles('administrador')
  @Post()
  create(@Body() dto: CreateCharolaDto) {
    return this.charolasService.create(dto);
  }

  // PUT /charolas/:id/estado
  @Roles('administrador', 'repartidor')
  @Put(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.charolasService.cambiarEstado(id, estado);
  }

  // DELETE /charolas/:id
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.charolasService.remove(id);
  }
}
