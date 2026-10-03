import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { CreateMessageDto } from './create-message.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('complaints/:complaintId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Roles('CUSTOMER', 'EMPLOYEE')
  createMessage(
    @Param('complaintId') complaintId: string,
    @Req() req: any,
    @Body() data: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(Number(complaintId), req.user, data);
  }

  @Get()
  @Roles('CUSTOMER', 'EMPLOYEE', 'MANAGER')
  getMessages(@Param('complaintId') complaintId: string, @Req() req: any) {
    return this.messagesService.getMessages(Number(complaintId), req.user);
  }
}