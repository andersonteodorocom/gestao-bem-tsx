import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';

import { Task, TaskStatus } from '../tasks/entities/task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>,
  ) {}

  async getSummary(organizationId: number) {
    console.log('Dashboard getSummary - organizationId:', organizationId);
    
    if (!organizationId) {
      console.error('organizationId is null or undefined');
      return {
        stats: {
          activeUsers: 0,
          pendingTasks: 0,
          upcomingEvents: 0,
          actionsThisMonth: 0,
        },
        recentTasks: [],
        upcomingEvents: [],
      };
    }

    const activeUsers = await this.userRepository.count({ where: { organizationId } });

    const pendingTasks = await this.taskRepository.count({ 
      where: { organizationId, status: TaskStatus.TODO } 
    });

    const upcomingEventsCount = await this.eventRepository.count({ 
      where: { organizationId, eventDate: MoreThanOrEqual(new Date()) } 
    });
    
    const actionsThisMonth = await this.userRepository.sum('actionsCount', { organizationId });

    const recentTasks = await this.taskRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['assignee'],
    });

    const upcomingEvents = await this.eventRepository.find({
      where: { organizationId, eventDate: MoreThanOrEqual(new Date()) },
      order: { eventDate: 'ASC' },
      take: 5,
    });

    console.log('Dashboard data:', { activeUsers, pendingTasks, upcomingEventsCount });

    return {
      stats: {
        activeUsers,
        pendingTasks,
        upcomingEvents: upcomingEventsCount,
        actionsThisMonth: actionsThisMonth || 0,
      },
      recentTasks,
      upcomingEvents,
    };
  }
}