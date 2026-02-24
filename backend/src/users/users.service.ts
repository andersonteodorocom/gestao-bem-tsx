/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, UserRole } from './entities/user.entity'
import { EmailService } from '../email/email.service'
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
    ) {}

    async findOneByEmail(email: string): Promise<User | undefined> {
        const user = await this.userRepository.findOneBy({ email })
        return user || undefined
    }

    async create(createUserDto: any) {
        console.log('Create user - incoming data:', createUserDto);
        
        // Check if email already exists
        const existingUser = await this.findOneByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email já está em uso');
        }

        // Generate password hash
        const password = createUserDto.password || createUserDto.passwordHash || '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Process skills
        let skillsArray = [];
        if (createUserDto.skills) {
            if (Array.isArray(createUserDto.skills)) {
                skillsArray = createUserDto.skills;
            } else if (typeof createUserDto.skills === 'string') {
                skillsArray = createUserDto.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
            }
        }
        console.log('Processed skills:', skillsArray);

        const user = this.userRepository.create({
            fullName: createUserDto.fullName,
            email: createUserDto.email,
            phone: createUserDto.phone || null,
            passwordHash: hashedPassword,
            role: createUserDto.role || UserRole.VOLUNTEER,
            status: createUserDto.status || 'active',
            actionsCount: 0,
            organizationId: createUserDto.organizationId,
            skills: skillsArray,
        });
        
        console.log('Creating user:', user);
        const savedUser = await this.userRepository.save(user);
        console.log('User created successfully:', savedUser);

        // Enviar email de boas-vindas com as credenciais
        try {
            await this.emailService.sendWelcomeEmail(
                savedUser.email,
                savedUser.fullName,
                password,
            );
        } catch (error) {
            console.error('Erro ao enviar email de boas-vindas:', error);
        }
        
        return savedUser;
    }

    async findAll(organizationId: number) {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.organizationId = :organizationId', { organizationId })
            .andWhere('user.role != :role', { role: UserRole.ORGANIZATION })
            .orderBy('user.fullName', 'ASC')
            .getMany();
        
        console.log('FindAll users with skills:', users.map(u => ({ id: u.id, name: u.fullName, skills: u.skills })));
        
        // Return users with their skills (empty array if null)
        return users.map(user => ({
            ...user,
            skills: user.skills || []
        }));
    }

    async findOne(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['organization']
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: number, updateUserDto: any) {
        const user = await this.findOne(id);
        
        // Check if email is being changed and if it's already in use
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findOneByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email já está em uso');
            }
        }
        
        // Update allowed fields
        if (updateUserDto.fullName !== undefined) user.fullName = updateUserDto.fullName;
        if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
        if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
        if (updateUserDto.role !== undefined) user.role = updateUserDto.role;
        
        // Process skills if provided
        if (updateUserDto.skills !== undefined) {
            let skillsArray = [];
            if (Array.isArray(updateUserDto.skills)) {
                skillsArray = updateUserDto.skills;
            } else if (typeof updateUserDto.skills === 'string') {
                skillsArray = updateUserDto.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
            }
            user.skills = skillsArray;
            console.log('Updating user skills:', skillsArray);
        }
        
        const savedUser = await this.userRepository.save(user);
        console.log('User updated:', savedUser);
        return savedUser;
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }

    async toggleStatus(id: number) {
        const user = await this.findOne(id);
        user.status = user.status === 'active' ? 'inactive' : 'active';
        return await this.userRepository.save(user);
    }
}

