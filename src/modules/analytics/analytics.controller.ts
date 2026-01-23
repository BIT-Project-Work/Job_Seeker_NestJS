import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EmployerAnalyticsResponseDto } from './dto/analytics-response.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  //! Get Employer Analytics
  @Get('employer')
  @UseGuards(JwtAuthGuard)
  getEmployerAnalytics(@Req() req): Promise<EmployerAnalyticsResponseDto> {
    return this.analyticsService.getEmployerAnalytics(req.user._id, req.user.role);
  }
}
