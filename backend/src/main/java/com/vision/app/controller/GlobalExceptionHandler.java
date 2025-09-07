package com.vision.app.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Gestionnaire pour les erreurs de validation des DTOs
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        log.warn("Validation errors for request: {}", ex.getBindingResult().getAllErrors());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "Validation failed");
        response.put("message", "Données de formulaire invalides");
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Gestionnaire pour les erreurs d'authentification
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        log.warn("Bad credentials for request: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "Authentication failed");
        response.put("message", "Nom d'utilisateur ou mot de passe incorrect");
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Gestionnaire pour les utilisateurs non trouvés
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<?> handleUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request) {
        log.warn("User not found for request: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "User not found");
        response.put("message", "Utilisateur non trouvé");
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Gestionnaire pour toutes les autres exceptions non gérées
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex, WebRequest request) {
        log.error("Unhandled exception for request: {}", ex.getMessage(), ex);

        Map<String, Object> response = new HashMap<>();
        response.put("error", "Internal server error");
        response.put("message", "Erreur interne du serveur. Veuillez réessayer plus tard.");
        response.put("timestamp", System.currentTimeMillis());
        response.put("details", ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
