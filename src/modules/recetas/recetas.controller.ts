import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  // GET /recetas
  @Get()
  findAll() {
    return this.recetasService.findAll();
  }

  // GET /recetas/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recetasService.findOne(id);
  }

  // GET /recetas/:id/costo — calcula costo en tiempo real según stock actual
  @Get(':id/costo')
  calcularCosto(@Param('id') id: string) {
    return this.recetasService.calcularCosto(id);
  }

  // GET /recetas/:id/verificar-stock — verifica si hay stock para producir
  @Get(':id/verificar-stock')
  verificarStock(@Param('id') id: string) {
    return this.recetasService.verificarStock(id);
  }

  // POST /recetas
  @Roles('administrador', 'produccion')
  @Post()
  create(@Body() dto: CreateRecetaDto, @CurrentUser() user: any) {
    return this.recetasService.create(dto, user.id);
  }

  // PUT /recetas/:id
  @Roles('administrador', 'produccion')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecetaDto, @CurrentUser() user: any) {
    return this.recetasService.update(id, dto);
  }

  // DELETE /recetas/:id
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recetasService.remove(id);
  }
}
