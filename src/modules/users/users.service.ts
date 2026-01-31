import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { DeleteResumeDto } from './dto/delete-resume.dto';
import { Role } from 'src/common/enums/role';
import { PublicProfileResponseDto } from './dto/public-profile-response.dto';

/**
 *! User Services
 */
@Injectable()
export class UsersService {
  //! DI
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: Partial<User>) {
    return await this.userModel.create(createUserDto);
  }

  /**
   *! Find all users
   */
  async findAll() {
    return await this.userModel.find();
  }

  /**
   *! Find user by email address
   */
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  /**
   *! Find User by id
   */
  async findOne(id: string) {
    return await this.userModel.findById(id).select('-password');
  }

  /**
   *!  Update User profile
   */
  async updateProfie(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = dto.name ?? user.name;
    user.avatar = dto.avatar ?? user.avatar;
    user.resume = dto.resume ?? user.resume;

    if (user.role === 'EMPLOYER') {
      user.companyName = dto.companyName ?? user.companyName;
      user.companyDescription =
        dto.companyDescription ?? user.companyDescription;
      user.companyLogo = dto.companyLogo ?? user.companyLogo;
    }

    await user.save();

    return {
      _id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName || '',
      companyDescription: user.companyDescription || '',
      companyLogo: user.companyLogo || '',
      resume: user.resume || '',
    };
  }

  /**
   *!  Delete Resume
   */
  async deleteResume(userId: string, dto: DeleteResumeDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.JOBSEEKER) {
      throw new ForbiddenException('Only jobseekers can delete resume');
    }

    // Extract filename from URL
    const fileName = dto.resumeUrl.split('/').pop();

    if (fileName) {
      const filePath = path.join(process.cwd(), 'uploads', fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.resume = '';
    await user.save();

    return {
      message: 'Resume deleted successfully',
    };
  }

  /**
   *!   Delete a user
   */
  async remove(id: string) {
    return `This action removes a #${id} user`;
  }

  //! Get Public profile
  async getPublicProfile(userId: string): Promise<PublicProfileResponseDto> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      resume: user.resume ?? '',
      companyName: user.companyName ?? '',
      companyDescription: user.companyDescription ?? '',
      companyLogo: user.companyLogo ?? '',
      createdAt: user.createdAt,
    };
  }
}
