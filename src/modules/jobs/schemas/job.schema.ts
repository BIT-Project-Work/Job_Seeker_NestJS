import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { JobType } from '../../../common/enums/jobType';
import { User } from '../../../modules/users/schemas/user.schema';

export type JobDocument = Document & Job;

@Schema({ timestamps: true })
export class Job {
  @ApiProperty({ example: 'Frontend Developer' })
  @Prop({ required: true })
  title!: string;

  @ApiProperty({ example: 'Build UI for our web app' })
  @Prop({ required: true })
  description!: string;

  @ApiProperty({ example: '3+ years experience in React' })
  @Prop({ required: true })
  requirements!: string;

  @ApiProperty({ example: 'New York, USA', required: false })
  @Prop()
  location?: string;

  @ApiProperty({ example: 'Engineering', required: false })
  @Prop()
  category?: string;

  @ApiProperty({ enum: JobType })
  @Prop({ required: true, enum: JobType, type: String })
  type!: JobType;

  @ApiProperty({ type: String, description: 'Employer User ID' })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  company!: Types.ObjectId;

  @ApiProperty({ example: 50000, required: false })
  @Prop()
  salaryMin?: number;

  @ApiProperty({ example: 100000, required: false })
  @Prop()
  salaryMax?: number;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isClosed!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// job search filters
JobSchema.index({ isClosed: 1, category: 1, type: 1 });

// employer jobs
JobSchema.index({ company: 1, createdAt: -1 });

// salary range filtering
JobSchema.index({ salaryMin: 1, salaryMax: 1 });

// latest open jobs
JobSchema.index({ isClosed: 1, createdAt: -1 });

// keyword search
JobSchema.index({ title: "text", description: "text" });

// For Analytics

JobSchema.index({ company: 1, isClosed: 1 });
JobSchema.index({ company: 1 });