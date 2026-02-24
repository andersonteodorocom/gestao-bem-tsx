import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard) 
  @Get('summary')
  getSummary(@Request() req) {
    console.log('Dashboard request user:', req.user);
    const organizationId = req.user.organizationId;
    console.log('Extracted organizationId:', organizationId);
    return this.dashboardService.getSummary(organizationId);
  }
}