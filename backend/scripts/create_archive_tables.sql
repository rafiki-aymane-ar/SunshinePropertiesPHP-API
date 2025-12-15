-- Script de création des tables d'archivage
-- Tables: archived_clients et archived_properties

-- Table pour les clients archivés
CREATE TABLE IF NOT EXISTS archived_clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_id INT NOT NULL COMMENT 'ID original du client avant archivage',
    civility ENUM('M', 'Mme', 'Mlle') DEFAULT 'M',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    preferred_type VARCHAR(50),
    min_budget DECIMAL(12, 2),
    max_budget DECIMAL(12, 2),
    preferred_zones TEXT,
    specific_criteria TEXT,
    status VARCHAR(50) DEFAULT 'nouveau',
    acquisition_source VARCHAR(50) DEFAULT 'site_web',
    assigned_agent_id INT,
    created_at DATETIME,
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d\'archivage',
    archived_by INT COMMENT 'ID de l\'utilisateur qui a archivé',
    INDEX idx_original_id (original_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table pour les propriétés archivées
CREATE TABLE IF NOT EXISTS archived_properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_id INT NOT NULL COMMENT 'ID original de la propriété avant archivage',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) DEFAULT 'appartement',
    surface INT,
    rooms INT,
    address TEXT,
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disponible',
    created_by INT,
    created_at DATETIME,
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d\'archivage',
    archived_by INT COMMENT 'ID de l\'utilisateur qui a archivé',
    INDEX idx_original_id (original_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_city (city),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

