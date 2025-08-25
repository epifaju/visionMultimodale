package com.vision.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> testApi() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "API de test fonctionne");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents")
    public ResponseEntity<Map<String, Object>> testDocumentsEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Endpoint documents accessible");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/simple")
    public ResponseEntity<String> testSimple() {
        return ResponseEntity.ok("API simple fonctionne");
    }

    @GetMapping("/error")
    public ResponseEntity<Map<String, Object>> testError() {
        try {
            // Simuler une erreur pour tester la gestion d'erreur
            throw new RuntimeException("Erreur de test");
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", e.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
