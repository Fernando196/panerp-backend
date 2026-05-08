import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { InventarioService } from '../inventario/inventario.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { OrdenProduccion } from './entitties/orden-produccion.entity';
import { Receta } from '../recetas/entitties/receta.entity';
import { IngredienteReceta } from '../recetas/entitties/ingrediente-receta.entity';
import { LoteProducto } from '../productos/entitties/lote-producto.entity';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(OrdenProduccion)   private ordenRepo: Repository<OrdenProduccion>,
    @InjectRepository(Receta)            private recetaRepo: Repository<Receta>,
    @InjectRepository(IngredienteReceta) private ingredienteRepo: Repository<IngredienteReceta>,
    @InjectRepository(LoteProducto)      private loteRepo: Repository<LoteProducto>,
    private inventarioService: InventarioService,
  ) {}

  async findAll(fecha?: string) {
    const qb = this.ordenRepo.createQueryBuilder('op')
      .leftJoinAndSelect('op.receta', 'r')
      .leftJoinAndSelect('op.usuario', 'u')
      .orderBy('op.fechaProgramada', 'DESC');

    if (fecha) qb.where('op.fechaProgramada = :fecha', { fecha });
    return qb.getMany();
  }

  async hoy() {
    const hoy = new Date().toISOString().split('T')[0];
    return this.findAll(hoy);
  }

  async calendario(inicio: string, fin: string) {
    return this.ordenRepo.find({
      where: { fechaProgramada: Between(new Date(inicio), new Date(fin)) },
      relations: ['receta'],
      order: { fechaProgramada: 'ASC' },
    });
  }

  async findOne(id: string) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['receta', 'receta.ingredientes', 'receta.ingredientes.materia_prima', 'usuario'],
    });
    if (!orden) throw new NotFoundException('Orden de producción no encontrada');
    return orden;
  }

  async create(dto: CreateOrdenDto, usuarioId: string) {
    const receta = await this.recetaRepo.findOne({
      where: { id: dto.recetaId, activo: true },
      relations: ['ingredientes'],
    });
    if (!receta) throw new NotFoundException('Receta no encontrada');

    // Verificar stock suficiente
    const factor = dto.cantidadAProducir / receta.rendimientoEsperado;
    for (const ing of receta.ingredientes) {
      const mp = await this.inventarioService.findOne(ing.materiaPrimaId);
      const cantidadNecesaria = await this.inventarioService.convertir(
        ing.materiaPrimaId, ing.cantidad * factor, ing.unidad, mp.unidadPrincipal,
      );
      if (mp.stockActual < cantidadNecesaria) {
        throw new BadRequestException(
          `Stock insuficiente de "${mp.nombre}": necesitas ${cantidadNecesaria.toFixed(2)} ${mp.unidadPrincipal}, tienes ${mp.stockActual}`,
        );
      }
    }

    const orden = this.ordenRepo.create({
      id: uuid(),
      recetaId: dto.recetaId,
      usuarioId: usuarioId,
      cantidadAProducir: dto.cantidadAProducir,
      fechaProgramada: dto.fechaProgramada as any,
      notas: dto.notas,
      estado: 'programada',
    });

    return this.ordenRepo.save(orden);
  }

  async iniciar(id: string, usuarioId: string) {
    const orden = await this.findOne(id);
    if (orden.estado !== 'programada') {
      throw new BadRequestException(`La orden está en estado "${orden.estado}", no se puede iniciar`);
    }

    const receta = await this.recetaRepo.findOne({
      where: { id: orden.recetaId },
      relations: ['ingredientes'],
    });
    const factor = orden.cantidadAProducir / (receta?.rendimientoEsperado || 0);

    for (const ing of receta?.ingredientes || []) {
      await this.inventarioService.descontarParaProduccion(
        ing.materiaPrimaId,
        ing.cantidad * factor,
        ing.unidad,
        usuarioId,
        orden.id,
      );
    }

    orden.estado = 'en_proceso';
    orden.iniciadaAt = new Date();
    return this.ordenRepo.save(orden);
  }

  async completar(id: string, cantidadProducida: number, usuarioId: string) {
    const orden = await this.findOne(id);
    if (orden.estado !== 'en_proceso') {
      throw new BadRequestException('La orden debe estar en proceso para completarse');
    }

    orden.cantidadProducida = cantidadProducida;
    orden.estado = 'completada';
    orden.completadaAt = new Date();
    await this.ordenRepo.save(orden);

    // Generar lotes automáticamente
    const receta = await this.recetaRepo.findOne({
      where: { id: orden.recetaId },
      relations: ['productos'],
    });

    const lotes = [];
    for (const producto of receta?.productos || []) {
      const lote = await this.loteRepo.save(
        this.loteRepo.create({
          id: uuid(),
          productoId: producto.id,
          ordenProduccionId: orden.id,
          numeroLote: `L-${Date.now()}-${producto.id.slice(0, 4).toUpperCase()}`,
          cantidadInicial: cantidadProducida,
          cantidadDisponible: cantidadProducida,
          fechaElaboracion: new Date(),
          fechaCaducidad: producto.diasCaducidad
            ? new Date(Date.now() + producto.diasCaducidad * 86400000)
            : undefined,
        }),
      );
      lotes.push(lote);
    }

    return { orden, lotes };
  }

  async cancelar(id: string) {
    const orden = await this.findOne(id);
    if (orden.estado === 'completada') {
      throw new BadRequestException('No se puede cancelar una orden completada');
    }
    orden.estado = 'cancelada';
    return this.ordenRepo.save(orden);
  }
}
