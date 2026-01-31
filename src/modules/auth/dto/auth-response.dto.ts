import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role';

export class AuthResponseDto {
  @ApiProperty({
    example: '65c3f7a1b1a3f3c8b4d12345',
    description: 'User ID',
  })
  _id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'johndoe@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: 'avatar.png',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    enum: Role,
    example: Role.JOBSEEKER,
  })
  role: Role;
}
