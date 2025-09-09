package com.vision.app.controller;

import com.vision.app.dto.AuthRequest;
import com.vision.app.dto.AuthResponse;
import com.vision.app.dto.RegisterRequest;
import com.vision.app.service.AuthService;
import com.vision.app.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:4173"}, 
             allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            log.info("Login attempt for user: {}", request.getUsername());
            AuthResponse response = authService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            log.warn("Invalid credentials for user {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid username or password",
                            "message", "Les identifiants fournis sont incorrects"));
        } catch (UsernameNotFoundException e) {
            log.warn("User not found: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "User not found",
                            "message", "Utilisateur non trouvé"));
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", request.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal server error",
                            "message", "Erreur interne du serveur. Veuillez réessayer plus tard."));
        }
    }

    @PostMapping("/test-auth-post")
    public ResponseEntity<Map<String, Object>> testAuthPost() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Auth POST fonctionne !");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for user: {}", request.getUsername());
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Registration validation failed for user {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Registration failed for user {}: {}", request.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal server error",
                            "message", "Erreur interne du serveur. Veuillez réessayer plus tard."));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error", "Invalid authorization header",
                                "message", "En-tête d'autorisation invalide"));
            }

            String refreshToken = authHeader.substring(7);
            log.info("Token refresh attempt");

            AuthResponse response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Token refresh validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Invalid token",
                            "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Token refresh failed",
                            "message", "Impossible de rafraîchir le token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                authService.logout(token);
                log.info("User logged out successfully");
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Logout failed",
                            "message", "Erreur lors de la déconnexion"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            // Récupérer l'utilisateur depuis le contexte de sécurité
            String username = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            // Récupérer les détails complets de l'utilisateur
            var user = userService.getUserByUsername(username);
            if (user.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "user", user.get(),
                        "message", "Current user retrieved successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            log.error("Error retrieving current user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        log.info("🧪 Test endpoint called");
        return ResponseEntity.ok(Map.of(
                "message", "Auth endpoint is working",
                "timestamp", System.currentTimeMillis(),
                "status", "OK"));
    }

    @GetMapping("/test-users")
    public ResponseEntity<?> testUsers() {
        try {
            // Test de récupération des utilisateurs
            var users = authService.getAllUsers();
            log.info("🧪 Test users endpoint called - Found {} users", users.size());
            return ResponseEntity.ok(Map.of(
                    "message", "Users retrieved successfully",
                    "count", users.size(),
                    "users", users,
                    "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            log.error("Error retrieving users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to retrieve users",
                            "message", e.getMessage()));
        }
    }

    @PostMapping("/test-login")
    public ResponseEntity<?> testLogin(@RequestBody AuthRequest request) {
        log.info("🧪 Test login endpoint called for user: {}", request.getUsername());

        // Log des données reçues
        log.info("📝 Test login data - Username: {}, Password length: {}, HasPassword: {}",
                request.getUsername(),
                request.getPassword() != null ? request.getPassword().length() : 0,
                request.getPassword() != null && !request.getPassword().isEmpty());

        return ResponseEntity.ok(Map.of(
                "message", "Test login endpoint working",
                "receivedData", Map.of(
                        "username", request.getUsername(),
                        "passwordLength", request.getPassword() != null ? request.getPassword().length() : 0,
                        "hasPassword", request.getPassword() != null && !request.getPassword().isEmpty()),
                "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            log.info("🧪 Testing database connection and user retrieval");

            // Test simple de récupération d'utilisateur
            var user = userService.getUserByUsername("admin");
            log.info("📝 Found admin user: {}", user.isPresent());

            return ResponseEntity.ok(Map.of(
                    "message", "Database test successful",
                    "adminUserExists", user.isPresent(),
                    "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            log.error("Database test failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Database test failed",
                            "message", e.getMessage()));
        }
    }

    // Gestionnaire d'erreurs global pour les erreurs de validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation errors: {}", errors);

        return ResponseEntity.badRequest()
                .body(Map.of(
                        "error", "Validation failed",
                        "message", "Données de formulaire invalides",
                        "details", errors));
    }
}
