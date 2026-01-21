import { Test, TestingModule } from '@nestjs/testing';
import { SavedjobsController } from './savedjobs.controller';
import { SavedjobsService } from './savedjobs.service';

describe('SavedjobsController', () => {
  let controller: SavedjobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedjobsController],
      providers: [SavedjobsService],
    }).compile();

    controller = module.get<SavedjobsController>(SavedjobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
