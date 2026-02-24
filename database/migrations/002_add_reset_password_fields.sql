-- ======================================================================
-- MIGRAÇÃO: Adicionar campos para reset de senha
-- Data: 07/01/2026
-- ======================================================================

USE gestaodobem;

-- Adicionar campos para funcionalidade de reset de senha
ALTER TABLE users 
ADD COLUMN reset_password_token VARCHAR(255) NULL AFTER skills,
ADD COLUMN reset_password_expires TIMESTAMP NULL AFTER reset_password_token;

-- Adicionar índice para melhorar performance na busca por token
CREATE INDEX idx_reset_password_token ON users(reset_password_token);

-- Verificar estrutura atualizada
DESCRIBE users;
