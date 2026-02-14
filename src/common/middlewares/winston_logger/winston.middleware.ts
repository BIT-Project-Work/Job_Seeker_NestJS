import { Injectable, NestMiddleware } from '@nestjs/common';
import moment from 'moment';
import { winstonLogger } from './winston';

@Injectable()
export class WinstonLoggerMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const startHrTime = process.hrtime();

        let requestBodySize = 0;
        req.on('data', (chunk: Buffer) => {
            requestBodySize += chunk.length;
        });

        res.on('finish', () => {
            const diff = process.hrtime(startHrTime);
            const elapsedMs = diff[0] * 1000 + diff[1] / 1e6;

            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            const method = req.method;
            const status = res.statusCode;
            const responseSize = res.getHeader('Content-Length') || 0;
            const clientIp = req.ip || 'unknown';

            const level =
                status >= 500 ? 'error' :
                    status >= 400 ? 'warn' :
                        'info';

            winstonLogger.log(level, 'http_request', {
                timestamp,
                method,
                url: fullUrl,
                status,
                duration_ms: elapsedMs,
                response_size: Number(responseSize),
                request_size: requestBodySize,
                ip: clientIp,
                app: 'nestjs-api',
                level,
            });
        });

        next();
    }
}
