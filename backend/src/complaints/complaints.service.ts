import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateComplaintDto } from './create-complaint.dto.js';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async getComplaints() {
    return this.prisma.db.orm.public.Complaints.all();
  }

  async createComplaint(data: CreateComplaintDto) {
    return this.prisma.db.orm.public.Complaints.create(
      {
        customerId: data.customerId,
        typeId: data.typeId,
        complaintDetail: data.complaintDetail,
      },
    );
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
      status,
    });
}


async deleteComplaint(id: number) {
  return this.prisma.db.orm.public.Complaints
    .where({ complaintId: id })
    .delete();
}
}
