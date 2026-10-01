import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: RegisterDto) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await this.prisma.db.orm.public.Users.create({
    email: data.email as Varchar<150>,
    passwordHash: hashedPassword,
    role: 'CUSTOMER' as Varchar<20>,
  });

  await this.prisma.db.orm.public.Customers.create({
    name: data.name as Varchar<100>,
    contact: data.contact as Varchar<100>,
    user: (userRelation) =>
      userRelation.connect({ userId: user.userId }),
  });

  return {
    message: 'Registration successful',
    userId: user.userId,
    email: user.email,
    role: user.role,
  };
}

}