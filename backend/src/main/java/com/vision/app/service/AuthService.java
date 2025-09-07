package com.vision.app.service;

import com.vision.app.dto.AuthRequest;
import com.vision.app.dto.AuthResponse;
import com.vision.app.dto.RegisterRequest;
import com.vision.app.dto.UserDto;
import com.vision.app.model.Role;
import com.vision.app.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse authenticate(AuthRequest request) {
        try {
            log.debug("Attempting to authenticate user: {}", request.getUsername());

            // Authentifier l'utilisateur avec Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            log.debug("User {} authenticated successfully with Spring Security", userDetails.getUsername());

            // Vérifier que l'utilisateur est actif
            User userEntity = userService.getUserEntityByUsername(userDetails.getUsername());
            if (userEntity == null || !userEntity.getIsActive()) {
                log.warn("User {} is not active or not found", userDetails.getUsername());
                throw new UsernameNotFoundException("User account is not active");
            }

            // Générer le token JWT
            String token = jwtService.generateToken(userDetails);
            log.debug("JWT token generated for user: {}", userDetails.getUsername());

            // Générer un refresh token avec des claims supplémentaires
            Map<String, Object> refreshClaims = new HashMap<>();
            refreshClaims.put("type", "refresh");
            String refreshToken = jwtService.generateToken(userDetails, refreshClaims);
            log.debug("Refresh token generated for user: {}", userDetails.getUsername());

            // Récupérer les informations utilisateur
            UserDto userDto = userService.getUserByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found after authentication"));

            log.info("User {} authenticated successfully", userDetails.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L) // 24 heures en millisecondes
                    .user(userDto)
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Bad credentials for user: {}", request.getUsername());
            throw e; // Relancer pour que le contrôleur puisse la gérer
        } catch (UsernameNotFoundException e) {
            log.warn("User not found: {}", request.getUsername());
            throw e; // Relancer pour que le contrôleur puisse la gérer
        } catch (Exception e) {
            log.error("Authentication failed for user {}: {}", request.getUsername(), e.getMessage(), e);
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse register(RegisterRequest request) {
        try {
            log.debug("Attempting to register user: {}", request.getUsername());

            // Validation des données
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username is required");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters long");
            }

            // Créer l'utilisateur
            UserDto userDto = userService.createUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getRole() != null ? request.getRole() : Role.USER);

            log.debug("User {} created successfully", request.getUsername());

            // Authentifier automatiquement l'utilisateur après inscription
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Générer les tokens
            String token = jwtService.generateToken(userDetails);
            Map<String, Object> refreshClaims = new HashMap<>();
            refreshClaims.put("type", "refresh");
            String refreshToken = jwtService.generateToken(userDetails, refreshClaims);

            log.info("User {} registered and authenticated successfully", request.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L)
                    .user(userDto)
                    .build();

        } catch (IllegalArgumentException e) {
            log.warn("Registration validation failed for user {}: {}", request.getUsername(), e.getMessage());
            throw e; // Relancer pour que le contrôleur puisse la gérer
        } catch (Exception e) {
            log.error("Registration failed for user {}: {}", request.getUsername(), e.getMessage(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        try {
            log.debug("Attempting to refresh token");

            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                throw new IllegalArgumentException("Refresh token is required");
            }

            // Valider le refresh token
            if (!jwtService.isTokenValid(refreshToken)) {
                throw new IllegalArgumentException("Invalid refresh token");
            }

            // Extraire le username du refresh token
            String username = jwtService.extractUsername(refreshToken);
            if (username == null || username.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid token format");
            }

            // Récupérer les détails utilisateur
            UserDetails userDetails = userService.loadUserByUsername(username);

            // Vérifier que l'utilisateur est toujours actif
            User userEntity = userService.getUserEntityByUsername(username);
            if (userEntity == null || !userEntity.getIsActive()) {
                throw new UsernameNotFoundException("User account is not active");
            }

            // Générer un nouveau token
            String newToken = jwtService.generateToken(userDetails);

            // Générer un nouveau refresh token
            Map<String, Object> refreshClaims = new HashMap<>();
            refreshClaims.put("type", "refresh");
            String newRefreshToken = jwtService.generateToken(userDetails, refreshClaims);

            // Récupérer les informations utilisateur
            UserDto userDto = userService.getUserByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            log.info("Token refreshed successfully for user {}", username);

            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L)
                    .user(userDto)
                    .build();

        } catch (IllegalArgumentException e) {
            log.warn("Token refresh validation failed: {}", e.getMessage());
            throw e; // Relancer pour que le contrôleur puisse la gérer
        } catch (UsernameNotFoundException e) {
            log.warn("User not found during token refresh: {}", e.getMessage());
            throw e; // Relancer pour que le contrôleur puisse la gérer
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage(), e);
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    public void logout(String token) {
        try {
            if (token != null && !token.trim().isEmpty()) {
                // Dans une implémentation plus avancée, on pourrait ajouter le token à une
                // blacklist ou utiliser Redis pour invalider les tokens
                log.info("User logged out successfully");
            } else {
                log.warn("Empty token provided for logout");
            }
        } catch (Exception e) {
            log.error("Error during logout: {}", e.getMessage(), e);
            // Ne pas relancer l'exception pour le logout
        }
    }

    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }
}
