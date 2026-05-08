import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // GET /productos
  @Get()
  findAll(@Query('search') search?: string, @Query('categoria') categoria?: string) {
    return this.productosService.findAll({ search, categoria });
  }

  // GET /productos/por-caducar
  @Get('por-caducar')
  porCaducar(@Query('dias') dias = 7) {
    return this.productosService.porCaducar(+dias);
  }

  // GET /productos/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  // GET /productos/:id/lotes
  @Get(':id/lotes')
  lotes(@Param('id') id: string) {
    return this.productosService.getLotes(id);
  }

  // POST /productos
  @Roles('administrador', 'produccion')
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  // PUT /productos/:id
  @Roles('administrador', 'produccion')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(id, dto);
  }

  // DELETE /productos/:id
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
