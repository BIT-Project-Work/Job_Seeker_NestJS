import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EmployerAnalyticsResponseDto } from './dto/analytics-response.dto';

/**
 *! Analytics API controller
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {

  //! DI 
  constructor(private readonly analyticsService: AnalyticsService) { }

  /**
   *! Get Employer Analytics
   */
  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Employee Analytics Overview',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics Overview',
    type: EmployerAnalyticsResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  getEmployerAnalytics(@Req() req): Promise<EmployerAnalyticsResponseDto> {
    return this.analyticsService.getEmployerAnalytics(req.user._id, req.user.role);
  }
}
