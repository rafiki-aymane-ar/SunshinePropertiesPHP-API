-- ======================================================================
-- Sunshine Properties - Script complet de base de données
-- Base de données : sunshine_agency
-- Ce fichier a été généré à partir du code PHP du projet.
-- Il permet à votre professeur de recréer la base pour tester l'API.
-- ======================================================================

-- 1. Création de la base
CREATE DATABASE IF NOT EXISTS sunshine_agency
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sunshine_agency;

-- ======================================================================
-- 2. Table des utilisateurs
-- ======================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(191) NULL,
    full_name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    password VARCHAR(255) NULL,
    role ENUM('admin','agent','client') NOT NULL DEFAULT 'agent',
    photo_url VARCHAR(255) NULL,
    provider VARCHAR(50) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer un admin par défaut si nécessaire
INSERT INTO users (full_name, email, phone, password, role, is_active)
SELECT 'Admin Démo', 'admin@sunshine.local', '0102030405',
       '$2y$10$abcdefghijklmnopqrstuv/abcdefghijklmnopqrstuv123456', -- mot de passe factice
       'admin', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

-- ======================================================================
-- 3. Table des clients
-- ======================================================================
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    civility ENUM('M','Mme','Mlle') DEFAULT 'M',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    preferred_type ENUM('appartement','maison','villa','bureau','terrain') NULL,
    min_budget DECIMAL(12,2) NULL,
    max_budget DECIMAL(12,2) NULL,
    preferred_zones TEXT NULL,
    specific_criteria TEXT NULL,
    status ENUM('nouveau','a_qualifier','actif','en_negociation','client','inactif') DEFAULT 'nouveau',
    acquisition_source ENUM('site_web','recommandation','reseau_social','annonce','salon','autre') DEFAULT 'site_web',
    assigned_agent_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_client (email),
    INDEX idx_status_client (status),
    INDEX idx_agent_client (assigned_agent_id),
    CONSTRAINT fk_clients_assigned_agent
        FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 4. Table des propriétés
-- ======================================================================
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DECIMAL(12,2) NOT NULL,
    type ENUM('appartement','maison','villa','bureau','terrain') DEFAULT 'appartement',
    surface INT NULL,
    rooms INT NULL,
    address TEXT NULL,
    city VARCHAR(100) NOT NULL,
    status ENUM('disponible','reserve','vendu') DEFAULT 'disponible',
    created_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_price (price),
    CONSTRAINT fk_properties_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 5. Table des rendez-vous (appointments)
-- ======================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    client_id INT NOT NULL,
    agent_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    meeting_point VARCHAR(255) NULL,
    notes TEXT NULL,
    status ENUM('scheduled','done','cancelled') DEFAULT 'scheduled',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_status (status),
    CONSTRAINT fk_appointments_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_appointments_client
        FOREIGN KEY (client_id) REFERENCES clients(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_appointments_agent
        FOREIGN KEY (agent_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 6. Tables d'archivage (déjà fournies dans create_archive_tables.sql)
--    Reprises ici pour avoir un script complet
-- ======================================================================
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
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d''archivage',
    archived_by INT COMMENT 'ID de l''utilisateur qui a archivé',
    INDEX idx_original_id (original_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d''archivage',
    archived_by INT COMMENT 'ID de l''utilisateur qui a archivé',
    INDEX idx_original_id (original_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_city (city),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 7. Messagerie : messages, conversations, typing_status
-- ======================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant1_type ENUM('user','client') NOT NULL,
    participant1_id INT NOT NULL,
    participant2_type ENUM('user','client') NOT NULL,
    participant2_id INT NOT NULL,
    last_message_id INT NULL,
    last_message_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_conversation (participant1_type, participant1_id, participant2_type, participant2_id),
    INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_type ENUM('user','client') NOT NULL,
    sender_id INT NOT NULL,
    receiver_type ENUM('user','client') NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255) NULL,
    content TEXT NOT NULL,
    property_id INT NULL,
    appointment_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_receiver (receiver_type, receiver_id, created_at),
    INDEX idx_sender (sender_type, sender_id, created_at),
    CONSTRAINT fk_messages_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_messages_appointment
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS typing_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_type VARCHAR(20) NOT NULL,
    sender_id INT NOT NULL,
    receiver_type VARCHAR(20) NOT NULL,
    receiver_id INT NOT NULL,
    is_typing BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_typing (sender_type, sender_id, receiver_type, receiver_id),
    INDEX idx_receiver (receiver_type, receiver_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 8. Interactions / activités & mandats (résumé minimal à partir du code)
-- ======================================================================
CREATE TABLE IF NOT EXISTS interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NULL,
    property_id INT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_interactions_client (client_id),
    INDEX idx_interactions_property (property_id),
    CONSTRAINT fk_interactions_client
        FOREIGN KEY (client_id) REFERENCES clients(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_interactions_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mandates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mandates_property (property_id),
    CONSTRAINT fk_mandates_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 9. Données de test (optionnel) : propriétés de démo
--    Pour charger ces données, exécuter aussi insert_sample_properties.sql
-- ======================================================================
-- Vous pouvez exécuter ensuite :
--   SOURCE backend/scripts/insert_sample_properties.sql;


