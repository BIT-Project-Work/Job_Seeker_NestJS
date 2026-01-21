import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  //! Create Job 
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  //! Get All Jobs (Filtered/Paginated) 
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  //! Get All Jobs no pagination


  //! Get Single Job
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  //! Update Job 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(+id, updateJobDto);
  }

  //! Toggle Close Job
  // @Patch('toggle-close/:id')
  // toggleClose(@Param('id') id: string) {
  //   return this.jobsService.toggleClose(+id);
  // }

  //! Delete Job
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
}
