import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.db.orm.public.Users
      .select('userId', 'email', 'role', 'createdAt')
      .all();
  }
}