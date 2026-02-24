import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';


@ApiTags('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() createUserDto: any, @Request() req) {
    console.log('Create user request:', createUserDto);
    console.log('User organizationId:', req.user.organizationId);
    return this.usersService.create({
      ...createUserDto,
      organizationId: req.user.organizationId
    });
  }

  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(+id);
  }
}
