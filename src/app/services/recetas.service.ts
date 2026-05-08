import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Receta, IngredienteReceta, PasoReceta } from './entities/receta.entity';
import { InventarioService } from '../inventario/inventario.service';
import { CreateRecetaDto } from '../../domain/dto/create-receta.dto';
import { UpdateRecetaDto } from '../../domain/dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)           private recetaRepo: Repository<Receta>,
    @InjectRepository(IngredienteReceta) private ingredienteRepo: Repository<IngredienteReceta>,
    @InjectRepository(PasoReceta)       private pasoRepo: Repository<PasoReceta>,
    private inventarioService: InventarioService,
  ) {}

  async findAll() {
    return this.recetaRepo.find({
      where: { activo: true, deleted_at: IsNull() },
      relations: ['ingredientes', 'pasos'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string) {
    const receta = await this.recetaRepo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['ingredientes', 'ingredientes.materia_prima', 'pasos'],
    });
    if (!receta) throw new NotFoundException('Receta no encontrada');
    return receta;
  }

  async calcularCosto(id: string) {
    const receta = await this.findOne(id);
    let costoTotal = 0;

    for (const ing of receta.ingredientes) {
      const mp = await this.inventarioService.findOne(ing.materia_prima_id);
      const cantidadEnPrincipal = await this.inventarioService.convertir(
        ing.materia_prima_id, ing.cantidad, ing.unidad, mp.unidad_principal,
      );
      costoTotal += cantidadEnPrincipal * Number(mp.costo_por_unidad);
    }

    const costoUnitario = costoTotal / receta.rendimiento_esperado;
    return { costoTotal, costoUnitario, rendimiento: receta.rendimiento_esperado };
  }

  async verificarStock(id: string) {
    const receta = await this.findOne(id);
    const resultado = [];

    for (const ing of receta.ingredientes) {
      const mp = await this.inventarioService.findOne(ing.materia_prima_id);
      const cantidadNecesaria = await this.inventarioService.convertir(
        ing.materia_prima_id, ing.cantidad, ing.unidad, mp.unidad_principal,
      );
      resultado.push({
        materia_prima: mp.nombre,
        necesario: cantidadNecesaria,
        disponible: mp.stock_actual,
        unidad: mp.unidad_principal,
        suficiente: mp.stock_actual >= cantidadNecesaria,
      });
    }

    return {
      puede_producir: resultado.every(r => r.suficiente),
      detalle: resultado,
    };
  }

  async create(dto: CreateRecetaDto, usuarioId: string) {
    const recetaId = uuid();

    // Calcular tiempo total
    const tiempoTotal = (dto.pasos ?? []).reduce((acc, p) => acc + (p.tiempo_minutos ?? 0), 0);

    const receta = await this.recetaRepo.save(
      this.recetaRepo.create({
        id: recetaId,
        usuario_id: usuarioId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        rendimiento_esperado: dto.rendimiento_esperado,
        unidad_rendimiento: dto.unidad_rendimiento,
        tiempo_total_minutos: tiempoTotal,
        activo: true,
      }),
    );

    // Guardar ingredientes
    for (const ing of dto.ingredientes ?? []) {
      await this.ingredienteRepo.save(
        this.ingredienteRepo.create({ id: uuid(), receta_id: recetaId, ...ing }),
      );
    }

    // Guardar pasos
    for (const paso of dto.pasos ?? []) {
      await this.pasoRepo.save(
        this.pasoRepo.create({ id: uuid(), receta_id: recetaId, ...paso }),
      );
    }

    // Actualizar costo estimado
    const { costoTotal } = await this.calcularCosto(recetaId);
    receta.costo_estimado = costoTotal;
    await this.recetaRepo.save(receta);

    return this.findOne(recetaId);
  }

  async update(id: string, dto: UpdateRecetaDto) {
    const receta = await this.findOne(id);

    Object.assign(receta, {
      nombre: dto.nombre ?? receta.nombre,
      descripcion: dto.descripcion ?? receta.descripcion,
      rendimiento_esperado: dto.rendimiento_esperado ?? receta.rendimiento_esperado,
      unidad_rendimiento: dto.unidad_rendimiento ?? receta.unidad_rendimiento,
    });

    if (dto.ingredientes) {
      await this.ingredienteRepo.delete({ receta_id: id });
      for (const ing of dto.ingredientes) {
        await this.ingredienteRepo.save(
          this.ingredienteRepo.create({ id: uuid(), receta_id: id, ...ing }),
        );
      }
    }

    if (dto.pasos) {
      await this.pasoRepo.delete({ receta_id: id });
      const tiempoTotal = dto.pasos.reduce((acc, p) => acc + (p.tiempo_minutos ?? 0), 0);
      receta.tiempo_total_minutos = tiempoTotal;
      for (const paso of dto.pasos) {
        await this.pasoRepo.save(
          this.pasoRepo.create({ id: uuid(), receta_id: id, ...paso }),
        );
      }
    }

    await this.recetaRepo.save(receta);
    return this.findOne(id);
  }

  async remove(id: string) {
    const receta = await this.findOne(id);
    receta.deleted_at = new Date();
    await this.recetaRepo.save(receta);
  }
}
