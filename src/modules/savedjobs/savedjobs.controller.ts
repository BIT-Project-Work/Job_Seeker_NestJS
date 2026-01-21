import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SavedjobsService } from './savedjobs.service';
import { CreateSavedjobDto } from './dto/create-savedjob.dto';
import { UpdateSavedjobDto } from './dto/update-savedjob.dto';

@Controller('savedjobs')
export class SavedjobsController {
  constructor(private readonly savedjobsService: SavedjobsService) {}

  @Post()
  create(@Body() createSavedjobDto: CreateSavedjobDto) {
    return this.savedjobsService.create(createSavedjobDto);
  }

  @Get()
  findAll() {
    return this.savedjobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savedjobsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSavedjobDto: UpdateSavedjobDto) {
    return this.savedjobsService.update(+id, updateSavedjobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savedjobsService.remove(+id);
  }
}
