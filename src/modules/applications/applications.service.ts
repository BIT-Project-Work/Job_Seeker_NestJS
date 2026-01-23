import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { ApplicationStatus } from 'src/common/enums/applicationStatus';

@Injectable()
export class ApplicationsService {

  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) { }

  //! Apply to Job
  async applyToJob(userId: Types.ObjectId, jobId: string, resume?: string) {
    const existing = await this.applicationModel.findOne({ job: jobId, applicant: userId });
    if (existing) throw new BadRequestException('Already applied to this job');

    const application = await this.applicationModel.create({
      job: jobId,
      applicant: userId,
      resume,
    });

    return application;
  }

  //! Get My Applications
  async getMyApplications(userId: Types.ObjectId) {
    return this.applicationModel
      .find({ applicant: userId })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
  }

  //! Get Applicants for Job
  async getApplicantsForJob(jobId: string, userId: Types.ObjectId) {
    const job = await this.jobModel.findById(jobId);
    if (!job || job.company.toString() !== userId.toString()) {
      throw new ForbiddenException('Not authorized to view applicants');
    }

    return this.applicationModel
      .find({ job: jobId })
      .populate('job', 'title location category type')
      .populate('applicant', 'name email avatar resume');
  }

  //! Get Application By Id
  async getApplicationById(applicationId: string, userId: Types.ObjectId) {
    const app = await this.applicationModel
      .findById(applicationId)
      .populate('job', 'title company')
      .populate('applicant', 'name email avatar resume');

    if (!app) throw new NotFoundException('Application not found');

    const job = app.job as unknown as { _id: Types.ObjectId; title: string; company: Types.ObjectId };
    const applicant = app.applicant as unknown as { _id: Types.ObjectId };

    const isOwner =
      applicant._id.toString() === userId.toString() ||
      job.company.toString() === userId.toString();

    if (!isOwner) throw new ForbiddenException('Not authorized to view this application');

    return app;
  }

  //! Update Status
  async updateStatus(applicationId: string, userId: Types.ObjectId, status: ApplicationStatus) {
    const app = await this.applicationModel.findById(applicationId).populate('job');
    if (!app) throw new NotFoundException('Application not found');

    // Tell TypeScript the shape of populated job
    const job = app.job as unknown as { company: Types.ObjectId };

    if (job.company.toString() !== userId.toString()) {
      throw new ForbiddenException('Not authorized to update this application');
    }

    app.status = status;
    await app.save();

    return { message: 'Application status updated', status };
  }

  create(createApplicationDto: CreateApplicationDto) {
    return 'This action adds a new application';
  }

  findAll() {
    return `This action returns all applications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} application`;
  }

  // update(id: number, updateApplicationDto: UpdateApplicationDto) {
  //   return `This action updates a #${id} application`;
  // }

  remove(id: number) {
    return `This action removes a #${id} application`;
  }
}
