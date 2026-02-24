# Sistema de Controle de Acesso por Roles

## Implementação Completa ✅

Este documento descreve o sistema de controle de acesso baseado em roles (funções de usuário) implementado no projeto Gestão do Bem.

## 🎯 Objetivo

Implementar diferentes níveis de permissão para usuários com base em seus roles:

- **Voluntários**: podem apenas **visualizar** o painel (dashboard), eventos, tarefas e outros voluntários
- **Coordenadores e Administradores**: podem **criar, editar e excluir** eventos, tarefas e voluntários

## 📋 Roles Disponíveis

O sistema possui 4 tipos de roles definidos no enum `UserRole`:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  VOLUNTEER = 'volunteer',
  ORGANIZATION = 'organization'
}
```

## 🔒 Backend - Implementação

### 1. Decorator de Roles (`@Roles`)

**Arquivo**: `backend/src/auth/decorators/roles.decorator.ts`

Decorator customizado para marcar rotas com os roles permitidos:

```typescript
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### 2. Guard de Roles (`RolesGuard`)

**Arquivo**: `backend/src/auth/guards/roles.guard.ts`

Guard que verifica se o usuário tem um dos roles necessários para acessar a rota:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### 3. Rotas Protegidas

Todas as rotas de **criação**, **atualização** e **exclusão** foram protegidas:

#### Events Controller
- `POST /events` - Criar evento
- `PATCH /events/:id` - Atualizar evento
- `DELETE /events/:id` - Deletar evento

#### Tasks Controller
- `POST /tasks` - Criar tarefa
- `PATCH /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Deletar tarefa

#### Users Controller
- `POST /users` - Criar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `PATCH /users/:id/status` - Alterar status do usuário

**Exemplo de uso**:

```typescript
@Post()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COORDINATOR)
create(@Body() createEventDto: CreateEventDto, @Request() req) {
  // Apenas admin e coordinator podem criar eventos
}
```

### 4. JWT Strategy Atualizado

O JWT agora inclui o role do usuário no payload:

```typescript
async validate(payload: any) {
  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role, // ← Role incluído
    organizationId: payload.organizationId,
  };
}
```

## 🎨 Frontend - Implementação

### 1. Contexto de Autenticação

**Arquivo**: `frontend/src/contexts/AuthContext.tsx`

Context React que gerencia o estado de autenticação e fornece helpers para verificar permissões:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canEdit: () => boolean; // ← Helper principal
}
```

**Método `canEdit()`**: Retorna `true` se o usuário for admin ou coordinator.

### 2. Uso nas Páginas

Todas as páginas foram atualizadas para usar o hook `useAuth()`:

#### Volunteers Page
```typescript
const { canEdit } = useAuth();

// Botão "Novo Voluntário" só aparece para admin/coordinator
{canEdit() && (
  <Button onClick={() => setIsNewVolunteerModalOpen(true)}>
    Novo Voluntário
  </Button>
)}
```

#### Tasks Page
```typescript
const { canEdit } = useAuth();

// Botão "Nova Tarefa" só aparece para admin/coordinator
{canEdit() && (
  <Button onClick={() => setIsNewTaskModalOpen(true)}>
    Nova Tarefa
  </Button>
)}
```

#### Events Page
```typescript
const { canEdit } = useAuth();

// Botão "Novo Evento" só aparece para admin/coordinator
{canEdit() && (
  <Button onClick={() => setIsNewEventModalOpen(true)}>
    Novo Evento
  </Button>
)}
```

### 3. Cards Atualizados

Todos os cards (VolunteerCard, TaskCard, EventCard) recebem a prop `canEdit`:

```typescript
interface VolunteerCardProps {
  // ... outras props
  canEdit?: boolean;
}

// Botões de editar e excluir condicionados
{canEdit && onEdit && (
  <Button onClick={() => onEdit(volunteer)}>
    <Edit />
  </Button>
)}
```

## 🔐 Fluxo de Autorização

### Backend
1. Usuário faz login → recebe JWT com role incluído
2. Usuário faz requisição → JWT enviado no header Authorization
3. JwtAuthGuard valida o token → extrai dados do usuário
4. RolesGuard verifica se o role do usuário está permitido
5. Se autorizado → rota é executada
6. Se não autorizado → retorna 403 Forbidden

### Frontend
1. Login → token salvo e perfil carregado
2. AuthContext disponibiliza `canEdit()` para todas as páginas
3. Componentes verificam `canEdit()` antes de renderizar botões
4. Voluntários não veem botões de criar/editar/deletar
5. Admin e Coordinator veem todos os botões

## 📊 Matriz de Permissões

| Funcionalidade | Volunteer | Coordinator | Admin |
|----------------|-----------|-------------|-------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Voluntários | ✅ | ✅ | ✅ |
| Criar Voluntário | ❌ | ✅ | ✅ |
| Editar Voluntário | ❌ | ✅ | ✅ |
| Deletar Voluntário | ❌ | ✅ | ✅ |
| Ver Tarefas | ✅ | ✅ | ✅ |
| Criar Tarefa | ❌ | ✅ | ✅ |
| Editar Tarefa | ❌ | ✅ | ✅ |
| Deletar Tarefa | ❌ | ✅ | ✅ |
| Ver Eventos | ✅ | ✅ | ✅ |
| Criar Evento | ❌ | ✅ | ✅ |
| Editar Evento | ❌ | ✅ | ✅ |
| Deletar Evento | ❌ | ✅ | ✅ |
| Registrar em Evento | ✅ | ✅ | ✅ |

## 🧪 Testando o Sistema

### 1. Criar usuários com diferentes roles no banco de dados

```sql
-- Voluntário
INSERT INTO users (email, password_hash, full_name, role, organization_id, status)
VALUES ('voluntario@test.com', '$2b$10$...', 'João Voluntário', 'volunteer', 1, 'active');

-- Coordenador
INSERT INTO users (email, password_hash, full_name, role, organization_id, status)
VALUES ('coordenador@test.com', '$2b$10$...', 'Maria Coordenadora', 'coordinator', 1, 'active');

-- Admin
INSERT INTO users (email, password_hash, full_name, role, organization_id, status)
VALUES ('admin@test.com', '$2b$10$...', 'Carlos Admin', 'admin', 1, 'active');
```

### 2. Fazer login com cada tipo de usuário

### 3. Verificar o comportamento:

**Como Voluntário:**
- ✅ Deve ver todos os dados
- ❌ NÃO deve ver botões "Novo Voluntário", "Nova Tarefa", "Novo Evento"
- ❌ NÃO deve ver botões de editar/excluir nos cards

**Como Coordenador ou Admin:**
- ✅ Deve ver todos os dados
- ✅ Deve ver botões "Novo Voluntário", "Nova Tarefa", "Novo Evento"
- ✅ Deve ver botões de editar/excluir nos cards

## 🚀 Conclusão

O sistema de controle de acesso está **100% funcional** e implementado em:

✅ Backend - Guards e Decorators  
✅ Frontend - Context e Conditional Rendering  
✅ Todas as páginas principais (Volunteers, Tasks, Events)  
✅ Todos os componentes de card  
✅ Integração completa entre frontend e backend  

O projeto mantém sua funcionalidade original, mas agora com controle granular de permissões baseado em roles de usuário.
