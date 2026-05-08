import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { IngredienteReceta } from '../recetas/entities/ingrediente-receta.entity';
import { LoteProducto } from '../productos/entities/lote-producto.entity';
import { InventarioService } from '../inventario/inventario.service';
import { CreateOrdenDto } from '../../domain/dto/create-orden.dto';

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
      .orderBy('op.fecha_programada', 'DESC');

    if (fecha) qb.where('op.fecha_programada = :fecha', { fecha });
    return qb.getMany();
  }

  async hoy() {
    const hoy = new Date().toISOString().split('T')[0];
    return this.findAll(hoy);
  }

  async calendario(inicio: string, fin: string) {
    return this.ordenRepo.find({
      where: { fecha_programada: Between(new Date(inicio), new Date(fin)) },
      relations: ['receta'],
      order: { fecha_programada: 'ASC' },
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
      where: { id: dto.receta_id, activo: true },
      relations: ['ingredientes'],
    });
    if (!receta) throw new NotFoundException('Receta no encontrada');

    // Verificar stock suficiente
    const factor = dto.cantidad_a_producir / receta.rendimiento_esperado;
    for (const ing of receta.ingredientes) {
      const mp = await this.inventarioService.findOne(ing.materia_prima_id);
      const cantidadNecesaria = await this.inventarioService.convertir(
        ing.materia_prima_id, ing.cantidad * factor, ing.unidad, mp.unidad_principal,
      );
      if (mp.stock_actual < cantidadNecesaria) {
        throw new BadRequestException(
          `Stock insuficiente de "${mp.nombre}": necesitas ${cantidadNecesaria.toFixed(2)} ${mp.unidad_principal}, tienes ${mp.stock_actual}`,
        );
      }
    }

    const orden = this.ordenRepo.create({
      id: uuid(),
      receta_id: dto.receta_id,
      usuario_id: usuarioId,
      cantidad_a_producir: dto.cantidad_a_producir,
      fecha_programada: dto.fecha_programada as any,
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
      where: { id: orden.receta_id },
      relations: ['ingredientes'],
    });
    const factor = orden.cantidad_a_producir / receta.rendimiento_esperado;

    for (const ing of receta.ingredientes) {
      await this.inventarioService.descontarParaProduccion(
        ing.materia_prima_id,
        ing.cantidad * factor,
        ing.unidad,
        usuarioId,
        orden.id,
      );
    }

    orden.estado = 'en_proceso';
    orden.iniciada_at = new Date();
    return this.ordenRepo.save(orden);
  }

  async completar(id: string, cantidadProducida: number, usuarioId: string) {
    const orden = await this.findOne(id);
    if (orden.estado !== 'en_proceso') {
      throw new BadRequestException('La orden debe estar en proceso para completarse');
    }

    orden.cantidad_producida = cantidadProducida;
    orden.estado = 'completada';
    orden.completada_at = new Date();
    await this.ordenRepo.save(orden);

    // Generar lotes automáticamente
    const receta = await this.recetaRepo.findOne({
      where: { id: orden.receta_id },
      relations: ['productos'],
    });

    const lotes = [];
    for (const producto of receta.productos ?? []) {
      const lote = await this.loteRepo.save(
        this.loteRepo.create({
          id: uuid(),
          producto_id: producto.id,
          orden_produccion_id: orden.id,
          numero_lote: `L-${Date.now()}-${producto.id.slice(0, 4).toUpperCase()}`,
          cantidad_inicial: cantidadProducida,
          cantidad_disponible: cantidadProducida,
          fecha_elaboracion: new Date(),
          fecha_caducidad: producto.dias_caducidad
            ? new Date(Date.now() + producto.dias_caducidad * 86400000)
            : null,
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
