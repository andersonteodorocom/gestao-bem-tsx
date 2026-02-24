import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    console.log('Create event request:', createEventDto);
    console.log('User:', req.user);
    
    return this.eventsService.create({
      ...createEventDto,
      organizationId: req.user.organizationId
    }, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    console.log('FindAll events - user:', req.user);
    console.log('FindAll events - organizationId:', req.user.organizationId);
    return this.eventsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @Post(':id/register')
  registerVolunteer(@Param('id') id: string, @Request() req) {
    return this.eventsService.registerVolunteer(+id, req.user.userId);
  }

  @Delete(':id/unregister')
  unregisterVolunteer(@Param('id') id: string, @Request() req) {
    return this.eventsService.unregisterVolunteer(+id, req.user.userId);
  }
}
