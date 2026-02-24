// src/tasks/entities/task.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Event } from '../../events/entities/event.entity';
import { TaskUser } from './task-user.entity';

export enum TaskPriority {
  BAIXA = 'baixa',
  MEDIA = 'média',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIA })
  priority: TaskPriority;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ name: 'organization_id' }) 
  organizationId: number;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: number | null;

  @Column({ name: 'event_id', nullable: true })
  eventId: number | null;

  @Column({ name: 'created_by', nullable: true })
  createdById: number;
  
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.events)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => Event, (event) => event.tasks, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => TaskUser, (taskUser) => taskUser.task, { cascade: true })
  taskUsers: TaskUser[];
}