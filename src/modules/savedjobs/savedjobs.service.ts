import { Injectable } from '@nestjs/common';
import { CreateSavedjobDto } from './dto/create-savedjob.dto';
import { UpdateSavedjobDto } from './dto/update-savedjob.dto';

@Injectable()
export class SavedjobsService {
  create(createSavedjobDto: CreateSavedjobDto) {
    return 'This action adds a new savedjob';
  }

  findAll() {
    return `This action returns all savedjobs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savedjob`;
  }

  update(id: number, updateSavedjobDto: UpdateSavedjobDto) {
    return `This action updates a #${id} savedjob`;
  }

  remove(id: number) {
    return `This action removes a #${id} savedjob`;
  }
}
