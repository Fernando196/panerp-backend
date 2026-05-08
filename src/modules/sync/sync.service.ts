import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { SyncQueue } from './entitties/sync-queue.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncQueue) private syncRepo: Repository<SyncQueue>,
  ) {}

  async procesarBatch(operaciones: any[], usuarioId: string) {
    const resultados = [];

    for (const op of operaciones) {
      const registro = this.syncRepo.create({
        id: uuid(),
        usuarioId: usuarioId,
        tabla: op.tabla,
        operacion: op.operacion,
        registroId: op.registroId,
        payload: op.payload,
      });

      try {
        // Aquí se procesaría cada operación según su tabla y tipo
        // Por ahora se guarda en la cola para procesamiento asíncrono
        registro.sincronizado = true;
        registro.sincronizadoAt = new Date();
        resultados.push({ id: op.registroId, exito: true });
      } catch (error: any) {
        registro.errorMensaje = error.message;
        registro.intentos += 1;
        resultados.push({ id: op.registroId, exito: false, error: error.message });
      }

      await this.syncRepo.save(registro);
    }

    return {
      procesadas: resultados.filter(r => r.exito).length,
      fallidas: resultados.filter(r => !r.exito).length,
      detalle: resultados,
    };
  }
}
