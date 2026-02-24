-- ======================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - GESTÃO DO BEM
-- Sistema de Gestão para ONGs e Organizações do Terceiro Setor
-- ======================================================================

-- Configurações iniciais
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ======================================================================
-- CRIAÇÃO DO BANCO DE DADOS
-- ======================================================================

CREATE DATABASE IF NOT EXISTS gestao_do_bem 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE gestao_do_bem;

-- ======================================================================
-- TABELA: users
-- Descrição: Armazena informações dos usuários do sistema (login)
-- ======================================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'coordinator', 'volunteer') DEFAULT 'volunteer',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ======================================================================
-- TABELA: volunteers
-- Descrição: Armazena informações detalhadas dos voluntários
-- ======================================================================

CREATE TABLE volunteers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'Coordenador', 'Voluntário', etc.
    skills TEXT, -- Armazenado como string separada por vírgulas
    actions_count INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_volunteers_email (email),
    INDEX idx_volunteers_status (status),
    INDEX idx_volunteers_role (role)
);

-- ======================================================================
-- TABELA: tasks
-- Descrição: Armazena informações das tarefas do sistema
-- ======================================================================

CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assignee_id INT,
    assignee_name VARCHAR(255) NOT NULL, -- Nome do voluntário responsável
    due_date DATE NOT NULL,
    priority ENUM('baixa', 'média', 'alta', 'urgente') DEFAULT 'média',
    status ENUM('todo', 'in-progress', 'done') DEFAULT 'todo',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (assignee_id) REFERENCES volunteers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_assignee (assignee_id),
    INDEX idx_tasks_priority (priority)
);

-- ======================================================================
-- TABELA: events
-- Descrição: Armazena informações dos eventos
-- ======================================================================

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL, -- Formato: "14h - 18h"
    location VARCHAR(255) NOT NULL,
    max_volunteers INT DEFAULT 10,
    confirmed_volunteers INT DEFAULT 0,
    status ENUM('planned', 'confirmed', 'cancelled', 'completed') DEFAULT 'planned',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_events_date (event_date),
    INDEX idx_events_status (status),
    INDEX idx_events_location (location)
);

-- ======================================================================
-- TABELA: event_volunteers
-- Descrição: Relação many-to-many entre eventos e voluntários
-- ======================================================================

CREATE TABLE event_volunteers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_volunteer (event_id, volunteer_id),
    INDEX idx_event_volunteers_event (event_id),
    INDEX idx_event_volunteers_volunteer (volunteer_id)
);

-- ======================================================================
-- TABELA: skills
-- Descrição: Catálogo de habilidades disponíveis
-- ======================================================================

CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- 'técnica', 'liderança', 'organização', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================================
-- TABELA: volunteer_skills
-- Descrição: Relação many-to-many entre voluntários e habilidades
-- ======================================================================

CREATE TABLE volunteer_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('básico', 'intermediário', 'avançado') DEFAULT 'básico',
    
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_volunteer_skill (volunteer_id, skill_id)
);

-- ======================================================================
-- TABELA: activity_log
-- Descrição: Log de atividades do sistema para auditoria
-- ======================================================================

CREATE TABLE activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'volunteer', 'task', 'event', etc.
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_log_user (user_id),
    INDEX idx_activity_log_entity (entity_type, entity_id),
    INDEX idx_activity_log_action (action),
    INDEX idx_activity_log_date (created_at)
);

-- ======================================================================
-- INSERÇÃO DE DADOS INICIAIS
-- ======================================================================

-- Inserir usuário administrador padrão
INSERT INTO users (email, password_hash, full_name, role, status) VALUES
('admin@gestaodobem.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador do Sistema', 'admin', 'active'),
('coord@gestaodobem.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Coordenador Geral', 'coordinator', 'active');

-- Inserir habilidades padrão
INSERT INTO skills (name, description, category) VALUES
('Liderança', 'Capacidade de liderar equipes e projetos', 'liderança'),
('Organização', 'Habilidade para organizar eventos e atividades', 'organização'),
('Design', 'Conhecimentos em design gráfico e visual', 'técnica'),
('Marketing', 'Experiência em marketing e comunicação', 'comunicação'),
('Fotografia', 'Habilidades em fotografia e documentação', 'técnica'),
('Culinária', 'Conhecimentos culinários para eventos', 'prática'),
('Primeiros Socorros', 'Conhecimentos básicos de primeiros socorros', 'saúde'),
('Tecnologia', 'Conhecimentos em tecnologia e informática', 'técnica'),
('Educação', 'Experiência em ensino e educação', 'educação'),
('Contabilidade', 'Conhecimentos financeiros e contábeis', 'administrativa');

-- Inserir voluntários de exemplo
INSERT INTO volunteers (user_id, name, email, phone, role, skills, actions_count, status) VALUES
(NULL, 'Ana Silva', 'ana@email.com', '11 999934-9990', 'Coordenadora', 'Liderança, Organização', 15, 'active'),
(NULL, 'João Santos', 'joao@email.com', '11 999934-9991', 'Voluntário', 'Design, Marketing', 12, 'active'),
(NULL, 'Maria Costa', 'maria@email.com', '11 999934-9992', 'Voluntário', 'Fotografia, Educação', 18, 'active'),
(NULL, 'Pedro Lima', 'pedro@email.com', '11 999934-9993', 'Coordenador', 'Tecnologia, Organização', 20, 'active'),
(NULL, 'Carla Oliveira', 'carla@email.com', '11 999934-9994', 'Voluntário', 'Culinária, Primeiros Socorros', 8, 'active');

-- Inserir tarefas de exemplo
INSERT INTO tasks (title, description, assignee_id, assignee_name, due_date, priority, status, created_by) VALUES
('Organizar doação de roupas', 'Separar e catalogar as roupas recebidas na campanha de inverno', 1, 'Ana Silva', '2025-11-23', 'média', 'todo', 1),
('Contratar fornecedores', 'Buscar parceiros para a próxima campanha de alimentos', 2, 'João Santos', '2025-11-23', 'alta', 'todo', 1),
('Preparar material promocional', 'Criar folhetos e banners para divulgação do próximo evento', 3, 'Maria Costa', '2025-11-25', 'média', 'in-progress', 1),
('Agendar reunião com equipe', 'Organizar encontro semanal da equipe de coordenação', 4, 'Pedro Lima', '2025-11-22', 'baixa', 'in-progress', 1),
('Relatório mensal', 'Compilar dados e resultados das atividades do mês', 1, 'Ana Silva', '2025-11-20', 'alta', 'done', 1),
('Treinamento de voluntários', 'Capacitar novos voluntários nas atividades da organização', 2, 'João Santos', '2025-11-18', 'média', 'done', 1);

-- Inserir eventos de exemplo
INSERT INTO events (title, description, event_date, event_time, location, max_volunteers, confirmed_volunteers, status, created_by) VALUES
('Arrecadação de Roupas', 'Campanha de inverno na Praça Central para arrecadação de roupas e agasalhos', '2025-11-30', '14h - 18h', 'Praça Central', 10, 5, 'confirmed', 1),
('Visita ao Abrigo', 'Atividade recreativa com as crianças do abrigo municipal', '2025-12-05', '14h - 17h', 'Abrigo Municipal', 8, 6, 'planned', 1),
('Reunião Mensal', 'Planejamento de ações para Janeiro 2026', '2025-12-15', '19h - 21h', 'Sede da ONG', 20, 12, 'confirmed', 1),
('Distribuição de Cestas Básicas', 'Entrega de cestas básicas para famílias carentes', '2025-12-20', '08h - 12h', 'Centro Comunitário', 15, 8, 'planned', 1);

-- Inserir relações evento-voluntário
INSERT INTO event_volunteers (event_id, volunteer_id, status) VALUES
(1, 1, 'confirmed'),
(1, 2, 'confirmed'),
(1, 3, 'confirmed'),
(1, 4, 'pending'),
(1, 5, 'confirmed'),
(2, 1, 'confirmed'),
(2, 3, 'confirmed'),
(2, 4, 'confirmed'),
(3, 1, 'confirmed'),
(3, 2, 'confirmed'),
(3, 4, 'confirmed'),
(3, 5, 'pending');

-- Inserir relações voluntário-habilidade
INSERT INTO volunteer_skills (volunteer_id, skill_id, proficiency_level) VALUES
(1, 1, 'avançado'), -- Ana - Liderança
(1, 2, 'avançado'), -- Ana - Organização
(2, 3, 'intermediário'), -- João - Design
(2, 4, 'intermediário'), -- João - Marketing
(3, 5, 'avançado'), -- Maria - Fotografia
(3, 9, 'intermediário'), -- Maria - Educação
(4, 8, 'avançado'), -- Pedro - Tecnologia
(4, 2, 'intermediário'), -- Pedro - Organização
(5, 6, 'avançado'), -- Carla - Culinária
(5, 7, 'básico'); -- Carla - Primeiros Socorros

-- ======================================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ======================================================================

-- View para estatísticas do dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM volunteers WHERE status = 'active') as total_volunteers,
    (SELECT COUNT(*) FROM tasks WHERE status != 'done') as pending_tasks,
    (SELECT COUNT(*) FROM events WHERE event_date >= CURDATE()) as upcoming_events,
    (SELECT COUNT(*) FROM tasks WHERE status = 'done' AND MONTH(completed_at) = MONTH(CURDATE())) as completed_tasks_this_month;

-- View para próximos eventos com voluntários
CREATE VIEW upcoming_events_with_volunteers AS
SELECT 
    e.id,
    e.title,
    e.event_date,
    e.event_time,
    e.location,
    e.max_volunteers,
    COUNT(ev.volunteer_id) as confirmed_volunteers,
    e.status
FROM events e
LEFT JOIN event_volunteers ev ON e.id = ev.event_id AND ev.status = 'confirmed'
WHERE e.event_date >= CURDATE()
GROUP BY e.id, e.title, e.event_date, e.event_time, e.location, e.max_volunteers, e.status
ORDER BY e.event_date ASC;

-- View para tarefas pendentes por voluntário
CREATE VIEW tasks_by_volunteer AS
SELECT 
    v.name as volunteer_name,
    COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_tasks,
    COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks,
    COUNT(*) as total_tasks
FROM volunteers v
LEFT JOIN tasks t ON v.id = t.assignee_id
WHERE v.status = 'active'
GROUP BY v.id, v.name;

-- ======================================================================
-- TRIGGERS PARA AUTOMAÇÃO
-- ======================================================================

-- Trigger para atualizar contador de ações dos voluntários
DELIMITER //
CREATE TRIGGER update_volunteer_actions 
AFTER UPDATE ON tasks 
FOR EACH ROW 
BEGIN
    IF OLD.status != 'done' AND NEW.status = 'done' THEN
        UPDATE volunteers 
        SET actions_count = actions_count + 1 
        WHERE id = NEW.assignee_id;
    END IF;
END//

-- Trigger para atualizar contador de voluntários confirmados nos eventos
CREATE TRIGGER update_confirmed_volunteers 
AFTER INSERT ON event_volunteers 
FOR EACH ROW 
BEGIN
    IF NEW.status = 'confirmed' THEN
        UPDATE events 
        SET confirmed_volunteers = (
            SELECT COUNT(*) 
            FROM event_volunteers 
            WHERE event_id = NEW.event_id AND status = 'confirmed'
        ) 
        WHERE id = NEW.event_id;
    END IF;
END//

CREATE TRIGGER update_confirmed_volunteers_on_change 
AFTER UPDATE ON event_volunteers 
FOR EACH ROW 
BEGIN
    UPDATE events 
    SET confirmed_volunteers = (
        SELECT COUNT(*) 
        FROM event_volunteers 
        WHERE event_id = NEW.event_id AND status = 'confirmed'
    ) 
    WHERE id = NEW.event_id;
END//

DELIMITER ;

-- ======================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ======================================================================

CREATE INDEX idx_tasks_due_date_status ON tasks(due_date, status);
CREATE INDEX idx_events_date_status ON events(event_date, status);
CREATE INDEX idx_volunteers_name ON volunteers(name);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- ======================================================================
-- COMENTÁRIOS FINAIS
-- ======================================================================

/*
Este script cria um banco de dados completo para o sistema "Gestão do Bem",
baseado na análise do frontend React/TypeScript.

Principais funcionalidades cobertas:
- Sistema de autenticação e autorização de usuários
- Gestão completa de voluntários com habilidades
- Sistema de tarefas com status e prioridades
- Gestão de eventos com inscrições de voluntários
- Log de atividades para auditoria
- Views para relatórios e dashboard
- Triggers para automação de contadores
- Dados de exemplo para testes

Para usar este script:
1. Execute em um servidor MySQL 5.7+ ou MariaDB 10.2+
2. Certifique-se de ter privilégios para criar banco de dados
3. Ajuste as senhas padrão antes de usar em produção
4. Configure adequadamente os índices conforme o uso

O banco está preparado para suportar todas as funcionalidades
presentes no frontend da aplicação.
*/