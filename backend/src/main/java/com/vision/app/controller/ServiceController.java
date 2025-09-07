package com.vision.app.controller;

import com.vision.app.service.OcrService;
import com.vision.app.service.OllamaService;
import com.vision.app.dto.OllamaResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ServiceController {

    private final OcrService ocrService;
    private final OllamaService ollamaService;

    /**
     * Endpoint de statut de tous les services
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getServicesStatus() {
        Map<String, Object> status = new HashMap<>();
        
        // Statut OCR
        try {
            Map<String, Object> ocrStatus = ocrService.getConfiguration();
            status.put("ocr", ocrStatus);
        } catch (Exception e) {
            status.put("ocr", Map.of(
                    "available", false,
                    "error", e.getMessage()));
        }
        
        // Statut Ollama
        try {
            OllamaResult testResult = ollamaService.analyzeText("test", "test");
            status.put("ollama", Map.of(
                    "available", testResult.isSuccessful(),
                    "model", ollamaService.getModel(),
                    "url", ollamaService.getOllamaUrl()));
        } catch (Exception e) {
            status.put("ollama", Map.of(
                    "available", false,
                    "error", e.getMessage()));
        }
        
        // Statut général
        status.put("timestamp", System.currentTimeMillis());
        status.put("version", "1.0.0");
        
        return ResponseEntity.ok(status);
    }

    /**
     * Test du service OCR spécifiquement
     */
    @PostMapping("/test/ocr")
    public ResponseEntity<Map<String, Object>> testOcrService() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            result.put("status", "OCR service is available");
            result.put("tesseract", ocrService.getConfiguration());
            result.put("success", true);
            
        } catch (Exception e) {
            result.put("status", "OCR service test failed");
            result.put("error", e.getMessage());
            result.put("success", false);
        }
        
        return ResponseEntity.ok(result);
    }
}


