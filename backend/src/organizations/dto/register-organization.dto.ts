import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';

class RegisterAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;
}

class RegisterAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

export class RegisterOrganizationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  activityField: string;

  @ApiProperty({ required: false }) 
  @IsOptional() 
  @ValidateNested()
  @Type(() => RegisterAddressDto)
  address?: RegisterAddressDto; 

  @ApiProperty()
  @ValidateNested()
  @Type(() => RegisterAdminDto)
  admin: RegisterAdminDto;
}
