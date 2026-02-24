import { apiClient } from './api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'coordinator' | 'volunteer';
  phone?: string;
  actionsCount: number;
  status: 'active' | 'inactive';
  organizationId?: number;
  skills?: string[];
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password?: string;
  role?: 'admin' | 'coordinator' | 'volunteer';
  phone?: string;
  skills?: string[];
}

export type UpdateUserDto = Partial<CreateUserDto>;

class UsersService {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  }

  async getOne(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  async create(data: CreateUserDto): Promise<User> {
    return apiClient.post<User>('/users', data);
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/users/${id}`);
  }

  async toggleStatus(id: number): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/status`, {});
  }
}

export const usersService = new UsersService();
