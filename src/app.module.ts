import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middlewares/logger/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from './mongoose/mongoose.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SavedjobsModule } from './modules/savedjobs/savedjobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    MongooseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,      // Time to live: 60 seconds
        limit: 10,    // Limit: 10 requests per 60 seconds
      },
    ]),
    AuthModule,
    UsersModule,
    ApplicationsModule,
    JobsModule,
    AnalyticsModule,
    SavedjobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {

  //! Logger Middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
