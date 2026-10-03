import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  private async getComplaintOrThrow(id: number) {
    const complaint = await this.prisma.db.orm.public.Complaints
      .where({ complaintId: id })
      .first();

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async getComplaintById(id: number) {
    return this.getComplaintOrThrow(id);
  }

  async updateComplaintStatus(
    id: number,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
  ) {
    await this.getComplaintOrThrow(id);

    return this.prisma.db.orm.public.Complaints
      .where({ complaintId: id })
      .update({
        status: status as Varchar<20>,
      });
  }

  async deleteComplaint(id: number) {
    await this.getComplaintOrThrow(id);

    await this.prisma.db.orm.public.Complaints
      .where({ complaintId: id })
      .delete();

    return { message: 'Complaint deleted', id };
  }

  async assignComplaint(complaintId: number, employeeId: number) {
    await this.getComplaintOrThrow(complaintId);

    const employee = await this.prisma.db.orm.public.Employees.where({
      employeeId,
    }).first();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const existing = await this.prisma.db.orm.public.ComplaintEmployees.where({
      complaintId,
      employeeId,
    }).first();

    if (existing) {
      throw new ConflictException(
        'Complaint is already assigned to this employee',
      );
    }

    await this.prisma.db.orm.public.ComplaintEmployees.create({
      complaintId,
      employeeId,
    });

    return { message: 'Complaint assigned', complaintId, employeeId };
  }

  async unassignComplaint(complaintId: number, employeeId: number) {
    const existing = await this.prisma.db.orm.public.ComplaintEmployees.where({
      complaintId,
      employeeId,
    }).first();

    if (!existing) {
      throw new NotFoundException('This assignment does not exist');
    }

    await this.prisma.db.orm.public.ComplaintEmployees.where({
      complaintId,
      employeeId,
    }).delete();

    return { message: 'Assignment removed', complaintId, employeeId };
  }

  async getAssignedComplaints(userId: number) {
    const employee = await this.prisma.db.orm.public.Employees.where({
      userId,
    }).first();

    if (!employee) {
      throw new NotFoundException('No employee profile linked to this account');
    }

    const assignments = await this.prisma.db.orm.public.ComplaintEmployees
      .where({ employeeId: employee.employeeId })
      .all();

    const complaintIds = assignments.map((a) => a.complaintId);

    if (complaintIds.length === 0) {
      return [];
    }

    return this.prisma.db.orm.public.Complaints.where((c) =>
      c.complaintId.in(complaintIds),
    ).all();
  }
}