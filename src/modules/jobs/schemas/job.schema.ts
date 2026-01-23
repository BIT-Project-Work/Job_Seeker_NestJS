import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from 'src/common/enums/jobType';
import { User } from 'src/modules/users/schemas/user.schema';

export type JobDocument = Document & Job;


@Schema({ timestamps: true })
export class Job {
    @ApiProperty({ example: 'Frontend Developer' })
    @Prop({ required: true })
    title: string;

    @ApiProperty({ example: 'Build UI for our web app' })
    @Prop({ required: true })
    description: string;

    @ApiProperty({ example: '3+ years experience in React' })
    @Prop({ required: true })
    requirements: string;

    @ApiProperty({ example: 'New York, USA', required: false })
    @Prop()
    location?: string;

    @ApiProperty({ example: 'Engineering', required: false })
    @Prop()
    category?: string;

    @ApiProperty({ enum: JobType })
    @Prop({ required: true, enum: JobType })
    type: JobType;

    @ApiProperty({ type: String, description: 'Employer User ID' })
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    company: Types.ObjectId;

    @ApiProperty({ example: 50000, required: false })
    @Prop()
    salaryMin?: number;

    @ApiProperty({ example: 100000, required: false })
    @Prop()
    salaryMax?: number;

    @ApiProperty({ example: false })
    @Prop({ default: false })
    isClosed: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
