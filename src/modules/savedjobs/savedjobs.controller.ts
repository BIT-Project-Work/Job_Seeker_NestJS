import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SavedjobsService } from './savedjobs.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role';

@ApiTags('Saved Jobs')
@ApiBearerAuth()
@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedjobsService) { }

  @Post(':jobId')
  @Roles(Role.JOBSEEKER)
  async saveJob(@Req() req, @Param('jobId') jobId: string) {
    return this.savedJobsService.saveJob(jobId, req.user._id);
  }

  @Delete(':jobId')
  @Roles(Role.JOBSEEKER)
  async unsaveJob(@Req() req, @Param('jobId') jobId: string) {
    return this.savedJobsService.unsaveJob(jobId, req.user._id);
  }

  @Get('me')
  @Roles(Role.JOBSEEKER)
  async getMySavedJobs(@Req() req) {
    return this.savedJobsService.getMySavedJobs(req.user._id);
  }
}
