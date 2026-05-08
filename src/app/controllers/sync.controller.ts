import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SyncService } from '../services/sync.service';

@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // POST /sync — recibe batch de operaciones offline
  @Post()
  sync(@Body() body: { operaciones: any[] }, @CurrentUser() user: any) {
    return this.syncService.procesarBatch(body.operaciones, user.id);
  }
}
