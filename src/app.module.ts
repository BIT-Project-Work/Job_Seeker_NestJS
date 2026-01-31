import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middlewares/logger/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SavedjobsModule } from './modules/savedJobs/savedjobs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
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
        ttl: 60, // Time to live: 60 seconds
        limit: 10, // Limit: 10 requests per 60 seconds
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
