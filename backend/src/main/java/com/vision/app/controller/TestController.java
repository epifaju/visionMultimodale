package com.vision.app.controller;

import com.vision.app.model.User;
import com.vision.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> testUsers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Vérifier combien d'utilisateurs sont dans la base
            long userCount = userRepository.count();
            response.put("userCount", userCount);
            
            // Lister tous les utilisateurs
            var users = userRepository.findAll();
            response.put("users", users.stream().map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "isActive", u.getIsActive(),
                "passwordLength", u.getPassword() != null ? u.getPassword().length() : 0
            )).toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error testing users: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/create-test-user")
    public ResponseEntity<Map<String, Object>> createTestUser() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Créer un utilisateur de test avec un mot de passe connu
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("test123"));
            testUser.setFirstName("Test");
            testUser.setLastName("User");
            testUser.setRole(com.vision.app.model.Role.USER);
            testUser.setIsActive(true);
            
            User savedUser = userRepository.save(testUser);
            
            response.put("success", true);
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "username", savedUser.getUsername(),
                "email", savedUser.getEmail()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating test user: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/test-password")
    public ResponseEntity<Map<String, Object>> testPassword(@RequestParam String username, @RequestParam String password) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                response.put("error", "User not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOpt.get();
            boolean matches = passwordEncoder.matches(password, user.getPassword());
            
            response.put("username", username);
            response.put("passwordMatches", matches);
            response.put("storedPasswordHash", user.getPassword());
            response.put("isActive", user.getIsActive());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error testing password: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

