import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { Model, Types } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../applications/schemas/application.schema';
// import { SavedJob, SavedJobDocument } from '../savedJobs/schemas/saved-job.schema';
import { SavedJob, SavedJobDocument } from '../savedJobs/schemas/saved-job.schema';
import { JobQueryDto } from './dto/job-query.dto';
import { ApplicationStatus } from 'src/common/enums/applicationStatus';

/**
 *! Job Service
 */
@Injectable()
export class JobsService {
  //! DI
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private appModel: Model<ApplicationDocument>,
    @InjectModel(SavedJob.name) private savedJobModel: Model<SavedJobDocument>,
  ) { }

  /**
   *! Create Job
   */
  async create(createJobDto: CreateJobDto, user: any) {
    console.log(user._id);
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only employers can post jobs');
    }

    return this.jobModel.create({
      ...createJobDto,
      company: user._id,
    });
  }

  /**
   *! Get All Jobs with Queries
   */
  async findAll(queryDto: JobQueryDto) {
    const { keyword, location, category, type, minSalary, maxSalary, userId } =
      queryDto;

    const query: any = {
      isClosed: false,
      ...(keyword && { title: { $regex: keyword, $options: 'i' } }),
      ...(location && { location: { $regex: location, $options: 'i' } }),
      ...(category && { category }),
      ...(type && { type }),
    };

    if (minSalary || maxSalary) {
      query.$and = [];
      if (minSalary) query.$and.push({ salaryMax: { $gte: minSalary } });
      if (maxSalary) query.$and.push({ salaryMin: { $lte: maxSalary } });
    }

    const jobs = await this.jobModel
      .find(query)
      .populate('company', 'name companyName companyLogo')
      .lean();

    // let savedIds: string[] = [];

    let savedIdSet = new Set<string>();
    const appliedMap: Record<string, string> = {};

    if (userId) {
      const uid = new Types.ObjectId(userId);

      const saved = await this.savedJobModel
        .find({ jobseeker: uid })
        .select('job');

      // savedIds = saved.map(s => String(s.job));
      savedIdSet = new Set(saved.map((s) => s.job.toString()));

      const apps = await this.appModel
        .find({ applicant: uid })
        .select('job status');

      apps.forEach((app) => {
        // appliedMap[String(app.job)] = app.status;
        appliedMap[app.job.toString()] = app.status;
      });
    }

    return jobs.map((job) => {
      // const id = String(job._id);
      const id = job._id.toString();
      return {
        // ...job.toObject(),
        ...job,
        // isSaved: savedIds.includes(id),
        isSaved: savedIdSet.has(id),
        applicationStatus: appliedMap[id] || null,
      };
    });
  }

  /**
   *! Get All Jobs Without Queries
   */

  /**
   *! Employer Jobs
   */
  async findEmployerJobs(user: any) {
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Access denied');
    }

    const jobs = await this.jobModel
      .find({ company: user._id })
      .populate('company', 'name companyName companyLogo')
      .lean();

    return Promise.all(
      jobs.map(async (job) => ({
        ...job,
        applicationCount: await this.appModel.countDocuments({
          job: new Types.ObjectId(job._id),
        }),
      })),
    );

    // const jobs = await this.jobModel.aggregate([
    //   { $match: { company: new Types.ObjectId(user._id) } },
    //   {
    //     $lookup: {
    //       from: 'applications',
    //       localField: '_id',
    //       foreignField: 'job',
    //       as: 'applications',
    //     },
    //   },
    //   {
    //     $addFields: {
    //       applicationCount: { $size: '$applications' },
    //     },
    //   },
    //   {
    //     $project: {
    //       applications: 0,
    //     },
    //   },
    // ]);

    // return jobs;
  }

  /**
   *! Get Job by id
   */
  async findOne(id: string, userId?: string) {
    const job = await this.jobModel
      .findById(id)
      .populate('company', 'name companyName companyLogo');

    if (!job) throw new NotFoundException('Job not found');

    let applicationStatus: ApplicationStatus | null = null;

    if (userId) {
      const app = await this.appModel.findOne({
        job: job._id,
        applicant: userId,
      });
      applicationStatus = app?.status ?? null;
    }

    return { ...job.toObject(), applicationStatus };
  }

  /**
   *! Update a Job
   */
  async update(id: string, dto: UpdateJobDto, user: any) {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job not found');

    if (job.company.toString() !== user._id.toString()) {
      throw new ForbiddenException('Not authorized');
    }

    Object.assign(job, dto);
    return job.save();
  }

  /**
   *! Delete job
   */
  async remove(id: string, user: any) {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job not found');

    if (job.company.toString() !== user._id.toString()) {
      throw new ForbiddenException('Not authorized');
    }

    await job.deleteOne();
    return { message: 'Job deleted successfully' };
  }

  /**
   *! Toggle Close
   */
  async toggleClose(id: string, user: any) {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job not found');

    if (job.company.toString() !== user._id.toString()) {
      throw new ForbiddenException('Not authorized');
    }

    job.isClosed = !job.isClosed;
    await job.save();

    return { message: 'Job status updated' };
  }
}
