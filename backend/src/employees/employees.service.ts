import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeDto } from './create-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: CreateEmployeeDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.db.orm.public.Users.create({
      email: data.email as Varchar<150>,
      passwordHash: hashedPassword,
      role: 'EMPLOYEE' as Varchar<20>,
    });

    await this.prisma.db.orm.public.Employees.create({
      name: data.name as Varchar<100>,
      phone: data.phone as Varchar<20>,
      title: data.title as Varchar<100>,
      user: (userRelation) => userRelation.connect({ userId: user.userId }),
    });

    return {
      message: 'Employee created successfully',
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  }

  async getEmployees() {
    const employees = await this.prisma.db.orm.public.Employees.all();
    const users = await this.prisma.db.orm.public.Users
      .select('userId', 'email')
      .all();
    const emailByUserId = new Map(users.map((u) => [u.userId, u.email]));

    return employees.map((e) => ({
      employeeId: e.employeeId,
      name: e.name,
      phone: e.phone,
      title: e.title,
      userId: e.userId,
      email: e.userId === null ? null : (emailByUserId.get(e.userId) ?? null),
    }));
  }
}