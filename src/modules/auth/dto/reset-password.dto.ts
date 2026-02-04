import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit numeric OTP',
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be exactly 6 digits and contain only numbers',
  })
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
