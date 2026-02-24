import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { EventUser } from './entities/event-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventUser])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
