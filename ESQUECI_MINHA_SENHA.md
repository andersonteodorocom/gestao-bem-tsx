# Funcionalidade: Esqueci Minha Senha (Reset de Senha)

## ✨ Implementação Completa

Sistema de recuperação de senha com token seguro e expiração temporária.

## 🎯 Fluxo de Funcionamento

### 1. Usuário esquece a senha

1. Clica em **"Esqueceu a senha?"** na tela de login
2. Modal abre solicitando o email
3. Digite o email e clica em **"Enviar"**

### 2. Backend processa a solicitação

1. Verifica se o email existe no banco
2. Gera token único e seguro (32 bytes aleatórios)
3. Hash do token é salvo no banco com validade de 1 hora
4. **Em desenvolvimento**: Token é exibido no console do backend
5. **Em produção**: Email seria enviado com o link

### 3. Usuário acessa o link de reset

1. Clica no link (ou copia do console em dev)
2. Página de redefinição abre com o token na URL
3. Digite a nova senha (mínimo 6 caracteres)
4. Confirme a senha
5. Clique em **"Redefinir Senha"**

### 4. Backend valida e atualiza

1. Verifica se o token é válido e não expirou
2. Atualiza a senha do usuário
3. Remove o token do banco
4. Redireciona para login com mensagem de sucesso

## 🔧 Backend

### Novos Campos na Entidade User

```typescript
@Column({ name: 'reset_password_token', nullable: true })
resetPasswordToken: string;

@Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
resetPasswordExpires: Date;
```

### DTOs Criados

**ForgotPasswordDto**
```typescript
{
  email: string; // Email do usuário
}
```

**ResetPasswordDto**
```typescript
{
  token: string;      // Token recebido no link
  newPassword: string; // Nova senha (mínimo 6 caracteres)
}
```

### Rotas Criadas

#### POST /auth/forgot-password

Solicita reset de senha.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (Dev):**
```json
{
  "message": "Se o email existir em nossa base, você receberá instruções...",
  "token": "abc123def456..." // APENAS EM DESENVOLVIMENTO
}
```

**Comportamento:**
- Por segurança, sempre retorna sucesso mesmo se o email não existir
- Token é logado no console do backend:

```
=================================
🔑 TOKEN DE RESET DE SENHA
=================================
Email: usuario@email.com
Token: a1b2c3d4e5f6...
Link: http://localhost:8080/reset-password?token=a1b2c3d4e5f6...
Expira em: 07/01/2026 14:30:45
=================================
```

#### POST /auth/reset-password

Redefine a senha usando o token.

**Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "NovaSenha123!"
}
```

**Response:**
```json
{
  "message": "Senha redefinida com sucesso! Você já pode fazer login..."
}
```

**Erros possíveis:**
- `400 Bad Request`: Token inválido ou expirado
- `400 Bad Request`: Senha deve ter no mínimo 6 caracteres

### Segurança Implementada

1. **Token Aleatório**: 32 bytes de dados criptograficamente seguros
2. **Hash no Banco**: Token é hasheado com SHA-256 antes de salvar
3. **Expiração**: Token válido por apenas 1 hora
4. **Uso Único**: Token é removido após uso bem-sucedido
5. **Validação**: Verifica se token existe, é válido e não expirou

## 🎨 Frontend

### Modal: ForgotPasswordModal

**Arquivo**: `frontend/src/components/modals/ForgotPasswordModal.tsx`

Modal que abre ao clicar em "Esqueceu a senha?" no login.

**Funcionalidades:**
- Campo de email com validação
- Loading state durante requisição
- Mensagem de sucesso
- **Em dev**: Link direto para redefinir senha

**Props:**
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### Página: ResetPassword

**Arquivo**: `frontend/src/pages/ResetPassword.tsx`  
**Rota**: `/reset-password?token=abc123...`

Página completa para redefinir a senha.

**Funcionalidades:**
- Extrai token da URL automaticamente
- Campo de nova senha com validação (min 6 caracteres)
- Campo de confirmação de senha
- Toggle para mostrar/ocultar senha
- Validação de senhas idênticas
- Loading state
- Redirecionamento automático para login após sucesso

### Integração no Login

```typescript
const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

// Botão que abre o modal
<Button onClick={() => setIsForgotPasswordOpen(true)}>
  Esqueceu a senha?
</Button>

// Modal renderizado
<ForgotPasswordModal 
  open={isForgotPasswordOpen}
  onOpenChange={setIsForgotPasswordOpen}
/>
```

## 🗄️ Banco de Dados

### Migração SQL

**Arquivo**: `database/migrations/002_add_reset_password_fields.sql`

```sql
ALTER TABLE users 
ADD COLUMN reset_password_token VARCHAR(255) NULL,
ADD COLUMN reset_password_expires TIMESTAMP NULL;

CREATE INDEX idx_reset_password_token ON users(reset_password_token);
```

**Para executar a migração:**

```bash
# Via MySQL client (se disponível)
mysql -h 108.181.92.76 -P 3306 -u grupo03 -p gestaodobem < database/migrations/002_add_reset_password_fields.sql

# Ou via ferramenta de banco de dados
# Execute o conteúdo do arquivo SQL manualmente
```

## 📱 Como Testar

### 1. Preparação

Certifique-se que o backend e frontend estão rodando:
- Backend: http://localhost:3000
- Frontend: http://localhost:8080

### 2. Solicitar Reset

1. Acesse http://localhost:8080/login
2. Clique em **"Esqueceu a senha?"**
3. Digite um email cadastrado (ex: contato@andersonteodoro.com)
4. Clique em **"Enviar"**
5. Modal mostra sucesso com link de desenvolvimento

### 3. Redefinir Senha (Desenvolvimento)

**Opção A - Usar link do modal:**
1. Clique no link azul no modal
2. Você será redirecionado para `/reset-password?token=...`

**Opção B - Pegar do console do backend:**
1. Olhe o console do backend (terminal onde rodou `npm run start:dev`)
2. Copie o link completo ou apenas o token
3. Acesse: `http://localhost:8080/reset-password?token=SEU_TOKEN`

### 4. Definir Nova Senha

1. Digite a nova senha (mínimo 6 caracteres)
2. Confirme a senha
3. Clique em **"Redefinir Senha"**
4. Aguarde o sucesso e redirecionamento automático
5. Faça login com a nova senha

### 5. Testar Expiração

1. Solicite um reset de senha
2. Aguarde mais de 1 hora
3. Tente usar o token
4. Deve receber erro: "Token inválido ou expirado"

## 🚀 Preparação para Produção

### Remover Token da Response

Em `auth.service.ts`, remova esta linha:

```typescript
return {
  message: '...',
  token: resetToken // ← REMOVER ESTA LINHA!
};
```

### Configurar Envio de Email

Instale um serviço de email (ex: Nodemailer):

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

No `auth.service.ts`, substitua o console.log por:

```typescript
// Enviar email
await this.emailService.sendPasswordResetEmail(
  user.email,
  user.fullName,
  `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
);
```

### Variáveis de Ambiente

Adicione ao `.env`:

```env
FRONTEND_URL=https://seu-dominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

## ✅ Segurança Checklist

- ✅ Token aleatório e único
- ✅ Token hasheado no banco
- ✅ Expiração de 1 hora
- ✅ Token de uso único (removido após uso)
- ✅ Validação de senha forte (min 6 caracteres)
- ✅ Confirmação de senha
- ✅ Não revela se email existe (anti-enumeração)
- ✅ HTTPS recomendado em produção
- ✅ Rate limiting recomendado em produção

## 📊 Estados do Token

| Estado | Descrição |
|--------|-----------|
| Criado | Token gerado e salvo no banco |
| Válido | Token existe e não expirou (< 1h) |
| Expirado | Token passou de 1 hora desde criação |
| Usado | Token foi usado para reset e removido |
| Inválido | Token não existe no banco |

## 🎉 Conclusão

Funcionalidade completa de recuperação de senha implementada com:

✅ Backend seguro com tokens hash e expiração  
✅ Frontend amigável com modal e página dedicada  
✅ Migração SQL para novos campos  
✅ Validações e tratamento de erros  
✅ UX fluida com redirecionamentos automáticos  
✅ Modo desenvolvimento com token visível  
✅ Preparado para produção (email)  

Sistema pronto para uso! 🚀
