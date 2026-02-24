# 🧩 Sistema de Gerenciamento de Organizações (ONGs e Instituições do Terceiro Setor)

Plataforma digital voltada para o **terceiro setor**, com foco na **gestão eficiente e transparente de Organizações Não Governamentais (ONGs)** e instituições similares. Desenvolvido para facilitar a administração, promover a colaboração e maximizar o impacto social.

## 📌 Visão Geral

Este projeto tem como objetivo facilitar a administração de ONGs e organizações do terceiro setor, oferecendo ferramentas práticas para:

- Cadastro e gerenciamento de usuários, organizações, voluntários e habilidades
- Organização e gestão de eventos e tarefas
- Controle de acesso e autenticação segura
- Dashboard com estatísticas e relatórios
- Comunicação via email e notificações

Acreditamos que a tecnologia pode potencializar o impacto social e tornar a gestão das instituições do terceiro setor mais **eficiente**, **transparente** e **colaborativa**.

## 🔧 Funcionalidades Principais

### MVP Atual

- 🔐 **Autenticação e Controle de Acesso**: Login, registro, recuperação de senha com JWT
- 👥 **Gestão de Usuários**: Cadastro de administradores, voluntários e usuários
- 🏢 **Organizações**: Cadastro e gerenciamento de ONGs e instituições
- 📅 **Eventos**: Criação, edição e listagem de eventos
- ✅ **Tarefas**: Gerenciamento de tarefas relacionadas a eventos e organizações
- 🧑‍🤝‍🧑 **Voluntários**: Cadastro e gestão de voluntários, incluindo habilidades
- 📊 **Dashboard**: Visualização de estatísticas e métricas
- 📧 **Email**: Envio de notificações e comunicações
- 🏠 **Endereços**: Gerenciamento de endereços para organizações e eventos

### Recursos Técnicos

- API RESTful com NestJS
- Interface responsiva com React e Tailwind CSS
- Banco de dados SQL Server
- Containerização com Docker
- Autenticação JWT com guards e estratégias

## 🛠️ Tecnologias Utilizadas

- **Backend**:

  - Node.js / NestJS (Framework TypeScript)
  - TypeORM (ORM para banco de dados)
  - JWT (Autenticação)
  - Docker (Containerização)

- **Frontend**:

  - React (Biblioteca JavaScript)
  - TypeScript
  - Vite (Build tool)
  - Tailwind CSS (Estilização)
  - React Router (Roteamento)
  - Axios (Cliente HTTP)
  - Docker (Containerização)

- **Banco de Dados**:

  - SQL Server (MsSQL)

- **Outros**:
  - ESLint (Linting)
  - Prettier (Formatação de código)
  - Nginx (Servidor web para produção)

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- SQL Server (ou usar Docker para banco)

### Passos para Execução

1. **Clone o repositório**:

   ```bash
   git clone <url-do-repositorio>
   cd mba-full-10-grupo-03
   ```

2. **Backend**:

   ```bash
   cd backend
   npm install
   # Configure as variáveis de ambiente (ex: .env)
   npm run start:dev
   ```

3. **Frontend**:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Banco de Dados**:

   - Execute os scripts em `database/schema.sql` e `database/migrations/`
   - Ou use Docker Compose para subir o banco

5. **Com Docker**:
   - Backend: `docker build -t backend .` (na pasta backend)
   - Frontend: `docker build -t frontend .` (na pasta frontend)

### Variáveis de Ambiente

- Crie arquivos `.env` nas pastas `backend` e `frontend` com as configurações necessárias (ex: chaves JWT, URL do banco, etc.)

## 🤝 Contribuindo

Este projeto é desenvolvido por estudantes da Faculdade Impacta como parte de um projeto colaborativo.

**Equipe**:

- Anderson Teodoro
- Jonathan Cunha
- Marivaldo Lacerda
- Murilo Nascimento

Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT. Livre para uso e modificação.

Desenvolvido por estudantes da Faculdade Impacta como parte de um projeto colaborativo para o terceiro setor.

Vamos transformar o mundo juntos, um commit por vez. 💚
