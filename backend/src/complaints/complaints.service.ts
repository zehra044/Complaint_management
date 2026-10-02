import { Injectable, NotFoundException } from '@nestjs/common';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateComplaintDto } from './create-complaint.dto.js';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCustomerIdForUser(userId: number): Promise<number> {
    const customer = await this.prisma.db.orm.public.Customers.where({
      userId,
    }).first();

    if (!customer) {
      throw new NotFoundException('No customer profile linked to this account');
    }

    return customer.customerId;
  }

  async getComplaints() {
    return this.prisma.db.orm.public.Complaints.all();
  }

  async createComplaint(userId: number, data: CreateComplaintDto) {
    const customerId = await this.getCustomerIdForUser(userId);

    return this.prisma.db.orm.public.Complaints.create({
      customerId,
      typeId: data.typeId,
      complaintDetail: data.complaintDetail,
    });
  }

  async getMyComplaints(userId: number) {
    const customerId = await this.getCustomerIdForUser(userId);

    return this.prisma.db.orm.public.Complaints.where({
      customerId,
    }).all();
  }

  async getComplaintById(id: number) {
    return this.prisma.db.orm.public.Complaints
      .where({ complaintId: id })
      .first();
  }

  async updateComplaintStatus(
    id: number,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
  ) {
    return this.prisma.db.orm.public.Complaints
      .where({ complaintId: id })
      .update({
        status: status as Varchar<20>,
      });
  }

  async deleteComplaint(id: number) {
    return this.prisma.db.orm.public.Complaints
      .where({ complaintId: id })
      .delete();
  }
}