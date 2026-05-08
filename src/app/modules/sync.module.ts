import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from '../controllers/sync.controller';
import { SyncService } from '../services/sync.service';
import { SyncQueue } from '../../domain/entitites/sync-queue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue])],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
