import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) { }

  @Get('slow')
  async slow() {
    return this.testService.slow();
  }

  @Get('fast')
  async fast() {
    return this.testService.fast();
  }
}
