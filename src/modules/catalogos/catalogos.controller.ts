import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CatalogosService } from './catalogos.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogoService: CatalogosService) {}

  // GET /clientes?search=xxx&tipo=tienda&bloqueado=true
  @Get('user-roles')
  findAll(
    @Query('search') search?: string,
  ) {
    return this.catalogoService.findAll({ search });
  }
}
