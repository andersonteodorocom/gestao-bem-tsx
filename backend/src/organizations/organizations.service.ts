import { Injectable, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Organization } from './entities/organization.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { RegisterOrganizationDto } from './dto/register-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private dataSource: DataSource) {}

  async register(dto: RegisterOrganizationDto): Promise<Organization> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const existingUser = await transactionalEntityManager.findOneBy(User, { email: dto.admin.email });
      if (existingUser) {
        throw new ConflictException('O email fornecido já está em uso.');
      }
      
      const newOrganization = transactionalEntityManager.create(Organization, {
        name: dto.organizationName,
        activityField: dto.activityField,
      });
      await transactionalEntityManager.save(newOrganization);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.admin.password, salt);

      const adminUser = transactionalEntityManager.create(User, {
        fullName: dto.admin.fullName,
        email: dto.admin.email,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        organizationId: newOrganization.id,
        status: 'active',
        actionsCount: 0,
      });
      await transactionalEntityManager.save(adminUser);

      return newOrganization;
    });
  }
}