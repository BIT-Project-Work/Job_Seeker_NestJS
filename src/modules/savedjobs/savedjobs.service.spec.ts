import { Test, TestingModule } from '@nestjs/testing';
import { SavedjobsService } from './jobs/savedjobs.service';

describe('SavedjobsService', () => {
  let service: SavedjobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedjobsService],
    }).compile();

    service = module.get<SavedjobsService>(SavedjobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
