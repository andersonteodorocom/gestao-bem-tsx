import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Skill } from '../../skills/entities/skill.entity';

export enum ProficiencyLevel {
  BASICO = 'básico',
  INTERMEDIARIO = 'intermediário',
  AVANCADO = 'avançado',
}

@Entity({ name: 'user_skills' }) 
export class UserSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' }) 
  userId: number;

  @Column({ name: 'skill_id' })
  skillId: number;

  @Column({
    name: 'proficiency_level',
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.BASICO,
  })
  proficiencyLevel: ProficiencyLevel;

  @ManyToOne(() => User, (user) => user.skillConnections) 
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Skill, (skill) => skill.userConnections)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
