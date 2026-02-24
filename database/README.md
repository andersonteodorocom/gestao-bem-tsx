# Banco de Dados - Gestão do Bem

Este diretório contém o script de criação do banco de dados para o sistema "Gestão do Bem", um sistema de gestão para ONGs e organizações do terceiro setor.

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

1. **`users`** - Usuários do sistema (login/autenticação)
2. **`volunteers`** - Informações detalhadas dos voluntários
3. **`tasks`** - Tarefas do sistema com status e prioridades
4. **`events`** - Eventos e atividades da organização
5. **`skills`** - Catálogo de habilidades
6. **`volunteer_skills`** - Relação entre voluntários e suas habilidades
7. **`event_volunteers`** - Inscrições de voluntários em eventos
8. **`activity_log`** - Log de atividades para auditoria

### Views Úteis

- **`dashboard_stats`** - Estatísticas para o dashboard
- **`upcoming_events_with_volunteers`** - Próximos eventos com contagem de voluntários
- **`tasks_by_volunteer`** - Resumo de tarefas por voluntário

## 🚀 Como usar

### 1. Pré-requisitos

- MySQL 5.7+ ou MariaDB 10.2+
- Privilégios para criar banco de dados
- Cliente MySQL (phpMyAdmin, MySQL Workbench, ou linha de comando)

### 2. Instalação

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar o script
source /caminho/para/schema.sql
# ou
mysql -u root -p < schema.sql
```

### 3. Configuração Inicial

O script já inclui:
- ✅ Usuários padrão para teste
- ✅ Habilidades básicas pré-cadastradas
- ✅ Dados de exemplo (voluntários, tarefas, eventos)
- ✅ Relações entre entidades

### 4. Usuários Padrão

| Email | Senha | Papel | Uso |
|-------|-------|-------|-----|
| admin@gestaodobem.org | password | Admin | Administração geral |
| coord@gestaodobem.org | password | Coordenador | Coordenação de atividades |

> ⚠️ **Importante**: Altere as senhas padrão antes de usar em produção!

## 📊 Funcionalidades Cobertas

### Gestão de Voluntários
- Cadastro completo com informações pessoais
- Sistema de habilidades e competências
- Controle de status (ativo/inativo)
- Histórico de participações

### Sistema de Tarefas
- Criação e atribuição de tarefas
- Status: Todo, Em Progresso, Concluído
- Níveis de prioridade
- Datas de vencimento
- Histórico de alterações

### Gestão de Eventos
- Criação de eventos com data, hora e local
- Sistema de inscrições de voluntários
- Controle de capacidade máxima
- Status do evento (planejado, confirmado, etc.)

### Dashboard e Relatórios
- Estatísticas em tempo real
- Próximos eventos
- Tarefas pendentes
- Performance dos voluntários

## 🔧 Personalização

### Adicionando Novas Habilidades

```sql
INSERT INTO skills (name, description, category) VALUES
('Nova Habilidade', 'Descrição da habilidade', 'categoria');
```

### Criando Novos Usuários

```sql
INSERT INTO users (email, password_hash, full_name, role) VALUES
('usuario@email.com', '$2y$10$...', 'Nome Completo', 'volunteer');
```

### Adicionando Campos Personalizados

Para adicionar novos campos às tabelas existentes:

```sql
ALTER TABLE volunteers ADD COLUMN campo_personalizado VARCHAR(255);
```

## 📈 Performance e Otimização

### Índices Criados
- Emails de usuários e voluntários
- Status de tarefas e eventos
- Datas de vencimento e eventos
- Relações entre tabelas

### Triggers Automáticos
- **Contador de ações**: Atualiza automaticamente o número de tarefas concluídas por voluntário
- **Voluntários confirmados**: Mantém atualizada a contagem de voluntários por evento

## 🔒 Segurança

### Boas Práticas Implementadas
- ✅ Senhas hasheadas (bcrypt)
- ✅ Índices em campos sensíveis
- ✅ Chaves estrangeiras com constraints
- ✅ Log de atividades para auditoria
- ✅ Validação de dados via constraints

### Recomendações de Produção
1. Alterar senhas padrão
2. Configurar backup automático
3. Implementar SSL/TLS
4. Configurar firewall do banco
5. Monitorar logs de acesso

## 📝 Queries Úteis

### Estatísticas do Dashboard
```sql
SELECT * FROM dashboard_stats;
```

### Próximos Eventos
```sql
SELECT * FROM upcoming_events_with_volunteers 
WHERE event_date >= CURDATE() 
LIMIT 5;
```

### Tarefas Pendentes por Prioridade
```sql
SELECT priority, COUNT(*) as total 
FROM tasks 
WHERE status != 'done' 
GROUP BY priority;
```

### Voluntários Mais Ativos
```sql
SELECT name, actions_count, email 
FROM volunteers 
WHERE status = 'active' 
ORDER BY actions_count DESC 
LIMIT 10;
```

## 🛠️ Manutenção

### Limpeza de Logs
```sql
-- Manter apenas logs dos últimos 6 meses
DELETE FROM activity_log 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### Backup Recomendado
```bash
# Backup completo
mysqldump -u root -p gestao_do_bem > backup_$(date +%Y%m%d).sql

# Backup apenas estrutura
mysqldump -u root -p --no-data gestao_do_bem > estrutura.sql
```

## 📞 Suporte

Para dúvidas ou sugestões sobre o banco de dados:
1. Consulte a documentação do código frontend
2. Verifique os comentários no arquivo `schema.sql`
3. Analise as views e triggers criadas

---

**Desenvolvido para o Sistema Gestão do Bem**  
*Facilitando a gestão de ONGs e organizações do terceiro setor*