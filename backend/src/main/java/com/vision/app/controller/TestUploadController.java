package com.vision.app.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
@Slf4j
public class TestUploadController {

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testUpload(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📁 Test Upload - Fichier reçu: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation basique
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Simulation de traitement réussi
            result.put("success", true);
            result.put("fileName", file.getOriginalFilename());
            result.put("fileSize", file.getSize());
            result.put("contentType", file.getContentType());
            result.put("message", "🎉 Upload de test réussi !");
            result.put("timestamp", System.currentTimeMillis());

            log.info("✅ Test Upload - Terminé pour: {}", file.getOriginalFilename());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Test Upload - Erreur: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du test upload: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @PostMapping("/simple")
    public ResponseEntity<Map<String, Object>> testSimple() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Test simple réussi !");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }
}
