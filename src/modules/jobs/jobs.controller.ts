import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Role } from 'src/common/enums/role';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ModerateThrottler, RelaxedThrottler } from 'src/common/decorators/custom-throttler.decorator';
import { ResponseCreateJobDto } from './dto/response-create-job.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JobQueryDto } from './dto/job-query.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {

  //! DI
  constructor(private readonly jobsService: JobsService) { }


  //! Create Job 
  @Post()
  @ModerateThrottler()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiOperation({
    summary: 'Create a new job',
  })
  @ApiBody({
    type: CreateJobDto,
  })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: ResponseCreateJobDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or insufficient stock',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async create(
    @Body() createJobDto: CreateJobDto,
    @GetUser() user: any
  ) {
    return this.jobsService.create(createJobDto, user);
  }

  //! Get All Jobs (Filtered/Paginated) 
  @Get()
  @RelaxedThrottler()
  findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  //! Get All Jobs no pagination

  //! Get Jobs for Employers
  @Get('get-jobs-employer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  findEmployerJobs(@GetUser() user: any) {
    return this.jobsService.findEmployerJobs(user);
  }

  //! Get Single Job
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string
  ) {
    return this.jobsService.findOne(id, userId);
  }

  //! Update Job 
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @GetUser() user: any
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  //! Delete Job
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @GetUser() user: any
  ) {
    return this.jobsService.remove(id, user);
  }

  //! Toggle Close Job
  @Patch(':id/toggle-close')
  @UseGuards(JwtAuthGuard)
  toggleClose(
    @Param('id') id: string,
    @GetUser() user: any
  ) {
    return this.jobsService.toggleClose(id, user);
  }
}
