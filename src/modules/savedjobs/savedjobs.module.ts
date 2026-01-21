import { Module } from '@nestjs/common';
import { SavedjobsService } from './savedjobs.service';
import { SavedjobsController } from './savedjobs.controller';

@Module({
  controllers: [SavedjobsController],
  providers: [SavedjobsService],
})
export class SavedjobsModule {}
