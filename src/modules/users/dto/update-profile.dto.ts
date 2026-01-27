import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {

    @ApiProperty({
        description: 'User Name',
        example: 'John Doe',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'User email',
        example: 'johndoe@gmail.com',
        required: false
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({
        description: 'User Avatar',
        example: 'http://localhost:7000/uploads/lemon.png',
        required: false
    })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({
        description: 'User Resume',
        example: 'http://localhost:7000/uploads/lemonresume.png',
        required: false
    })
    @IsOptional()
    @IsString()
    resume?: string;

    // employer-only fields
    @ApiProperty({
        example: 'Company Pvt. Ltd.',
        required: false,
    })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({
        example: 'Company does some work',
        required: false,
    })
    @IsOptional()
    @IsString()
    companyDescription?: string;

    @ApiProperty({
        example: 'companylogo.png',
        required: false,
    })
    @IsOptional()
    @IsString()
    companyLogo?: string;
}
