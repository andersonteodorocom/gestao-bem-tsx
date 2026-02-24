import { Controller, Post, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('register')
  @ApiOperation({
    summary:
      'Registra uma nova organização, seu endereço e seu primeiro usuário administrador',
  })
  @ApiResponse({ status: 201, description: 'Cadastro realizado com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'O email fornecido já está em uso.',
  })
  register(@Body() registerDto: RegisterOrganizationDto) {
    return this.organizationsService.register(registerDto);
  }
}
