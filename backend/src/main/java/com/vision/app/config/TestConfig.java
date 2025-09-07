package com.vision.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Configuration de test qui désactive l'authentification
 * pour permettre le test des services d'extraction
 */
@Configuration
@Profile("test")
@EnableAutoConfiguration(exclude = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@ComponentScan(basePackages = "com.vision.app", excludeFilters = {
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*AuthService.*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*UserService.*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*JwtService.*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*AuthController.*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*UserController.*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*SecurityConfig.*")
})
public class TestConfig {

    // Cette configuration sera active uniquement avec le profil "test"
    // et exclura tous les composants d'authentification
}
