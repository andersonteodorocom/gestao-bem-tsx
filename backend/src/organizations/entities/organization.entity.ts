import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Address } from '../../addresses/entities/address.entity';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'activity_field', nullable: true })
  activityField: string;

  @Column({ name: 'address_id', nullable: true, unique: true })
  addressId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Event, (event) => event.organization)
  events: Event[];

  @OneToOne(() => Address, (address) => address.organization, { cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}
