-- Migration: Add event_id to tasks and create task_users table
-- Date: 2026-02-12

-- Add event_id column to tasks table
ALTER TABLE `tasks` ADD COLUMN `event_id` INT NULL AFTER `assignee_id`;
ALTER TABLE `tasks` ADD CONSTRAINT `fk_tasks_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE SET NULL;

-- Create task_users join table (N:N between tasks and users)
CREATE TABLE `task_users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `task_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_task_users_task` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_task_users_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_task_users_task` (`task_id`),
    INDEX `idx_task_users_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
