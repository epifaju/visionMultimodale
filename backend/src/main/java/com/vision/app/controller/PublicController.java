package com.vision.app.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:4173"}, 
             allowCredentials = "true")
@Slf4j
public class PublicController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Vision Multimodale API");
        response.put("version", "1.0.0");

        log.info("Health check requested");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Vision Multimodale API");
        response.put("description", "API pour l'application multimodale de vision par ordinateur assistée par IA");
        response.put("features", new String[] {
                "Authentification JWT",
                "Gestion des utilisateurs",
                "OCR avec Tesseract",
                "Lecture PDF avec PDFBox",
                "Lecture codes-barres avec ZXing",
                "Analyse LLM avec Ollama"
        });

        return ResponseEntity.ok(response);
    }
}
