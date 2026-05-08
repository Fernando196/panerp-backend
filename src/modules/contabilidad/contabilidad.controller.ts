import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { ContabilidadService } from './contabilidad.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador', 'contabilidad')
@Controller('contabilidad')
export class ContabilidadController {
  constructor(private readonly contabilidadService: ContabilidadService) {}

  // GET /contabilidad/resumen?periodo=diario|semanal|mensual
  @Get('resumen')
  resumen(@Query('periodo') periodo: 'diario' | 'semanal' | 'mensual' = 'diario') {
    return this.contabilidadService.resumen(periodo);
  }

  // GET /contabilidad/cuentas-por-cobrar?clienteId=xxx&estado=pendiente
  @Get('cuentas-por-cobrar')
  cuentasPorCobrar(
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.contabilidadService.cuentasPorCobrar({ clienteId, estado });
  }

  // GET /contabilidad/cuentas-por-cobrar/:id
  @Get('cuentas-por-cobrar/:id')
  findCxC(@Param('id') id: string) {
    return this.contabilidadService.findCxC(id);
  }

  // POST /contabilidad/cuentas-por-cobrar/:id/pago
  @Post('cuentas-por-cobrar/:id/pago')
  registrarPago(
    @Param('id') id: string,
    @Body() dto: RegistrarPagoDto,
    @CurrentUser() user: any,
  ) {
    return this.contabilidadService.registrarPago(id, dto, user.id);
  }

  // GET /contabilidad/transacciones?fechaInicio=xxx&fechaFin=xxx&tipo=ingreso
  @Get('transacciones')
  transacciones(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
  ) {
    return this.contabilidadService.transacciones({ fechaInicio, fechaFin, tipo, categoria });
  }

  // GET /contabilidad/morosos
  @Get('morosos')
  morosos() {
    return this.contabilidadService.morosos();
  }
}
