import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncQueue } from './entitties/sync-queue.entity';
import { SyncController } from './sync.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue])],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
