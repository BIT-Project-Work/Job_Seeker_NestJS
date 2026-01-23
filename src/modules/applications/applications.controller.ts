import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Post('apply/:jobId')
  @Roles(Role.JOBSEEKER)
  async applyToJob(@Req() req, @Param('jobId') jobId: string) {
    return this.applicationsService.applyToJob(req.user._id, jobId, req.user.resume);
  }

  @Get('me')
  @Roles(Role.JOBSEEKER)
  async getMyApplications(@Req() req) {
    return this.applicationsService.getMyApplications(req.user._id);
  }

  @Get('job/:jobId')
  @Roles(Role.EMPLOYER)
  async getApplicantsForJob(@Req() req, @Param('jobId') jobId: string) {
    return this.applicationsService.getApplicantsForJob(jobId, req.user._id);
  }

  @Get(':id')
  async getApplicationById(@Req() req, @Param('id') id: string) {
    return this.applicationsService.getApplicationById(id, req.user._id);
  }

  @Patch(':id/status')
  @Roles(Role.EMPLOYER)
  async updateStatus(@Req() req, @Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.applicationsService.updateStatus(id, req.user._id, dto.status);
  }

}
