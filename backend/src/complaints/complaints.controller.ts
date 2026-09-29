import { ComplaintsService } from './complaints.service.js';
import { CreateComplaintDto } from './create-complaint.dto.js';

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  getComplaints() {
    return this.complaintsService.getComplaints();
  }

  @Post()
  createComplaint(@Body() data: CreateComplaintDto) {
    return this.complaintsService.createComplaint(data);
  }

  @Get(':id')
  getComplaintById(@Param('id') id: string) {
  return this.complaintsService.getComplaintById(Number(id));
}

@Patch(':id/status')
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
deleteComplaint(@Param('id') id: string) {
  return this.complaintsService.deleteComplaint(Number(id));
}
}