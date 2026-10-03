import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers() {
    const customers = await this.prisma.db.orm.public.Customers.all();
    const users = await this.prisma.db.orm.public.Users
      .select('userId', 'email')
      .all();
    const emailByUserId = new Map(users.map((u) => [u.userId, u.email]));

    return customers.map((c) => ({
      customerId: c.customerId,
      name: c.name,
      contact: c.contact,
      userId: c.userId,
      email: c.userId === null ? null : (emailByUserId.get(c.userId) ?? null),
    }));
  }
}
