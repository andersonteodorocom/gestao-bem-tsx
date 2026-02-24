import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'task_users' })
export class TaskUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne(() => Task, (task) => task.taskUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, (user) => user.taskAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
