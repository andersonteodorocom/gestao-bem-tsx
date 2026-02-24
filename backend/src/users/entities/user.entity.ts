import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Task } from '../../tasks/entities/task.entity';
import { EventUser } from '../../events/entities/event-user.entity';
import { UserSkill } from './user-skill.entity';
import { Event } from '../../events/entities/event.entity';
import { TaskUser } from '../../tasks/entities/task-user.entity';

export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  VOLUNTEER = 'volunteer',
  ORGANIZATION = 'organization'
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VOLUNTEER })
  role: UserRole;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'actions_count', default: 0 })
  actionsCount: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ name: 'reset_password_token', type: 'varchar', length: 255, nullable: true })
  resetPasswordToken: string | undefined;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | undefined;

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks: Task[];

  @OneToMany(() => Event, (event) => event.createdBy) 
  createdEvents: Event[];

  @OneToMany(() => EventUser, (eventUser) => eventUser.user)
  eventRegistrations: EventUser[];

  @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
  skillConnections: UserSkill[];

  @OneToMany(() => TaskUser, (taskUser) => taskUser.user)
  taskAssignments: TaskUser[];
}
