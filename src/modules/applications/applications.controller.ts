import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  //! Get All Applications

  //! Get My Applications

  //! Get Applications for a Job

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  //! Get Application by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(+id);
  }

  //! Update Application Status
  @Patch(':id/status')
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationsService.update(+id, updateApplicationDto);
  }

}
