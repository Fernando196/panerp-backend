import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { InventarioService } from '../inventario/inventario.service';
import { Receta } from './entitties/receta.entity';
import { IngredienteReceta } from './entitties/ingrediente-receta.entity';
import { PasoReceta } from './entitties/paso-receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

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
      where: { activo: true, deletedAt: IsNull() },
      relations: ['ingredientes', 'pasos'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string) {
    const receta = await this.recetaRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['ingredientes', 'ingredientes.materia_prima', 'pasos'],
    });
    if (!receta) throw new NotFoundException('Receta no encontrada');
    return receta;
  }

  async calcularCosto(id: string) {
    const receta = await this.findOne(id);
    let costoTotal = 0;

    for (const ing of receta.ingredientes) {
      const mp = await this.inventarioService.findOne(ing.materiaPrimaId);
      const cantidadEnPrincipal = await this.inventarioService.convertir(
        ing.materiaPrimaId, ing.cantidad, ing.unidad, mp.unidadPrincipal,
      );
      costoTotal += cantidadEnPrincipal * Number(mp.costoPorUnidad);
    }

    const costoUnitario = costoTotal / receta.rendimientoEsperado;
    return { costoTotal, costoUnitario, rendimiento: receta.rendimientoEsperado };
  }

  async verificarStock(id: string) {
    const receta = await this.findOne(id);
    const resultado = [];

    for (const ing of receta.ingredientes) {
      const mp = await this.inventarioService.findOne(ing.materiaPrimaId);
      const cantidadNecesaria = await this.inventarioService.convertir(
        ing.materiaPrimaId, ing.cantidad, ing.unidad, mp.unidadPrincipal,
      );
      resultado.push({
        materia_prima: mp.nombre,
        necesario: cantidadNecesaria,
        disponible: mp.stockActual,
        unidad: mp.unidadPrincipal,
        suficiente: mp.stockActual >= cantidadNecesaria,
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
    const tiempoTotal = (dto.pasos ?? []).reduce((acc, p) => acc + (p.tiempoMinutos ?? 0), 0);

    const receta = await this.recetaRepo.save(
      this.recetaRepo.create({
        id: recetaId,
        usuarioId: usuarioId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        rendimientoEsperado: dto.rendimientoEsperado,
        unidadRendimiento: dto.unidadRendimiento,
        tiempoTotalMinutos: tiempoTotal,
        activo: true,
      }),
    );

    // Guardar ingredientes
    for (const ing of dto.ingredientes ?? []) {
      await this.ingredienteRepo.save(
        this.ingredienteRepo.create({ id: uuid(), recetaId: recetaId, ...ing }),
      );
    }

    // Guardar pasos
    for (const paso of dto.pasos ?? []) {
      await this.pasoRepo.save(
        this.pasoRepo.create({ id: uuid(), recetaId: recetaId, ...paso }),
      );
    }

    // Actualizar costo estimado
    const { costoTotal } = await this.calcularCosto(recetaId);
    receta.costoEstimado = costoTotal;
    await this.recetaRepo.save(receta);

    return this.findOne(recetaId);
  }

  async update(id: string, dto: UpdateRecetaDto) {
    const receta = await this.findOne(id);

    Object.assign(receta, {
      nombre: dto.nombre ?? receta.nombre,
      descripcion: dto.descripcion ?? receta.descripcion,
      rendimientoEsperado: dto.rendimientoEsperado ?? receta.rendimientoEsperado,
      unidadRendimiento: dto.unidadRendimiento ?? receta.unidadRendimiento,
    });

    if (dto.ingredientes) {
      await this.ingredienteRepo.delete({ recetaId: id });
      for (const ing of dto.ingredientes) {
        await this.ingredienteRepo.save(
          this.ingredienteRepo.create({ id: uuid(), recetaId: id, ...ing }),
        );
      }
    }

    if (dto.pasos) {
      await this.pasoRepo.delete({ recetaId: id });
      const tiempoTotal = dto.pasos.reduce((acc, p) => acc + (p.tiempoMinutos ?? 0), 0);
      receta.tiempoTotalMinutos = tiempoTotal;
      for (const paso of dto.pasos) {
        await this.pasoRepo.save(
          this.pasoRepo.create({ id: uuid(), recetaId: id, ...paso }),
        );
      }
    }

    await this.recetaRepo.save(receta);
    return this.findOne(id);
  }

  async remove(id: string) {
    const receta = await this.findOne(id);
    receta.deletedAt = new Date();
    await this.recetaRepo.save(receta);
  }
}
