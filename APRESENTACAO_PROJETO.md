# 📋 Gestão do Bem - Apresentação do Projeto

## 🎯 Visão Geral

**Gestão do Bem** é uma plataforma web para gestão de ONGs e organizações do terceiro setor, facilitando a administração de voluntários, eventos, tarefas e doações de forma centralizada e eficiente.

---

## ❓ Qual Problema Estamos Resolvendo?

### Desafios Reais do Terceiro Setor

1. **Gestão Descentralizada**
   - Planilhas espalhadas em diferentes computadores
   - Informações de voluntários desatualizadas ou perdidas
   - Dificuldade em organizar escalas e eventos

2. **Comunicação Ineficiente**
   - Voluntários não recebem informações sobre eventos
   - Falta de histórico sobre participações anteriores
   - Perda de tempo em tarefas administrativas

3. **Falta de Controle**
   - Sem visibilidade sobre tarefas em andamento
   - Dificuldade em acompanhar o engajamento dos voluntários
   - Impossível mensurar impacto das ações

4. **Barreira Tecnológica**
   - Soluções de mercado são caras ou complexas demais
   - ONGs pequenas ficam sem ferramentas adequadas

---

## 💡 Nossa Solução

Uma plataforma **simples**, **acessível** e **completa** que centraliza toda a gestão da ONG em um único lugar.

### Princípios do Projeto

- ✅ **Simplicidade** - Interface intuitiva, sem curva de aprendizado
- ✅ **Centralização** - Todas as informações em um só sistema
- ✅ **Acessibilidade** - Disponível via navegador, sem instalação
- ✅ **Segurança** - Controle de acesso e autenticação robusta
- ✅ **Rastreabilidade** - Histórico completo de todas as atividades

---

## 🚀 Funcionalidades Principais (MVP)

### 1. Gestão de Voluntários
- Cadastro completo com informações de contato
- Registro de habilidades e competências
- Histórico de participação em eventos
- Status de disponibilidade

### 2. Gerenciamento de Eventos
- Criação e edição de eventos/ações sociais
- Limite de vagas e inscrições
- Vinculação de voluntários
- Controle de data, horário e localização

### 3. Sistema de Tarefas
- Criação de tarefas com descrição detalhada
- Atribuição para voluntários específicos
- Níveis de prioridade (Baixa, Média, Alta)
- Status de acompanhamento (Pendente, Em Andamento, Concluída)

### 4. Dashboard Analítico
- Visão geral em tempo real
- Total de voluntários ativos
- Eventos próximos
- Tarefas pendentes
- Estatísticas de engajamento

### 5. Controle de Acesso
- Sistema de login seguro
- Diferentes níveis de permissão
- Recuperação de senha por e-mail
- Autenticação JWT

### 6. Gestão de Organizações
- Cadastro de múltiplas ONGs
- Informações institucionais
- Documentação e endereços
- Vinculação com usuários e voluntários

---

## 👥 Público-Alvo

### Primário
- **ONGs de pequeno e médio porte** (5 a 200 voluntários)
- **Projetos sociais comunitários**
- **Grupos de voluntariado organizados**

### Secundário
- **Grandes organizações do terceiro setor** (necessitam customização)
- **Empresas com programas de voluntariado corporativo**
- **Instituições religiosas com ações sociais**

---

## 🛠️ Arquitetura Técnica

### Backend
- **NestJS** (Node.js) - Framework estruturado e escalável
- **TypeORM** - Gerenciamento do banco de dados
- **JWT** - Autenticação segura
- **Nodemailer** - Sistema de envio de e-mails

### Frontend
- **React** - Biblioteca para interfaces dinâmicas
- **Vite** - Build tool moderna e rápida
- **Shadcn/UI** - Componentes de interface acessíveis
- **TanStack Query** - Gerenciamento de estado e cache

### Banco de Dados
- **MySQL** - Banco relacional com integridade referencial
- **Migrations** - Versionamento do schema
- **Views** - Consultas otimizadas para dashboard

### Infraestrutura
- **Docker** - Containerização para deploy facilitado
- **API REST** - Comunicação padronizada
- **Git** - Controle de versão

---

## 📊 Casos de Uso Práticos

### Cenário 1: Organização de Evento
1. Gestor cria evento "Distribuição de Alimentos - Sábado 25/01"
2. Define local, horário e 15 vagas
3. Voluntários se inscrevem pela plataforma
4. Sistema notifica quando atingir limite
5. No dia, gestor marca presença dos participantes
6. Histórico fica registrado no perfil de cada voluntário

### Cenário 2: Gestão de Tarefas
1. Coordenador cria tarefa "Organizar doações no estoque"
2. Atribui para voluntário específico
3. Define prioridade alta
4. Voluntário marca como "Em Andamento"
5. Ao concluir, muda status para "Concluída"
6. Dashboard atualiza em tempo real

### Cenário 3: Recuperação de Senha
1. Usuário esquece senha
2. Clica em "Esqueci minha senha"
3. Recebe e-mail com token de recuperação
4. Define nova senha
5. Sistema valida token e atualiza

---

## 🎯 Diferenciais

| Aspecto | Soluções Tradicionais | Gestão do Bem |
|---------|----------------------|---------------|
| **Custo** | Alto (R$ 200-500/mês) | Gratuito (open source) |
| **Complexidade** | Curva de aprendizado | Intuitivo e simples |
| **Customização** | Limitada | Código aberto |
| **Foco** | Genérico | Terceiro setor |
| **Deploy** | Dependência de fornecedor | Self-hosted possível |

---

## 🗓️ Próximos Passos

### Curto Prazo (1-3 meses)
- [ ] Sistema de doações financeiras com Pix
- [ ] Área do doador com histórico de contribuições
- [ ] Geração de certificados para voluntários
- [ ] Sistema de notificações por e-mail

### Médio Prazo (3-6 meses)
- [ ] Aplicativo mobile (iOS/Android)
- [ ] Chat interno para comunicação
- [ ] Relatórios e exportação de dados
- [ ] Integração com redes sociais

### Longo Prazo (6-12 meses)
- [ ] Módulo de captação de recursos
- [ ] Marketplace de projetos sociais
- [ ] IA para recomendação de tarefas
- [ ] API pública para integrações

---

## 📈 Métricas de Sucesso

### Indicadores de Impacto

1. **Eficiência Operacional**
   - Redução de 40% no tempo gasto com administração
   - Aumento de 60% na organização de eventos

2. **Engajamento**
   - Melhoria na retenção de voluntários
   - Maior frequência de participação em ações

3. **Transparência**
   - Histórico completo e auditável
   - Dados estruturados para relatórios

4. **Adoção**
   - Tempo de onboarding < 30 minutos
   - Taxa de uso ativa > 70%

---

## 👨‍💻 Equipe de Desenvolvimento

**Projeto desenvolvido por alunos do MBA em Engenharia de Software - Faculdade Impacta**

- **Anderson Teodoro** - Desenvolvedor Full Stack
- **Bruno Thobias** - Especialista Backend
- **Jonathan Cunha** - DevOps e Infraestrutura
- **Marina Silva** - UX/UI e Frontend
- **Marivaldo Lacerda** - Product Owner
- **Murilo Nascimento** - Análise de Dados

---

## 🌍 Impacto Social Esperado

Ao facilitar a gestão de ONGs, contribuímos indiretamente para:

- 🍽️ **Combate à fome** - ONGs de distribuição de alimentos
- 📚 **Educação** - Projetos de reforço escolar
- 🏥 **Saúde** - Campanhas de prevenção
- 🌱 **Meio Ambiente** - Ações de sustentabilidade
- 🤝 **Inclusão Social** - Projetos com populações vulneráveis

> "Cada hora economizada em gestão é uma hora a mais dedicada a quem precisa."

---

## 📝 Conclusão

**Gestão do Bem** não é apenas um software, é uma ferramenta de **transformação social**.

Ao simplificar a gestão operacional, permitimos que ONGs foquem no que realmente importa: **gerar impacto positivo na sociedade**.

### Por que este projeto é viável?

✅ **Problema real e validado** - ONGs sofrem com gestão manual  
✅ **Solução técnica comprovada** - MVP funcional implementado  
✅ **Equipe qualificada** - Profissionais com experiência  
✅ **Mercado amplo** - 820 mil organizações no Brasil  
✅ **Escalabilidade** - Arquitetura moderna e preparada para crescimento  

---

## 🔗 Links Úteis

- **Repositório**: [GitHub - terceiro-setor-opensource](https://github.com/terceiro-setor-opensource/mba-full-10-grupo-03)
- **Documentação**: Disponível no repositório
- **Demo**: [Em desenvolvimento]
- **Licença**: MIT (Open Source)

---

> *Desenvolvido com 💚 para o terceiro setor*
