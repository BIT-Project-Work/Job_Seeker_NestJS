import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from 'src/common/enums/applicationStatus';
import { Job } from 'src/modules/jobs/schemas/job.schema';
import { User } from 'src/modules/users/schemas/user.schema';

export type ApplicationDocument = Document & Application;

@Schema({ timestamps: true })
export class Application {
  @ApiProperty({ type: String, description: 'Job ID' })
  @Prop({ type: Types.ObjectId, ref: Job.name, required: true })
  job: Types.ObjectId;

  @ApiProperty({ type: String, description: 'Applicant User ID' })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  applicant: Types.ObjectId;

  @ApiProperty({
    example: 'uploads/resume.pdf',
    description: 'Uploaded resume URL or file path',
    required: false,
  })
  @Prop()
  resume?: string;

  @ApiProperty({ enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  @Prop({ enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status: ApplicationStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
