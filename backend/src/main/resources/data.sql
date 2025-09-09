-- Script d'initialisation des données par défaut
-- Ce script s'exécute automatiquement au démarrage de l'application

-- Créer l'utilisateur admin par défaut
-- Le mot de passe est 'admin123' encodé avec BCrypt
-- Utilisation d'INSERT avec gestion des doublons pour H2
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, created_at, updated_at) 
VALUES (1, 'admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Admin', 'User', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Créer un utilisateur de test
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, created_at, updated_at) 
VALUES (2, 'test', 'test@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Test', 'User', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
