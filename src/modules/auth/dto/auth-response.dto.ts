import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/common/enums/role";

export class AuthResponseDto {

    @ApiProperty({
        description: 'Access token for authentication',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'Refresh token for authentication',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Authenticated user information',
        example: {
            id: 'user-uuid',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER'
        }
    })
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: Role;
    }
}