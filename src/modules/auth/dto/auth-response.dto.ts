import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';

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

  user: UserResponseDto;
}
