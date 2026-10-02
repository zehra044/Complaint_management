//UnauthorizedException returns a 401 automatically if credentials are wrong.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/LoginDto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(data: LoginDto) {
    const user = await this.prisma.db.orm.public.Users.where({
      email: data.email as Varchar<150>,
    }).first();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
//creates the actual token, jwtService.signAsync({...})
    const accessToken = await this.jwtService.signAsync({
      sub: user.userId,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }
}