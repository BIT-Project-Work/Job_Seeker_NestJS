import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { generateOtp, hashOtp, otpExpiry } from 'src/common/utils/otp.util';
import { Otp } from './schemas/otp.schema';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/verifyEmail.dto';

/**
 *! Auth Service
 */
@Injectable()
export class AuthV2Service {
    private readonly SALT_ROUNDS = 10;

    //! Dependency Injection
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Otp.name) private otpModel: Model<Otp>,
        private jwtService: JwtService,
        private usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    //? Generate access and response tokens
    private async generateTokens(
        userId: string,
        email: string,
        role: string
    ): Promise<{ accessToken: string, refreshToken: string }> {
        const payload = { sub: userId, email, role };
        const refreshId = randomBytes(16).toString('hex');

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: this.configService.get('ACCESS_TOKEN_TIME') }),
            this.jwtService.signAsync({ ...payload, rid: refreshId }, { expiresIn: this.configService.get('REFRESH_TOKEN_TIME') })
        ]);
        return { accessToken, refreshToken };
    }

    //? Update refresh token in database during logins etc
    async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await this.UserModel.updateOne(
            { _id: userId },                 // filter
            { $set: { refreshToken } },      // update
        );
    }

    //? Response for registration
    private buildResponse(user: any) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            companyName: user.companyName || '',
            companyDescription: user.companyDescription || '',
            companyLogo: user.companyLogo || '',
            resume: user.resume || '',
        };
    }

    /**
     *! Refresh access token
     */
    async refreshTokens(userId: string): Promise<AuthResponseDto> {
        const user = await this.UserModel.findById(userId).select('-password');

        if (!user) {
            throw new UnauthorizedException("User not Found")
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role)
        await this.updateRefreshToken(user.id, tokens.refreshToken)

        return {
            ...tokens,
            user: this.buildResponse(user)
        }
    }

    /**
     *! Register a new user
     */
    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        const { name, email, password, avatar, role } = registerDto;

        const emailInUse = await this.usersService.findByEmail(email);
        if (emailInUse) {
            throw new BadRequestException('User with this email already exists');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

            const otp = generateOtp();
            const hashedOtp = hashOtp(otp);

            const user = await this.UserModel.create({
                name,
                email,
                password: hashedPassword,
                role,
                avatar,
                isEmailVerified: false,
                emailOtp: hashedOtp,
                emailOtpExpiresAt: otpExpiry(this.configService.get('OTP_EXPIRY_TIME'))
            });

            // const tokens = await this.generateTokens(user.id, user.email, user.role);
            // await this.updateRefreshToken(user.id, tokens.refreshToken);

            // return {
            //   ...tokens,
            //   user: this.buildResponse(user)
            // }

            const companyLogo = 'https://i.imgur.com/3KcynwC.png';

            const subject = `Verify Email Address via OTP`;

            const message = `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <!-- Header with logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${companyLogo}" alt="Company Logo" style="width: 120px; height: auto;" />
          </div>

          <!-- Greeting -->
          <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>

          <!-- Main message -->
          <h2 style="font-size: 16px;">
            Your OTP is: "<strong>${otp}</strong>"
          </h2>

          <!-- Footer -->
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent by <strong>Job Seeker Pvt. Ltd.</strong>. Please do not reply directly to this email.
          </p>
        </div>
      `;

            await this.mailService.sendMail(user.email, subject, message, message)

            return { message: `OTP has been sent to your email: ${user.email}` }


        } catch (error) {
            console.error('Error during user registration:', error);
            throw new InternalServerErrorException(
                'An error occured during registration',
            );
        }
    }

    /**
  *! Verify Email
  */
    async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
        const { email, otp } = dto;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('Invalid email');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email already verified');
        }

        if (!user.emailOtp || !user.emailOtpExpiresAt) {
            throw new BadRequestException('OTP not found');
        }

        if (user.emailOtpExpiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        const hashedOtp = hashOtp(otp);

        if (hashedOtp !== user.emailOtp) {
            throw new BadRequestException('Invalid OTP');
        }

        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiresAt = undefined;

        await user.save();

        return { message: 'Email verified successfully. You can now login.' };
    }

    /**
     *! Login User
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);

        if (
            !user ||
            !(await bcrypt.compare(password.trim(), user.password.trim()))
        ) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Please verify your email first');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role)
        await this.updateRefreshToken(user.id, tokens.refreshToken)

        return {
            ...tokens,
            user: this.buildResponse(user)
        }
    }

    /**
   *! Forgot password
   */
    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.UserModel.findOne({ email });

        if (!user) {
            throw new NotFoundException("User not Found")
        }

        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);

        await this.otpModel.deleteMany({ userId: user._id }); // invalidate old OTPs

        await this.otpModel.create({
            otp: hashedOtp,
            expiresAt: otpExpiry(this.configService.get('OTP_EXPIRY_TIME')), // Expires in 10 mins
            userId: user._id,
        });

        const companyLogo = 'https://i.imgur.com/3KcynwC.png';

        const subject = `JobSeeker Reset Password OTP`;

        const message = `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <!-- Header with logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${companyLogo}" alt="Company Logo" style="width: 120px; height: auto;" />
          </div>

          <!-- Greeting -->
          <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>

          <!-- Main message -->
          <h2 style="font-size: 16px;">
            Your OTP is: "<strong>${otp}</strong>"
          </h2>

          <!-- Footer -->
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent by <strong>Job Seeker Pvt. Ltd.</strong>. Please do not reply directly to this email.
          </p>
        </div>
      `;

        await this.mailService.sendMail(user.email, subject, message, message)

        return { message: `OTP has been sent to your email: ${user.email}` }
    }

    /**
   *! Verify Otp
   */
    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const user = await this.UserModel.findOne({ email });
        if (!user) throw new UnauthorizedException();

        const otpRecord = await this.otpModel.findOne({ userId: user._id });
        if (!otpRecord) throw new UnauthorizedException('OTP expired');

        if (otpRecord.expiresAt < new Date()) {
            await this.otpModel.deleteOne({ _id: otpRecord._id });
            throw new UnauthorizedException('OTP expired');
        }

        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) throw new UnauthorizedException('Invalid OTP');

        return true;
    }

    /**
  *! Resend Otp
  */
    async resendOtp(email: string): Promise<{ message: string }> {
        const user = await this.UserModel.findOne({ email });

        if (!user) {
            throw new BadRequestException('Invalid email');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email already verified');
        }

        const otp = generateOtp();

        user.emailOtp = hashOtp(otp);
        user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        const companyLogo = 'https://i.imgur.com/3KcynwC.png';

        const subject = `JobSeeker Reset Password OTP`;

        const message = `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <!-- Header with logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${companyLogo}" alt="Company Logo" style="width: 120px; height: auto;" />
          </div>

          <!-- Greeting -->
          <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>

          <!-- Main message -->
          <h2 style="font-size: 16px;">
            Your OTP is: "<strong>${otp}</strong>"
          </h2>

          <!-- Footer -->
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent by <strong>Job Seeker Pvt. Ltd.</strong>. Please do not reply directly to this email.
          </p>
        </div>
      `;

        await this.mailService.sendMail(user.email, subject, message, message)

        return { message: `OTP has been sent to your email: ${user.email}` }
    }

    /**
   *! Reset Password
  */
    async resetPassword(
        email: string,
        newPassword: string,
    ): Promise<{ message: string }> {
        const user = await this.UserModel.findOne({ email });
        if (!user) throw new UnauthorizedException();

        user.password = await bcrypt.hash(newPassword, 10);
        user.refreshToken = "";

        await user.save();
        await this.otpModel.deleteMany({ userId: user._id });

        return {
            message: "Password reset successfully!"
        }
    }

    /**
   *! Logout User
   */
    async logout(userId: string): Promise<void> {
        await this.UserModel.updateOne(
            { _id: userId },
            { $set: { refreshToken: null } },
        );
    }


}
