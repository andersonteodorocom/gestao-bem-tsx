import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Anjos da Noite',
    description: 'Nome fantasia da nova organização',
  })
  organizationName: string;

  @ApiProperty({
    example: 'João da Silva',
    description:
      'Nome completo do primeiro usuário administrador da organização',
  })
  adminFullName: string;

  @ApiProperty({
    example: 'joao.silva@anjosdanoite.org',
    description: 'Email que será usado para o login do administrador',
  })
  adminEmail: string;

  @ApiProperty({
    example: 'S3nh@F0rt3!',
    description: 'Senha de acesso para o administrador',
    minLength: 6,
  })
  adminPassword: string;
}
