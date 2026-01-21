import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';

@Injectable()
export class MongooseService
    implements OnModuleInit, OnModuleDestroy {
    private connection: Connection;

    async onModuleInit() {
        await mongoose.connect(process.env.DATABASE_URL as string, {
            autoIndex: process.env.NODE_ENV !== 'production',
        });

        this.connection = mongoose.connection;

        console.log('✅ MongoDB connected successfully');
    }

    async onModuleDestroy() {
        await this.connection.close();
        console.log('❌ MongoDB disconnected');
    }

    getConnection(): Connection {
        return this.connection;
    }

    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }

        const collections = this.connection.collections;

        await Promise.all(
            Object.keys(collections).map((key) =>
                collections[key].deleteMany({}),
            ),
        );
    }
}
