// Jwt Strategy for auth requests

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { MongooseService } from "src/mongoose/mongoose.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private mongoose: MongooseService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultsecretkey',
        });
    }

    // Validate JWT payload
    async validate(payload: { sub: string, email: string }) {
        const user = await this.mongoose.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                password: false
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}