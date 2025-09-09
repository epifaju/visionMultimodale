package com.vision.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration CORS globale pour permettre les requêtes cross-origin
 * depuis le frontend React vers le backend Spring Boot
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Configuration spécifique pour le développement
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000", // React dev server par défaut
                "http://localhost:5173", // Vite dev server
                "http://localhost:4173", // Vite preview
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:4173",
                "http://localhost:8080" // Backend lui-même
        ));

        // Configuration pour la production (décommentez et adaptez selon vos besoins)
        // configuration.setAllowedOrigins(Arrays.asList(
        // "https://votre-domaine.com",
        // "https://www.votre-domaine.com"
        // ));

        // Autoriser les credentials pour l'authentification
        configuration.setAllowCredentials(true);

        // Autoriser toutes les méthodes HTTP nécessaires
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));

        // Headers autorisés - spécifiques pour éviter les conflits
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "Cache-Control",
                "Pragma"));

        // Headers exposés dans la réponse
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Content-Length",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Headers",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Credentials"));

        // Durée de mise en cache des requêtes preflight (30 minutes)
        configuration.setMaxAge(1800L);

        // Appliquer cette configuration à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}