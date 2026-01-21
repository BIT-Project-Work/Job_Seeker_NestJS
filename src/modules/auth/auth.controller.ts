import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  //! Register/ SignUp User

  //! Login User

  //! Refresh Token

  //! Forgot Password

  //! Reset Password

  //! Logout User

  //! Get Current User Info/ Logged in User Details

}
