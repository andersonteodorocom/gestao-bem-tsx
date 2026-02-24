import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventUser, RegistrationStatus } from './entities/event-user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventUser)
    private readonly eventUserRepository: Repository<EventUser>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: number) {
    console.log('Create event DTO:', createEventDto);
    console.log('User ID:', userId);
    
    const event = this.eventRepository.create({
      ...createEventDto,
      createdById: userId,
    });
    
    console.log('Event to be saved:', event);
    
    try {
      const savedEvent = await this.eventRepository.save(event);
      console.log('Event saved successfully:', savedEvent);
      return savedEvent;
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  async findAll(organizationId: number) {
    console.log('EventsService.findAll called with organizationId:', organizationId);
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.userRegistrations', 'userRegistrations')
      .leftJoinAndSelect('userRegistrations.user', 'user')
      .leftJoinAndSelect('event.tasks', 'tasks')
      .where('event.organizationId = :organizationId', { organizationId })
      .orderBy('event.eventDate', 'DESC')
      .getMany();
    
    console.log(`Found ${events.length} events for organization ${organizationId}`);
    return events;
  }


  async findOne(id: number) {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.userRegistrations', 'userRegistrations')
      .leftJoinAndSelect('userRegistrations.user', 'user')
      .leftJoinAndSelect('event.tasks', 'tasks')
      .leftJoinAndSelect('tasks.taskUsers', 'taskUsers')
      .leftJoinAndSelect('taskUsers.user', 'taskUser')
      .leftJoinAndSelect('tasks.assignee', 'assignee')
      .where('event.id = :id', { id })
      .getOne();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);
    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
    return { message: 'Event deleted successfully' };
  }

  async registerVolunteer(eventId: number, userId: number) {
    const event = await this.findOne(eventId);
    
    const existingRegistration = await this.eventUserRepository.findOne({
      where: { eventId, userId }
    });

    if (existingRegistration) {
      return { message: 'Already registered' };
    }

    if (event.confirmedParticipants >= event.maxParticipants) {
      throw new NotFoundException('Event is full');
    }

    const eventUser = this.eventUserRepository.create({
      eventId,
      userId,
      status: RegistrationStatus.CONFIRMED
    });

    await this.eventUserRepository.save(eventUser);
    
    event.confirmedParticipants += 1;
    await this.eventRepository.save(event);

    return { message: 'Registered successfully' };
  }

  async unregisterVolunteer(eventId: number, userId: number) {
    const eventUser = await this.eventUserRepository.findOne({
      where: { eventId, userId }
    });

    if (!eventUser) {
      throw new NotFoundException('Registration not found');
    }

    await this.eventUserRepository.remove(eventUser);

    const event = await this.findOne(eventId);
    event.confirmedParticipants -= 1;
    await this.eventRepository.save(event);

    return { message: 'Unregistered successfully' };
  }
}
