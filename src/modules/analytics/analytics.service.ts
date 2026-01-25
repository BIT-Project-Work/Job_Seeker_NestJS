import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../applications/schemas/application.schema';
import { EmployerAnalyticsResponseDto } from './dto/analytics-response.dto';
import { getTrend } from 'src/common/utils/trends.util';

interface PopulatedApplicant {
  name: string;
  email: string;
  avatar?: string;
}
interface PopulatedJob {
  title: string;
}

@Injectable()
export class AnalyticsService {

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
  ) { }

  //! Employer analytics
  async getEmployerAnalytics(
    userId: Types.ObjectId,
    role: string,
  ): Promise<EmployerAnalyticsResponseDto> {
    if (role !== 'EMPLOYER') {
      throw new ForbiddenException('Access denied');
    }

    const now = new Date();
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date();
    prev7Days.setDate(now.getDate() - 14);

    // === COUNTS ===
    const totalActiveJobs = await this.jobModel.countDocuments({
      company: userId,
      isClosed: false,
    });

    const jobs = await this.jobModel
      .find({ company: userId })
      .select('_id')
      .lean();
    const jobIds = jobs.map(job => job._id);

    const totalApplications = await this.applicationModel.countDocuments({
      job: { $in: jobIds },
    });

    const totalHired = await this.applicationModel.countDocuments({
      job: { $in: jobIds },
      status: 'Accepted',
    });

    // === TRENDS ===
    const countInPeriod = async (
      model: Model<any>,
      filter: Record<string, any>,
      start: Date,
      end: Date,
    ) => model.countDocuments({ ...filter, createdAt: { $gte: start, $lte: end } });

    const activeJobsLast7 = await countInPeriod(this.jobModel, { company: userId }, last7Days, now);
    const activeJobsPrev7 = await countInPeriod(this.jobModel, { company: userId }, prev7Days, last7Days);
    const activeJobTrend = getTrend(activeJobsLast7, activeJobsPrev7);

    const applicationsLast7 = await countInPeriod(this.applicationModel, { job: { $in: jobIds } }, last7Days, now);
    const applicationsPrev7 = await countInPeriod(this.applicationModel, { job: { $in: jobIds } }, prev7Days, last7Days);
    const applicantTrend = getTrend(applicationsLast7, applicationsPrev7);

    const hiredLast7 = await countInPeriod(this.applicationModel, { job: { $in: jobIds }, status: 'Accepted' }, last7Days, now);
    const hiredPrev7 = await countInPeriod(this.applicationModel, { job: { $in: jobIds }, status: 'Accepted' }, prev7Days, last7Days);
    const hiredTrend = getTrend(hiredLast7, hiredPrev7);

    // === RECENT DATA ===
    const recentJobs = await this.jobModel
      .find({ company: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location type createdAt isClosed')
      .lean();

    const recentApplications = (await this.applicationModel
      .find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('applicant', 'name email avatar')
      .populate('job', 'title')
      .lean()) as unknown as Array<{
        applicant: {
          name: string;
          email: string;
          avatar?: string;
        };
        job: {
          title: string;
        };
        status: string;
        createdAt: Date;
      }>;

    // const recentApplicationsDto = recentApplications.map(app => ({
    //   applicant: {
    //     name: app.applicant.name,
    //     email: app.applicant.email,
    //     avatar: app.applicant.avatar,
    //   },
    //   job: {
    //     title: app.job.title,
    //   },
    //   status: app.status,
    //   createdAt: app.createdAt,
    // }));

    const recentApplicationsDto = recentApplications.map(app => ({
      applicant: {
        name: app.applicant.name,
        email: app.applicant.email,
        avatar: app.applicant.avatar,
      },
      job: {
        title: app.job.title,
      },
      status: app.status,
      createdAt: app.createdAt,
    }));


    return {
      counts: {
        totalActiveJobs,
        totalApplications,
        totalHired,
        trends: {
          activeJobs: activeJobTrend,
          totalApplicants: applicantTrend,
          totalHired: hiredTrend,
        },
      },
      data: {
        recentJobs,
        recentApplications: recentApplicationsDto,
      },
    };
  }

}
