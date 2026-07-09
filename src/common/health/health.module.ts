
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { RedisModule } from '../../modules/redis/redis.module';
import { RedisHealthIndicator } from './RedisHealthIndicator';

@Module({
    imports: [
        TerminusModule,
        RedisModule
    ],
    controllers: [HealthController],
    providers:[RedisHealthIndicator]
})
export class HealthModule { }