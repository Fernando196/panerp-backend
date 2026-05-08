import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsuariosService } from './usuarios.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios
  @Roles('administrador')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  // GET /usuarios/roles
  @Roles('administrador')
  @Get('roles')
  getRoles() {
    return this.usuariosService.getRoles();
  }

  // GET /usuarios/:id
  @Roles('administrador')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  // POST /usuarios
  @Roles('administrador')
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  // PUT /usuarios/:id
  @Roles('administrador')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto);
  }

  // PUT /usuarios/:id/password
  @Roles('administrador')
  @Put(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.usuariosService.changePassword(id, dto.nuevaPassword);
  }

  // PUT /usuarios/:id/activar
  @Roles('administrador')
  @Put(':id/activar')
  activar(@Param('id') id: string) {
    return this.usuariosService.setActivo(id, true);
  }

  // PUT /usuarios/:id/desactivar
  @Roles('administrador')
  @Put(':id/desactivar')
  desactivar(@Param('id') id: string) {
    return this.usuariosService.setActivo(id, false);
  }

  // DELETE /usuarios/:id
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
