import { PartialType } from '@nestjs/swagger';
import { CreateSavedjobDto } from './create-savedjob.dto';

export class UpdateSavedjobDto extends PartialType(CreateSavedjobDto) {}
