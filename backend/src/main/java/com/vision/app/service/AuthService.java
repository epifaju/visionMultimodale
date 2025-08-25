package com.vision.app.service;

import com.vision.app.dto.AuthRequest;
import com.vision.app.dto.AuthResponse;
import com.vision.app.dto.RegisterRequest;
import com.vision.app.dto.UserDto;
import com.vision.app.model.Role;
import com.vision.app.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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
            // Authentifier l'utilisateur avec Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Générer le token JWT
            String token = jwtService.generateToken(userDetails);

            // Générer un refresh token avec des claims supplémentaires
            Map<String, Object> refreshClaims = new HashMap<>();
            refreshClaims.put("type", "refresh");
            String refreshToken = jwtService.generateToken(userDetails, refreshClaims);

            // Récupérer les informations utilisateur
            UserDto userDto = userService.getUserByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            log.info("User {} authenticated successfully", userDetails.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L) // 24 heures en millisecondes
                    .user(userDto)
                    .build();

        } catch (Exception e) {
            log.error("Authentication failed for user {}: {}", request.getUsername(), e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse register(RegisterRequest request) {
        try {
            // Créer l'utilisateur
            UserDto userDto = userService.createUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getRole());

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

        } catch (Exception e) {
            log.error("Registration failed for user {}: {}", request.getUsername(), e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Valider le refresh token
            if (!jwtService.isTokenValid(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            // Extraire le username du refresh token
            String username = jwtService.extractUsername(refreshToken);

            // Récupérer les détails utilisateur
            UserDetails userDetails = userService.loadUserByUsername(username);

            // Générer un nouveau token
            String newToken = jwtService.generateToken(userDetails);

            // Générer un nouveau refresh token
            Map<String, Object> refreshClaims = new HashMap<>();
            refreshClaims.put("type", "refresh");
            String newRefreshToken = jwtService.generateToken(userDetails, refreshClaims);

            // Récupérer les informations utilisateur
            UserDto userDto = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Token refreshed successfully for user {}", username);

            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L)
                    .user(userDto)
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    public void logout(String token) {
        // Dans une implémentation plus avancée, on pourrait ajouter le token à une
        // blacklist
        // ou utiliser Redis pour invalider les tokens
        log.info("User logged out successfully");
    }
}
