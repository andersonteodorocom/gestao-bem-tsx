import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    console.log('Create task request:', createTaskDto);
    console.log('User:', req.user);
    
    return this.tasksService.create({
      ...createTaskDto,
      organizationId: req.user.organizationId,
      createdById: req.user.userId
    });
  }

  @Get()
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    console.log(`Update task ${id} request:`, updateTaskDto);
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    console.log(`Delete task ${id} request`);
    return this.tasksService.remove(+id);
  }

  // Get all tasks for a specific event
  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.tasksService.findByEvent(+eventId);
  }

  // Assign a user to a task
  @Post(':id/assign/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  assignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tasksService.assignUser(+id, +userId);
  }

  // Unassign a user from a task
  @Delete(':id/unassign/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  unassignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tasksService.unassignUser(+id, +userId);
  }

  // Batch create tasks for an event
  @Post('batch/:eventId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  createBatch(
    @Param('eventId') eventId: string,
    @Body() body: { tasks: CreateTaskDto[] },
    @Request() req,
  ) {
    return this.tasksService.createBatch(
      body.tasks,
      +eventId,
      req.user.organizationId,
      req.user.userId,
    );
  }
}
