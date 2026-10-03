import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.db.orm.public.Users
      .select('userId', 'email', 'role', 'createdAt')
      .all();
  }

  async resetPassword(userId: number, newPassword: string) {
    const user = await this.prisma.db.orm.public.Users.where({
      userId,
    }).first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.db.orm.public.Users.where({ userId }).update({
      passwordHash: await bcrypt.hash(newPassword, 10),
    });

    return { message: 'Password reset successfully', userId, email: user.email };
  }
}
