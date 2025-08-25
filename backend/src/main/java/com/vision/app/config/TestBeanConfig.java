package com.vision.app.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration de test qui remplace les beans d'authentification
 * par des versions simplifiées pour les tests
 */
@Configuration
@Profile("test")
@ConditionalOnProperty(name = "spring.profiles.active", havingValue = "test")
public class TestBeanConfig {

    @Bean
    @Primary
    @Profile("test")
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
