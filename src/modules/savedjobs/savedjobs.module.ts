import { Module } from '@nestjs/common';
import { SavedjobsService } from './savedjobs.service';
import { SavedJobsController } from './savedjobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedJob, SavedJobSchema } from './schemas/saved-job.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedJob.name, schema: SavedJobSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  controllers: [SavedJobsController],
  providers: [SavedjobsService],
})
export class SavedjobsModule {}
