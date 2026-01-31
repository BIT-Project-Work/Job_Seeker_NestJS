import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/middlewares/fileupload/singlefileupload.middleware';
import type { Request } from 'express';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

/**
 *! Auth API controller
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  //! DI
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   *! Register/ SignUp User
   */
  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   *! Login User
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  //! Refresh access token
  // @Post('refresh')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(RefreshTokenGuard)
  // @ApiBearerAuth('JWT-refresh')
  // @ApiOperation({
  //   summary: 'Refresh access token',
  //   description: 'Generates a new access token using a valid refresh token'
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'New access token generated successfully',
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Unauthorized. Invalid or expired refresh token',
  // })
  // @ApiResponse({
  //   status: 429,
  //   description: 'Too Many Requests',
  // })
  // async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
  //   return await this.authService.refreshTokens(userId);
  // }

  //! Forgot Password
  // @Post('forgot_password')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Forgot Password',
  //   description: 'Sends OTP at gmail to reset user password'
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'OTP Send to your email address',
  //   type: AuthResponseDto
  // })
  // @ApiResponse({
  //   status: 429,
  //   description: 'Too Many Requests',
  // })
  // async forgotPassword() {
  //   return this.authService.forgotPassword();
  // }

  //! Verify OTP
  // @Post('otp_verify')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Forgot Password',
  //   description: 'Sends OTP at gmail to reset user password'
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'OTP Send to your email address',
  //   type: AuthResponseDto
  // })
  // @ApiResponse({
  //   status: 429,
  //   description: 'Too Many Requests',
  // })
  // async verifyOtp(){
  //   return this.authService.verifyOtp();
  // }

  //! Reset Password
  // @Post('reset_password')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Resets Password',
  //   description: 'Resets user password with new password'
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password Succeessfully reset',
  //   type: AuthResponseDto
  // })
  // @ApiResponse({
  //   status: 429,
  //   description: 'Too Many Requests',
  // })
  // async resetPassword() {
  //   return this.authService.resetPassword();
  // }

  /**
   *! Logout user and invalidate refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the user and invalidates the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return {
      message: 'Successfully logged out',
    };
  }

  /**
   *! Get Current User Info/ Logged in User Details
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current logged in user',
  })
  @ApiResponse({
    status: 200,
    description: 'Password Succeessfully reset',
    type: AuthResponseDto,
  })
  async getMe(@Req() req: any) {
    return req.user;
  }

  /**
   *! Post image
   */
  @Post('upload-image')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    // console.log(file)
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    return {
      imageUrl,
    };
  }
}
