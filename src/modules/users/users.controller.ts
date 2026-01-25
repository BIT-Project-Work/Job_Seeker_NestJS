import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { DeleteResumeDto } from './dto/delete-resume.dto';

@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //! Update user profile 
  @Patch('profile')
  @ApiOperation({
    summary: 'Update a user profile',
    description: 'Update a user profile'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User with this id doesnot exist',
  })
  async updateProfile(
    @GetUser('_id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    return this.usersService.updateProfie(userId, updateProfileDto);
  }

  //! Delete a user
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(id);
  // }

  //! Deletes a resume
  @Delete('resume')
  async removeResume(
    @GetUser('_id') userId: string,
    @Body() deleteResumeDto: DeleteResumeDto
  ) {
    return this.usersService.deleteResume(userId, deleteResumeDto);
  }

  //! Get Public profile
  @Get('public/:id')
  @ApiParam({ name: 'id', description: 'User ID' })
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
