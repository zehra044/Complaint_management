import { ComplaintsService } from './complaints.service.js';
import { CreateComplaintDto } from './create-complaint.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'MANAGER')
  getComplaints() {
    return this.complaintsService.getComplaints();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createComplaint(@Req() req: any, @Body() data: CreateComplaintDto) {
    return this.complaintsService.createComplaint(req.user.sub, data);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMyComplaints(@Req() req: any) {
    return this.complaintsService.getMyComplaints(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'MANAGER')
  getComplaintById(@Param('id') id: string) {
    return this.complaintsService.getComplaintById(Number(id));
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'MANAGER')
  updateComplaintStatus(
    @Param('id') id: string,
    @Body() data: { status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' },
  ) {
    return this.complaintsService.updateComplaintStatus(
      Number(id),
      data.status,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  deleteComplaint(@Param('id') id: string) {
    return this.complaintsService.deleteComplaint(Number(id));
  }
}