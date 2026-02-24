# Melhorias nas Mensagens de Erro - Controle de Acesso

## 🎯 Objetivo

Melhorar a experiência do usuário ao tentar realizar ações sem permissão, substituindo mensagens genéricas por mensagens claras e amigáveis.

## ✨ Implementações

### Backend

#### RolesGuard Aprimorado
**Arquivo**: `backend/src/auth/guards/roles.guard.ts`

O guard agora lança exceções `ForbiddenException` com mensagens personalizadas:

```typescript
if (!hasPermission) {
  throw new ForbiddenException({
    statusCode: 403,
    message: 'Você não tem permissão para realizar esta ação.',
    detail: 'Esta funcionalidade é restrita a Coordenadores e Administradores. Entre em contato com o coordenador da sua organização para solicitar as permissões necessárias.',
    userRole: user.role,
    requiredRoles: requiredRoles
  });
}
```

**Mensagens retornadas:**
- ✅ Usuário não autenticado → "Usuário não autenticado. Por favor, faça login novamente."
- ✅ Sem permissão → Mensagem detalhada orientando o usuário a contatar o coordenador

### Frontend

#### 1. Handler de Erros Centralizado
**Arquivo**: `frontend/src/lib/error-handler.ts`

Criado módulo utilitário para tratamento consistente de erros:

```typescript
export const handleApiError = (error: any, defaultMessage: string) => {
  if (error.statusCode === 403) {
    toast.error("Acesso Negado", {
      description: "Você não tem permissão... Entre em contato com o coordenador...",
      duration: 6000,
    });
  }
  // ... outros tratamentos
}
```

**Funções disponíveis:**
- `handleApiError(error, defaultMessage)` - Trata erros de API
- `showSuccessMessage(title, description)` - Exibe mensagem de sucesso
- `showPermissionDeniedMessage()` - Mensagem específica de permissão negada

#### 2. ApiClient Aprimorado
**Arquivo**: `frontend/src/services/api.ts`

O `handleResponse` agora trata especificamente erros 403:

```typescript
if (response.status === 403) {
  const error = await response.json().catch(() => ({ 
    message: 'Acesso negado',
    detail: 'Você não tem permissão para realizar esta ação.' 
  }));
  
  const errorMessage = error.detail || error.message;
  const detailedError = new Error(errorMessage);
  (detailedError as any).statusCode = 403;
  (detailedError as any).detail = error.detail;
  throw detailedError;
}
```

#### 3. Páginas Atualizadas

Todas as páginas principais agora usam o tratamento de erro:

**Volunteers.tsx**
```typescript
import { handleApiError } from "@/lib/error-handler";

try {
  await usersService.toggleStatus(volunteerId);
  // ...
} catch (error: any) {
  handleApiError(error, "Falha ao alterar status do voluntário");
}
```

**Tasks.tsx**
- Erro ao atualizar status (drag & drop)
- Erro ao avançar tarefa
- Erro ao deletar tarefa

**Events.tsx**
- Erro ao deletar evento

## 📱 Experiência do Usuário

### Antes
```
❌ Forbidden
❌ 403 Error
❌ Access Denied
```

### Depois

Quando um **voluntário** tenta criar/editar/deletar algo:

```
🚫 Acesso Negado

Você não tem permissão para realizar esta ação.

Esta funcionalidade é restrita a Coordenadores e 
Administradores. Entre em contato com o coordenador 
da sua organização para solicitar as permissões 
necessárias.

[Fechar - 6 segundos]
```

## 🎨 Componentes de UI

O sistema usa **Sonner** (toast library) que já estava integrado no projeto:

- ✅ Toast de erro (vermelho) para permissões negadas
- ✅ Toast de sucesso (verde) para ações bem-sucedidas
- ✅ Duração configurável (6s para erros de permissão, 3-4s para outros)
- ✅ Design consistente com shadcn/ui

## 🔄 Fluxo Completo

1. **Voluntário** tenta deletar uma tarefa
2. Frontend envia requisição DELETE para `/tasks/:id`
3. Backend valida JWT → usuário autenticado ✅
4. RolesGuard verifica role → voluntário ❌
5. Backend retorna 403 com mensagem personalizada
6. ApiClient captura erro 403
7. `handleApiError` exibe toast amigável
8. UI mantém estado anterior (tarefa não é removida)

## 🧪 Testando

### Como Voluntário:
1. Faça login com um usuário voluntário
2. Tente criar um novo evento → Toast de erro aparece
3. Tente editar uma tarefa → Toast de erro aparece
4. Tente deletar um voluntário → Toast de erro aparece

### Como Coordenador/Admin:
1. Faça login com coordenador ou admin
2. Crie, edite e delete normalmente → Funciona sem erros

## 📊 Mensagens por Contexto

| Ação | Erro Genérico (Antes) | Mensagem Amigável (Depois) |
|------|----------------------|----------------------------|
| Criar Voluntário | Forbidden | "Você não tem permissão... Entre em contato com o coordenador..." |
| Editar Tarefa | 403 Error | "Você não tem permissão... Esta funcionalidade é restrita a..." |
| Deletar Evento | Access Denied | "Você não tem permissão... Entre em contato com o coordenador..." |
| Alterar Status | Failed | "Falha ao alterar status do voluntário" + mensagem de permissão |

## ✅ Conclusão

Sistema de mensagens de erro implementado com sucesso:

✅ Backend retorna mensagens claras e descritivas  
✅ Frontend exibe toasts amigáveis e informativos  
✅ Usuários sabem exatamente o que fazer (contatar coordenador)  
✅ Tratamento consistente em todas as páginas  
✅ Duração adequada para leitura da mensagem (6s)  
✅ Design integrado com o sistema existente  

A experiência do usuário foi significativamente melhorada, eliminando mensagens técnicas e confusas! 🎉
