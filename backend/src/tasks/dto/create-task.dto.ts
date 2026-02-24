import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsArray } from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @IsArray()
  @IsOptional()
  assigneeIds?: number[];

  @IsNumber()
  @IsOptional()
  eventId?: number;

  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsNumber()
  @IsOptional()
  createdById?: number;
}
