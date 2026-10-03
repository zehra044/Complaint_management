import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMessageDto } from './create-message.dto.js';

type AuthUser = { sub: number; role: string };

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAccess(complaintId: number, user: AuthUser) {
    const complaint = await this.prisma.db.orm.public.Complaints.where({
      complaintId,
    }).first();

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (user.role === 'CUSTOMER') {
      const customer = await this.prisma.db.orm.public.Customers.where({
        userId: user.sub,
      }).first();

      if (!customer || customer.customerId !== complaint.customerId) {
        throw new ForbiddenException('You can only access your own complaints');
      }
    }
  }

  async createMessage(
    complaintId: number,
    user: AuthUser,
    data: CreateMessageDto,
  ) {
    await this.assertAccess(complaintId, user);

    if (user.role === 'CUSTOMER') {
      const customer = await this.prisma.db.orm.public.Customers.where({
        userId: user.sub,
      }).first();

      return this.prisma.db.orm.public.Messages.create({
        complaintId,
        customerId: customer!.customerId,
        messageText: data.messageText,
      });
    }

    const employee = await this.prisma.db.orm.public.Employees.where({
      userId: user.sub,
    }).first();

    if (!employee) {
      throw new ForbiddenException('No employee profile linked to this account');
    }

    return this.prisma.db.orm.public.Messages.create({
      complaintId,
      employeeId: employee.employeeId,
      messageText: data.messageText,
    });
  }

  async getMessages(complaintId: number, user: AuthUser) {
    await this.assertAccess(complaintId, user);

    return this.prisma.db.orm.public.Messages.where({ complaintId })
      .orderBy((m) => m.createdAt.asc())
      .all();
  }
}