import winston from 'winston';
import LokiTransport from 'winston-loki';

export const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        // Flatten the log so message is part of JSON
        winston.format((info) => {
            if (info.message) {
                info.msg = info.message;
                delete info.message;
            }
            return info;
        })()
    ),
    transports: [
        new winston.transports.Console(),

        new LokiTransport({
            host: 'http://loki:3100',
            labels: {
                app: 'nestjs-api',
            },
            json: true,
            batching: true,
            interval: 5,
        }),
    ],
});
