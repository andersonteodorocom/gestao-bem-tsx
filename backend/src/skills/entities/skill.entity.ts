import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSkill } from 'src/users/entities/user-skill.entity';

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;


  @OneToMany(() => UserSkill, (userSkill) => userSkill.skill) 
  userConnections: UserSkill[];
}
