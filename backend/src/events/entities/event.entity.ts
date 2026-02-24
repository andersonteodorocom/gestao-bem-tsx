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
import { EventUser } from './event-user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum EventStatus {
  PLANNED = 'planned',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  @Column({ name: 'event_time' })
  eventTime: string;

  @Column()
  location: string;

  @Column({ name: 'max_participants', default: 10 })
  maxParticipants: number;

  @Column({ name: 'confirmed_participants', default: 0 }) 
  confirmedParticipants: number; 

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PLANNED })
  status: EventStatus;

  @Column({ name: 'created_by', nullable: true })
  createdById: number;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdEvents)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => Organization, (organization) => organization.events)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => EventUser, (eventUser) => eventUser.event)
  userRegistrations: EventUser[];

  @OneToMany(() => Task, (task) => task.event)
  tasks: Task[];
}
