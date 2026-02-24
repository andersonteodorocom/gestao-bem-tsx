-- ======================================================================
-- CONSULTAS ÚTEIS - GESTÃO DO BEM
-- Queries prontas para uso com o sistema
-- ======================================================================

-- ======================================================================
-- 1. CONSULTAS PARA DASHBOARD
-- ======================================================================

-- Estatísticas gerais do sistema
SELECT 
    'Voluntários Ativos' as metrica,
    COUNT(*) as valor
FROM volunteers 
WHERE status = 'active'

UNION ALL

SELECT 
    'Tarefas Pendentes' as metrica,
    COUNT(*) as valor
FROM tasks 
WHERE status IN ('todo', 'in-progress')

UNION ALL

SELECT 
    'Eventos Futuros' as metrica,
    COUNT(*) as valor
FROM events 
WHERE event_date >= CURDATE()

UNION ALL

SELECT 
    'Tarefas Concluídas Este Mês' as metrica,
    COUNT(*) as valor
FROM tasks 
WHERE status = 'done' 
AND MONTH(completed_at) = MONTH(CURDATE())
AND YEAR(completed_at) = YEAR(CURDATE());

-- ======================================================================
-- 2. CONSULTAS PARA VOLUNTÁRIOS
-- ======================================================================

-- Listar todos os voluntários ativos com suas informações
SELECT 
    v.id,
    v.name,
    v.email,
    v.phone,
    v.role,
    v.skills,
    v.actions_count,
    COUNT(DISTINCT ev.event_id) as events_participated,
    COUNT(DISTINCT t.id) as tasks_assigned
FROM volunteers v
LEFT JOIN event_volunteers ev ON v.id = ev.volunteer_id AND ev.status = 'confirmed'
LEFT JOIN tasks t ON v.id = t.assignee_id
WHERE v.status = 'active'
GROUP BY v.id, v.name, v.email, v.phone, v.role, v.skills, v.actions_count
ORDER BY v.actions_count DESC;

-- Top 10 voluntários mais ativos
SELECT 
    name,
    email,
    role,
    actions_count,
    skills
FROM volunteers 
WHERE status = 'active'
ORDER BY actions_count DESC 
LIMIT 10;

-- Voluntários por habilidade específica
SELECT 
    v.name,
    v.email,
    v.phone,
    vs.proficiency_level,
    s.name as skill_name
FROM volunteers v
JOIN volunteer_skills vs ON v.id = vs.volunteer_id
JOIN skills s ON vs.skill_id = s.id
WHERE s.name = 'Liderança' -- Substituir pela habilidade desejada
AND v.status = 'active'
ORDER BY vs.proficiency_level DESC;

-- ======================================================================
-- 3. CONSULTAS PARA TAREFAS
-- ======================================================================

-- Tarefas por status com informações do responsável
SELECT 
    t.id,
    t.title,
    t.description,
    t.assignee_name,
    t.due_date,
    t.priority,
    t.status,
    v.email as assignee_email,
    DATEDIFF(t.due_date, CURDATE()) as days_until_due
FROM tasks t
LEFT JOIN volunteers v ON t.assignee_id = v.id
ORDER BY 
    CASE t.status 
        WHEN 'todo' THEN 1 
        WHEN 'in-progress' THEN 2 
        WHEN 'done' THEN 3 
    END,
    t.due_date ASC;

-- Tarefas atrasadas
SELECT 
    t.id,
    t.title,
    t.assignee_name,
    t.due_date,
    t.priority,
    DATEDIFF(CURDATE(), t.due_date) as days_overdue
FROM tasks t
WHERE t.due_date < CURDATE()
AND t.status != 'done'
ORDER BY days_overdue DESC;

-- Resumo de tarefas por voluntário
SELECT 
    v.name,
    COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo,
    COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed,
    COUNT(*) as total_tasks
FROM volunteers v
LEFT JOIN tasks t ON v.id = t.assignee_id
WHERE v.status = 'active'
GROUP BY v.id, v.name
HAVING total_tasks > 0
ORDER BY total_tasks DESC;

-- ======================================================================
-- 4. CONSULTAS PARA EVENTOS
-- ======================================================================

-- Próximos eventos com detalhes de participação
SELECT 
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.event_time,
    e.location,
    e.max_volunteers,
    COUNT(ev.volunteer_id) as confirmed_volunteers,
    (e.max_volunteers - COUNT(ev.volunteer_id)) as spots_available,
    e.status
FROM events e
LEFT JOIN event_volunteers ev ON e.id = ev.event_id AND ev.status = 'confirmed'
WHERE e.event_date >= CURDATE()
GROUP BY e.id, e.title, e.description, e.event_date, e.event_time, e.location, e.max_volunteers, e.status
ORDER BY e.event_date ASC;

-- Eventos com lista de voluntários confirmados
SELECT 
    e.title as evento,
    e.event_date,
    e.event_time,
    e.location,
    v.name as voluntario,
    v.email,
    v.phone,
    ev.registered_at
FROM events e
JOIN event_volunteers ev ON e.id = ev.event_id
JOIN volunteers v ON ev.volunteer_id = v.id
WHERE ev.status = 'confirmed'
AND e.event_date >= CURDATE()
ORDER BY e.event_date, e.title, v.name;

-- Histórico de eventos por voluntário
SELECT 
    v.name as voluntario,
    COUNT(*) as total_events,
    COUNT(CASE WHEN e.event_date >= CURDATE() THEN 1 END) as upcoming_events,
    COUNT(CASE WHEN e.event_date < CURDATE() THEN 1 END) as past_events
FROM volunteers v
JOIN event_volunteers ev ON v.id = ev.volunteer_id
JOIN events e ON ev.event_id = e.id
WHERE ev.status = 'confirmed'
GROUP BY v.id, v.name
ORDER BY total_events DESC;

-- ======================================================================
-- 5. CONSULTAS PARA RELATÓRIOS
-- ======================================================================

-- Relatório mensal de atividades
SELECT 
    MONTH(CURDATE()) as mes,
    YEAR(CURDATE()) as ano,
    COUNT(DISTINCT t.id) as tarefas_concluidas,
    COUNT(DISTINCT e.id) as eventos_realizados,
    COUNT(DISTINCT v.id) as voluntarios_ativos,
    SUM(ev_count.total) as total_participacoes
FROM 
    (SELECT 1 as dummy) d
LEFT JOIN tasks t ON MONTH(t.completed_at) = MONTH(CURDATE()) 
    AND YEAR(t.completed_at) = YEAR(CURDATE()) 
    AND t.status = 'done'
LEFT JOIN events e ON MONTH(e.event_date) = MONTH(CURDATE()) 
    AND YEAR(e.event_date) = YEAR(CURDATE())
    AND e.event_date < CURDATE()
LEFT JOIN volunteers v ON v.status = 'active'
LEFT JOIN (
    SELECT COUNT(*) as total 
    FROM event_volunteers ev 
    JOIN events e ON ev.event_id = e.id 
    WHERE MONTH(e.event_date) = MONTH(CURDATE()) 
    AND YEAR(e.event_date) = YEAR(CURDATE())
    AND ev.status = 'confirmed'
) ev_count ON 1=1;

-- Ranking de voluntários por período
SELECT 
    v.name,
    v.email,
    COUNT(DISTINCT t.id) as tarefas_concluidas,
    COUNT(DISTINCT ev.event_id) as eventos_participados,
    v.actions_count as total_acoes
FROM volunteers v
LEFT JOIN tasks t ON v.id = t.assignee_id 
    AND t.status = 'done' 
    AND t.completed_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
LEFT JOIN event_volunteers ev ON v.id = ev.volunteer_id 
    AND ev.status = 'confirmed'
LEFT JOIN events e ON ev.event_id = e.id 
    AND e.event_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
WHERE v.status = 'active'
GROUP BY v.id, v.name, v.email, v.actions_count
ORDER BY (tarefas_concluidas + eventos_participados) DESC;

-- ======================================================================
-- 6. CONSULTAS PARA HABILIDADES
-- ======================================================================

-- Habilidades mais procuradas (com mais voluntários)
SELECT 
    s.name as habilidade,
    s.category,
    COUNT(vs.volunteer_id) as total_voluntarios,
    COUNT(CASE WHEN vs.proficiency_level = 'avançado' THEN 1 END) as nivel_avancado,
    COUNT(CASE WHEN vs.proficiency_level = 'intermediário' THEN 1 END) as nivel_intermediario,
    COUNT(CASE WHEN vs.proficiency_level = 'básico' THEN 1 END) as nivel_basico
FROM skills s
LEFT JOIN volunteer_skills vs ON s.id = vs.skill_id
LEFT JOIN volunteers v ON vs.volunteer_id = v.id AND v.status = 'active'
GROUP BY s.id, s.name, s.category
ORDER BY total_voluntarios DESC;

-- Voluntários com múltiplas habilidades
SELECT 
    v.name,
    v.email,
    COUNT(vs.skill_id) as total_habilidades,
    GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') as habilidades
FROM volunteers v
JOIN volunteer_skills vs ON v.id = vs.volunteer_id
JOIN skills s ON vs.skill_id = s.id
WHERE v.status = 'active'
GROUP BY v.id, v.name, v.email
HAVING total_habilidades > 1
ORDER BY total_habilidades DESC;

-- ======================================================================
-- 7. CONSULTAS DE AUDITORIA
-- ======================================================================

-- Atividades recentes no sistema
SELECT 
    al.id,
    u.full_name as usuario,
    al.action as acao,
    al.entity_type as entidade,
    al.entity_id,
    al.description as descricao,
    al.created_at as data_hora
FROM activity_log al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Usuários mais ativos no sistema
SELECT 
    u.full_name as usuario,
    u.email,
    COUNT(*) as total_acoes,
    MAX(al.created_at) as ultima_atividade
FROM activity_log al
JOIN users u ON al.user_id = u.id
WHERE al.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY u.id, u.full_name, u.email
ORDER BY total_acoes DESC;

-- ======================================================================
-- 8. CONSULTAS DE MANUTENÇÃO
-- ======================================================================

-- Verificar integridade dos dados
SELECT 
    'Voluntários sem email' as problema,
    COUNT(*) as total
FROM volunteers 
WHERE email IS NULL OR email = ''

UNION ALL

SELECT 
    'Tarefas sem responsável' as problema,
    COUNT(*) as total
FROM tasks 
WHERE assignee_id IS NULL

UNION ALL

SELECT 
    'Eventos sem data' as problema,
    COUNT(*) as total
FROM events 
WHERE event_date IS NULL

UNION ALL

SELECT 
    'Usuários sem nome' as problema,
    COUNT(*) as total
FROM users 
WHERE full_name IS NULL OR full_name = '';

-- Limpeza de dados antigos (usar com cuidado!)
-- DELETE FROM activity_log WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

-- ======================================================================
-- 9. CONSULTAS PARA EXPORTAÇÃO
-- ======================================================================

-- Exportar lista completa de voluntários
SELECT 
    v.name as 'Nome',
    v.email as 'Email',
    v.phone as 'Telefone',
    v.role as 'Função',
    v.skills as 'Habilidades',
    v.actions_count as 'Ações Realizadas',
    v.status as 'Status',
    v.created_at as 'Data de Cadastro'
FROM volunteers v
ORDER BY v.name;

-- Exportar agenda de eventos
SELECT 
    e.title as 'Evento',
    e.description as 'Descrição',
    DATE_FORMAT(e.event_date, '%d/%m/%Y') as 'Data',
    e.event_time as 'Horário',
    e.location as 'Local',
    CONCAT(e.confirmed_volunteers, '/', e.max_volunteers) as 'Voluntários',
    e.status as 'Status'
FROM events e
WHERE e.event_date >= CURDATE()
ORDER BY e.event_date;

-- ======================================================================
-- 10. CONSULTAS PARA PERFORMANCE
-- ======================================================================

-- Análise de performance das tabelas
SELECT 
    table_name as 'Tabela',
    table_rows as 'Linhas',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Tamanho (MB)'
FROM information_schema.tables 
WHERE table_schema = 'gestao_do_bem'
ORDER BY (data_length + index_length) DESC;

-- Índices utilizados
SHOW INDEX FROM volunteers;
SHOW INDEX FROM tasks;
SHOW INDEX FROM events;

-- ======================================================================
-- NOTAS DE USO:
-- 
-- 1. Substitua valores específicos (como nomes de habilidades) conforme necessário
-- 2. Ajuste os períodos de data nas consultas conforme sua necessidade
-- 3. Use LIMIT nas consultas que podem retornar muitos resultados
-- 4. Sempre teste consultas de DELETE/UPDATE em ambiente de desenvolvimento primeiro
-- 5. Para relatórios grandes, considere usar paginação
-- ======================================================================