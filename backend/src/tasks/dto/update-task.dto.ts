import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
