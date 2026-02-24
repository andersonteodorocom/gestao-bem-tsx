import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado. Por favor, faça login novamente.');
    }

    const hasPermission = requiredRoles.some((role) => user.role === role);
    
    if (!hasPermission) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Você não tem permissão para realizar esta ação.',
        detail: 'Esta funcionalidade é restrita a Coordenadores e Administradores. Entre em contato com o coordenador da sua organização para solicitar as permissões necessárias.',
        userRole: user.role,
        requiredRoles: requiredRoles
      });
    }

    return true;
  }
}
