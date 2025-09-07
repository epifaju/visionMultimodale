package com.vision.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/simple/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/api/upload/**").permitAll()
                        // Endpoints de documents sans authentification (ordre important)
                        .requestMatchers("/api/documents/test-upload").permitAll()
                        .requestMatchers("/api/documents/test-post").permitAll()
                        .requestMatchers("/api/documents/test/**").permitAll()
                        .requestMatchers("/api/documents/ping").permitAll()
                        .requestMatchers("/api/documents/test-auth**").permitAll()
                        .requestMatchers("/api/documents/pdf").permitAll()
                        .requestMatchers("/api/documents/ocr").permitAll()
                        .requestMatchers("/api/documents/barcode").permitAll()
                        .requestMatchers("/api/documents/mrz").permitAll()
                        .requestMatchers("/api/documents/analyze").permitAll()
                        .requestMatchers("/api/documents/process").permitAll()
                        .requestMatchers("/api/documents/status").permitAll()
                        .requestMatchers("/api/documents").permitAll()
                        // Règle générale pour les autres endpoints de documents (doit être en dernier)
                        .requestMatchers("/api/documents/**").authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Autoriser toutes les origines pour le développement (à restreindre en
        // production)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(
                Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Access-Control-Allow-Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        // Configuration spécifique pour les uploads de fichiers
        configuration.addAllowedHeader("Content-Disposition");
        configuration.addAllowedHeader("X-File-Name");
        configuration.addAllowedHeader("X-File-Size");
        configuration.addAllowedHeader("X-File-Type");
        configuration.addAllowedHeader("Content-Type");

        // Headers spécifiques pour l'authentification JWT
        configuration.addAllowedHeader("Authorization");
        configuration.addAllowedHeader("Accept");
        configuration.addAllowedHeader("Cache-Control");
        configuration.addAllowedHeader("Pragma");

        // Exposer les headers de réponse
        configuration.addExposedHeader("Authorization");
        configuration.addExposedHeader("Content-Type");
        configuration.addExposedHeader("Content-Disposition");
        configuration.addExposedHeader("Access-Control-Allow-Origin");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}