import { apiClient } from './api';

export interface TaskUser {
  id: number;
  taskId: number;
  userId: number;
  assignedAt: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assigneeId?: number;
  assignee?: {
    id: number;
    fullName: string;
  };
  eventId?: number;
  event?: {
    id: number;
    title: string;
  };
  taskUsers?: TaskUser[];
  dueDate: string;
  priority?: 'baixa' | 'média' | 'alta' | 'urgente';
  status: 'todo' | 'in-progress' | 'done';
  createdById?: number;
  organizationId?: number;
  completedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  assigneeId?: number;
  assigneeIds?: number[];
  eventId?: number;
  dueDate: string;
  priority?: 'baixa' | 'média' | 'alta' | 'urgente';
  status?: 'todo' | 'in-progress' | 'done';
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

class TasksService {
  async getAll(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks');
  }

  async getOne(id: number): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  }

  async create(data: CreateTaskDto): Promise<Task> {
    return apiClient.post<Task>('/tasks', data);
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/tasks/${id}`);
  }

  async getByEvent(eventId: number): Promise<Task[]> {
    return apiClient.get<Task[]>(`/tasks/event/${eventId}`);
  }

  async assignUser(taskId: number, userId: number): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${taskId}/assign/${userId}`);
  }

  async unassignUser(taskId: number, userId: number): Promise<Task> {
    return apiClient.delete<Task>(`/tasks/${taskId}/unassign/${userId}`);
  }

  async createBatch(eventId: number, tasks: CreateTaskDto[]): Promise<Task[]> {
    return apiClient.post<Task[]>(`/tasks/batch/${eventId}`, { tasks });
  }
}

export const tasksService = new TasksService();
