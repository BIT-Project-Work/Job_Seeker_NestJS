import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { JobType } from 'src/common/enums/jobType';

export class JobQueryDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(JobType)
    type?: JobType;

    @IsOptional()
    @IsNumber()
    minSalary?: number;

    @IsOptional()
    @IsNumber()
    maxSalary?: number;

    @IsOptional()
    @IsString()
    userId?: string;
}
