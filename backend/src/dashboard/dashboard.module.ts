import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Event } from '../events/entities/event.entity';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    AuthModule, 
    TypeOrmModule.forFeature([User, Task, Event])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}