import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middlewares/logger/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SavedJobsModule } from './modules/savedJobs/savedJobs.module';
import { envSchema } from './common/config/env.schema';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: envSchema,
      validationOptions: {
        abortEarly: true,
      }
    }),
    //! DB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DATABASE_URL'),
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => console.log('✅ MongoDB connected'));
          connection.on('disconnected', () =>
            console.log('❌ MongoDB disconnected'),
          );
          return connection;
        },
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute
        limit: 100, // global fallback
      },
    ]),
    AuthModule,
    UsersModule,
    ApplicationsModule,
    JobsModule,
    AnalyticsModule,
    SavedJobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    }
  ],
})
export class AppModule implements NestModule {
  //! Logger Middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
