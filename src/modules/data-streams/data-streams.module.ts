import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DataStreamsController } from './data-streams.controller';
import { DataStreamsRepository } from './data-streams.repository';
import { DataStreamsService } from './data-streams.service';

@Module({
  imports: [PrismaModule],
  controllers: [DataStreamsController],
  providers: [DataStreamsService, DataStreamsRepository],
})
export class DataStreamsModule {}
