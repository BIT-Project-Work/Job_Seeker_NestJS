import { Injectable } from '@nestjs/common';

/**
 *! App Service
 */
@Injectable()
export class AppService {
  /**
   *! Get Hello
   */
  getHello(): string {
    return 'Hello World!';
  }
}
