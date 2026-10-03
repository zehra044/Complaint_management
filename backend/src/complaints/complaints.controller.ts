import { ComplaintsService } from './complaints.service.js';
import { CreateComplaintDto } from './create-complaint.dto.js';
import { UpdateComplaintStatusDto } from './update-complaint-status.dto.js';
import { AssignComplaintDto } from './assign-complaint.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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

  @Get('assigned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  getAssignedComplaints(@Req() req: any) {
    return this.complaintsService.getAssignedComplaints(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'MANAGER')
  getComplaintById(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsService.getComplaintById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'MANAGER')
  updateComplaintStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateComplaintStatus(id, data.status);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  assignComplaint(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AssignComplaintDto,
  ) {
    return this.complaintsService.assignComplaint(id, data.employeeId);
  }

  @Delete(':id/assign/:employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  unassignComplaint(
    @Param('id', ParseIntPipe) id: number,
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    return this.complaintsService.unassignComplaint(id, employeeId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  deleteComplaint(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsService.deleteComplaint(id);
  }
}
