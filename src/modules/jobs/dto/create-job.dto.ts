import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { JobType } from 'src/common/enums/jobType';

export class CreateJobDto {
  @ApiProperty({ example: 'Frontend Developer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Build UI for our web app' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '3+ years experience in React' })
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiPropertyOptional({ example: 'New York, USA' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  type: JobType;

  // @ApiProperty({
  //     description: 'Employer User ID',
  //     example: '69761fe83480ecf96dff2598',
  // })
  // @IsMongoId()
  // company: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isClosed?: boolean;
}
