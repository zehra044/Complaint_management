import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ResetPasswordDto } from './reset-password.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  getUsers() {
    return this.usersService.getUsers();
  }

  @Post(':id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, data.newPassword);
  }
}
