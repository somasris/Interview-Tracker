-- ============================================================
-- Dynamic Interview Tracker - Full MySQL Schema
-- Engine: InnoDB | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS interview_tracker_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE interview_tracker_db;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: stage_templates  (predefined workflow templates)
-- ============================================================
CREATE TABLE IF NOT EXISTS stage_templates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: template_stages  (stages belonging to a template)
-- ============================================================
CREATE TABLE IF NOT EXISTS template_stages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id INT UNSIGNED NOT NULL,
  stage_name  VARCHAR(100) NOT NULL,
  stage_order INT          NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES stage_templates(id) ON DELETE CASCADE,
  INDEX idx_template_stages_template (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED  NOT NULL,
  company_name     VARCHAR(200)  NOT NULL,
  job_title        VARCHAR(200)  NOT NULL,
  location         VARCHAR(200),
  application_date DATE          NOT NULL,
  salary_min       DECIMAL(12,2),
  salary_max       DECIMAL(12,2),
  job_link         VARCHAR(500),
  notes            TEXT,
  final_result     ENUM('pending','offer','rejected') NOT NULL DEFAULT 'pending',
  current_stage_id INT UNSIGNED  NULL,           -- updated after stages are created
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- current_stage_id FK added after stages table exists (see below)
  INDEX idx_applications_user      (user_id),
  INDEX idx_applications_result    (final_result),
  INDEX idx_applications_date      (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: stages  (dynamic interview stages per application)
-- ============================================================
CREATE TABLE IF NOT EXISTS stages (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id INT UNSIGNED  NOT NULL,
  stage_name     VARCHAR(100)  NOT NULL,
  stage_order    INT           NOT NULL DEFAULT 1,
  is_completed   TINYINT(1)    NOT NULL DEFAULT 0,
  completed_at   TIMESTAMP     NULL,
  feedback_notes TEXT,
  result         ENUM('pending','pass','fail') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_stages_application (application_id),
  INDEX idx_stages_order       (application_id, stage_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK for current_stage_id now that stages table exists
ALTER TABLE applications
  ADD CONSTRAINT fk_applications_current_stage
    FOREIGN KEY (current_stage_id) REFERENCES stages(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE: reminders  (optional bonus)
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id INT UNSIGNED  NOT NULL,
  reminder_date  DATETIME      NOT NULL,
  message        VARCHAR(500),
  is_sent        TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_reminders_application (application_id),
  INDEX idx_reminders_date        (reminder_date, is_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED: Stage Templates
-- ============================================================
INSERT INTO stage_templates (name, description) VALUES
  ('Software Engineer', 'Typical pipeline for software engineering roles'),
  ('Product Manager', 'Standard PM interview process'),
  ('Data Scientist', 'Data science hiring pipeline'),
  ('General / Non-Tech', 'Generic interview flow'),
  ('Internship', 'Short-cycle internship process');

-- Software Engineer stages
INSERT INTO template_stages (template_id, stage_name, stage_order) VALUES
  (1, 'Application Submitted', 1),
  (1, 'Resume Screening',      2),
  (1, 'HR Phone Screen',       3),
  (1, 'Technical Phone Screen',4),
  (1, 'Take-Home Assignment',  5),
  (1, 'Onsite / Virtual Loop', 6),
  (1, 'Final Decision',        7);

-- Product Manager stages
INSERT INTO template_stages (template_id, stage_name, stage_order) VALUES
  (2, 'Application Submitted', 1),
  (2, 'Resume Screening',      2),
  (2, 'HR Phone Screen',       3),
  (2, 'Case Study Round',      4),
  (2, 'Panel Interview',       5),
  (2, 'Executive Round',       6),
  (2, 'Final Decision',        7);

-- Data Scientist stages
INSERT INTO template_stages (template_id, stage_name, stage_order) VALUES
  (3, 'Application Submitted', 1),
  (3, 'Resume Review',         2),
  (3, 'Recruiter Call',        3),
  (3, 'Technical Assessment',  4),
  (3, 'Data Challenge',        5),
  (3, 'Technical Interview',   6),
  (3, 'Final Decision',        7);

-- General stages
INSERT INTO template_stages (template_id, stage_name, stage_order) VALUES
  (4, 'Application Submitted', 1),
  (4, 'Phone Screen',          2),
  (4, 'First Interview',       3),
  (4, 'Second Interview',      4),
  (4, 'Final Decision',        5);

-- Internship stages
INSERT INTO template_stages (template_id, stage_name, stage_order) VALUES
  (5, 'Application Submitted', 1),
  (5, 'Online Assessment',     2),
  (5, 'Phone Interview',       3),
  (5, 'Final Decision',        4);

-- ============================================================
-- SAMPLE DATA (optional – useful for testing)
-- ============================================================
-- Insert a demo user (password: "password123" hashed with bcrypt rounds=10)
-- Hash generated offline: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh9y
INSERT INTO users (name, email, password_hash) VALUES
  ('Demo User', 'demo@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh9y');
