import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { User } from 'src/users/entities/user.entity';
import { Address } from 'src/addresses/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Address])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
