package com.vision.app.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Service d'authentification de test qui ne dépend pas de la base de données
 * Utilisé uniquement avec le profil "test"
 */
@Service
@Profile("test")
public class TestAuthService {

    // Service vide pour éviter les erreurs de dépendance
    // En mode test, nous n'avons pas besoin d'authentification
}
