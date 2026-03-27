-- ============================================================
--  ExpenseOS — MySQL Database Schema
--  Run this ONCE to seed categories after first boot
--  (Spring Boot auto-creates tables via ddl-auto=update)
-- ============================================================

CREATE DATABASE IF NOT EXISTS expenseos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expenseos_db;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50)  NOT NULL,
    icon  VARCHAR(10),
    color VARCHAR(7),
    type  ENUM('EXPENSE','INCOME','BOTH') NOT NULL
);

-- ── Expenses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount         DECIMAL(12,2) NOT NULL,
    description    VARCHAR(255)  NOT NULL,
    date           DATE          NOT NULL,
    category_id    BIGINT        NOT NULL,
    user_id        BIGINT        NOT NULL,
    payment_method VARCHAR(100),
    notes          VARCHAR(500),
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date)
);

-- ── Income ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount      DECIMAL(12,2) NOT NULL,
    description VARCHAR(255)  NOT NULL,
    date        DATE          NOT NULL,
    category_id BIGINT,
    user_id     BIGINT        NOT NULL,
    source      VARCHAR(100),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date)
);

-- ── Budgets ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id  BIGINT        NOT NULL,
    user_id      BIGINT        NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL,
    month        INT           NOT NULL,
    year         INT           NOT NULL,
    UNIQUE KEY uq_budget (user_id, category_id, month, year),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE
);

-- ── Seed Categories (skip if DataInitializer handles it) ─────
INSERT IGNORE INTO categories (name, icon, color, type) VALUES
  ('Food & Dining',  '🍔', '#FF6B35', 'EXPENSE'),
  ('Transport',      '🚗', '#7B61FF', 'EXPENSE'),
  ('Housing',        '🏠', '#00B4D8', 'EXPENSE'),
  ('Shopping',       '🛍️', '#FFD23F', 'EXPENSE'),
  ('Health',         '💊', '#00FFB2', 'EXPENSE'),
  ('Entertainment',  '🎬', '#FF4757', 'EXPENSE'),
  ('Education',      '📚', '#2ED573', 'EXPENSE'),
  ('Utilities',      '⚡', '#1E90FF', 'EXPENSE'),
  ('Others',         '📦', '#A8A8A8', 'EXPENSE'),
  ('Salary',         '💰', '#00FFB2', 'INCOME'),
  ('Freelance',      '💻', '#7B61FF', 'INCOME'),
  ('Investment',     '📈', '#FFD23F', 'INCOME'),
  ('Other Income',   '💵', '#FF6B35', 'INCOME');
