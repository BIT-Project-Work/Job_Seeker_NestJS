import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 *! App API controller
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   *! Get Hello
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
