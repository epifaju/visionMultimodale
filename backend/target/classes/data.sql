-- Script d'initialisation de la base de données
-- Ce script sera exécuté automatiquement par Spring Boot

-- Insérer un utilisateur admin par défaut
-- Mot de passe: admin123 (encodé avec BCrypt)
INSERT INTO users (username, email, password, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@vision-multimodale.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi',
    'Administrateur',
    'Système',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- Insérer un utilisateur de test
-- Mot de passe: user123 (encodé avec BCrypt)
INSERT INTO users (username, email, password, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    'user',
    'user@vision-multimodale.com',
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
    'Utilisateur',
    'Test',
    'USER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;
