import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { TaskUser } from './entities/task-user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser)
    private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    console.log('=== CREATING TASK ===');
    console.log('createTaskDto:', JSON.stringify(createTaskDto, null, 2));
    
    const { assigneeIds, ...taskData } = createTaskDto;
    
    const task = this.taskRepository.create({
      ...taskData,
      status: createTaskDto.status || TaskStatus.TODO,
    });
    
    const savedTask = await this.taskRepository.save(task);
    console.log('Task created with ID:', savedTask.id);
    
    // Assign multiple users if assigneeIds provided
    if (assigneeIds && assigneeIds.length > 0) {
      for (const userId of assigneeIds) {
        const taskUser = this.taskUserRepository.create({
          taskId: savedTask.id,
          userId: userId,
        });
        await this.taskUserRepository.save(taskUser);
      }
      console.log(`Assigned ${assigneeIds.length} users to task ${savedTask.id}`);
      
      // Send email to each assigned user
      for (const userId of assigneeIds) {
        try {
          const user = await this.userRepository.findOne({ where: { id: userId } });
          if (user) {
            await this.emailService.sendTaskAssignedEmail(
              user.email,
              user.fullName,
              savedTask.title,
              savedTask.description,
              savedTask.dueDate,
              savedTask.priority,
            );
          }
        } catch (error) {
          console.error(`Error sending email to user ${userId}:`, error);
        }
      }
    }
    
    // Legacy single assignee support
    if (savedTask.assigneeId && (!assigneeIds || assigneeIds.length === 0)) {
      try {
        const assignee = await this.userRepository.findOne({
          where: { id: savedTask.assigneeId },
        });
        if (assignee) {
          await this.emailService.sendTaskAssignedEmail(
            assignee.email,
            assignee.fullName,
            savedTask.title,
            savedTask.description,
            savedTask.dueDate,
            savedTask.priority,
          );
        }
      } catch (error) {
        console.error('Error sending task assignment email:', error);
      }
    }
    
    return this.findOne(savedTask.id);
  }

  async findAll(organizationId: number) {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.event', 'event')
      .leftJoinAndSelect('task.taskUsers', 'taskUsers')
      .leftJoinAndSelect('taskUsers.user', 'taskUser')
      .where('task.organizationId = :organizationId', { organizationId })
      .orderBy('task.dueDate', 'ASC')
      .addOrderBy('task.priority', 'DESC')
      .getMany();
    
    console.log(`Found ${tasks.length} tasks for organization ${organizationId}`);
    return tasks;
  }

  async findOne(id: number) {
    const task = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.event', 'event')
      .leftJoinAndSelect('task.taskUsers', 'taskUsers')
      .leftJoinAndSelect('taskUsers.user', 'taskUser')
      .where('task.id = :id', { id })
      .getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    console.log(`=== UPDATE TASK ${id} ===`);
    console.log('updateTaskDto:', JSON.stringify(updateTaskDto, null, 2));
    
    const task = await this.findOne(id);
    console.log('Current task:', JSON.stringify({ 
      id: task.id, 
      title: task.title,
      assigneeId: task.assigneeId, 
      status: task.status 
    }, null, 2));
    
    const previousAssigneeId = task.assigneeId;
    const previousStatus = task.status;
    
    // Update fields
    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.description) task.description = updateTaskDto.description;
    if (updateTaskDto.dueDate) task.dueDate = new Date(updateTaskDto.dueDate);
    if (updateTaskDto.priority) task.priority = updateTaskDto.priority;
    
    console.log(`Checking assignee update: newAssigneeId=${updateTaskDto.assigneeId}, previousAssigneeId=${previousAssigneeId}, status=${task.status}`);
    
    // Permitir troca de assignee apenas se tarefa não estiver concluída
    if (updateTaskDto.assigneeId !== undefined && task.status !== TaskStatus.DONE) {
      const newAssigneeId = updateTaskDto.assigneeId;
      
      console.log(`Will update assignee from ${previousAssigneeId} to ${newAssigneeId}`);
      
      // Se trocou o assignee, enviar email para o novo
      if (newAssigneeId && newAssigneeId !== previousAssigneeId) {
        task.assigneeId = newAssigneeId;
        
        try {
          const newAssignee = await this.userRepository.findOne({
            where: { id: newAssigneeId },
          });
          
          console.log('Found new assignee:', newAssignee?.fullName);
          
          if (newAssignee) {
            await this.emailService.sendTaskAssignedEmail(
              newAssignee.email,
              newAssignee.fullName,
              task.title,
              task.description,
              task.dueDate,
              task.priority,
            );
            console.log(`Task reassignment email sent to ${newAssignee.email}`);
          }
        } catch (error) {
          console.error('Error sending task reassignment email:', error);
        }
      } else if (newAssigneeId === null || newAssigneeId === undefined) {
        // Remover assignee
        task.assigneeId = null;
        console.log('Removed assignee');
      }
    } else {
      console.log('Assignee update skipped - task is DONE or assigneeId not provided');
    }
    
    // Handle status change
    if (updateTaskDto.status) {
      task.status = updateTaskDto.status;
      
      if (updateTaskDto.status === TaskStatus.DONE && !task.completedAt) {
        task.completedAt = new Date();
        console.log('Task marked as done at:', task.completedAt);
        
        // Incrementar actionsCount do usuário assignado
        if (task.assigneeId) {
          await this.userRepository.increment(
            { id: task.assigneeId },
            'actionsCount',
            1
          );
          console.log(`Incremented actionsCount for user ${task.assigneeId}`);
        }
      } else if (updateTaskDto.status !== TaskStatus.DONE && task.completedAt) {
        // Se estava DONE e mudou para outro status, decrementar
        if (previousStatus === TaskStatus.DONE && task.assigneeId) {
          await this.userRepository.decrement(
            { id: task.assigneeId },
            'actionsCount',
            1
          );
          console.log(`Decremented actionsCount for user ${task.assigneeId}`);
        }
        task.completedAt = null;
      }
    }
    
    const savedTask = await this.taskRepository.save(task);
    console.log('Task updated:', savedTask);
    
    return this.findOne(savedTask.id);
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    console.log(`Task ${id} deleted successfully`);
    return { message: 'Task deleted successfully' };
  }

  // Find all tasks for a specific event
  async findByEvent(eventId: number) {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.taskUsers', 'taskUsers')
      .leftJoinAndSelect('taskUsers.user', 'taskUser')
      .where('task.eventId = :eventId', { eventId })
      .orderBy('task.dueDate', 'ASC')
      .addOrderBy('task.priority', 'DESC')
      .getMany();

    console.log(`Found ${tasks.length} tasks for event ${eventId}`);
    return tasks;
  }

  // Assign a user to a task
  async assignUser(taskId: number, userId: number) {
    const task = await this.findOne(taskId);
    
    const existing = await this.taskUserRepository.findOne({
      where: { taskId, userId },
    });
    if (existing) {
      return { message: 'User already assigned to this task' };
    }

    const taskUser = this.taskUserRepository.create({ taskId, userId });
    await this.taskUserRepository.save(taskUser);

    // Send email notification
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.emailService.sendTaskAssignedEmail(
          user.email,
          user.fullName,
          task.title,
          task.description,
          task.dueDate,
          task.priority,
        );
      }
    } catch (error) {
      console.error(`Error sending assignment email to user ${userId}:`, error);
    }

    return this.findOne(taskId);
  }

  // Unassign a user from a task
  async unassignUser(taskId: number, userId: number) {
    const taskUser = await this.taskUserRepository.findOne({
      where: { taskId, userId },
    });

    if (!taskUser) {
      throw new NotFoundException('User assignment not found');
    }

    await this.taskUserRepository.remove(taskUser);
    return this.findOne(taskId);
  }

  // Batch create multiple tasks for an event
  async createBatch(tasks: CreateTaskDto[], eventId: number, organizationId: number, createdById: number) {
    const createdTasks: Task[] = [];
    for (const taskDto of tasks) {
      const created = await this.create({
        ...taskDto,
        eventId,
        organizationId,
        createdById,
      });
      createdTasks.push(created);
    }
    return createdTasks;
  }
}
