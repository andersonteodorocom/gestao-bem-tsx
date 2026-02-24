import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';

export enum RegistrationStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'event_users' }) 
export class EventUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'user_id' }) 
  userId: number;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;

  @ManyToOne(() => Event, (event) => event.userRegistrations)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventRegistrations) 
  @JoinColumn({ name: 'user_id' })
  user: User;
}
