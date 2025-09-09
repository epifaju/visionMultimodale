package com.vision.app.controller;

import com.vision.app.dto.MrzResult;
import com.vision.app.service.MrzService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Contrôleur REST pour le service MRZ
 */
@RestController
@RequestMapping("/api/mrz")
@RequiredArgsConstructor
@Slf4j
public class MrzController {

    private final MrzService mrzService;

    /**
     * Traite un document et extrait les informations MRZ
     */
    @PostMapping(value = "/process-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MrzResult> processDocument(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Traitement MRZ demandé pour le fichier: {}", file.getOriginalFilename());

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        MrzResult.builder()
                                .fileName(file.getOriginalFilename())
                                .success(false)
                                .errorMessage("Fichier vide")
                                .build());
            }

            // Vérifier le type de fichier
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                        MrzResult.builder()
                                .fileName(file.getOriginalFilename())
                                .success(false)
                                .errorMessage("Type de fichier non supporté. Utilisez une image.")
                                .build());
            }

            // Traiter le document
            MrzResult result = mrzService.processDocument(file);

            if (result.isSuccess()) {
                log.info("Document MRZ traité avec succès: {}", file.getOriginalFilename());
                return ResponseEntity.ok(result);
            } else {
                log.warn("Échec du traitement MRZ pour: {} - {}", file.getOriginalFilename(), result.getErrorMessage());
                return ResponseEntity.badRequest().body(result);
            }

        } catch (Exception e) {
            log.error("Erreur lors du traitement MRZ du fichier {}: {}", file.getOriginalFilename(), e.getMessage());
            return ResponseEntity.internalServerError().body(
                    MrzResult.builder()
                            .fileName(file.getOriginalFilename())
                            .success(false)
                            .errorMessage("Erreur interne: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Valide des données MRZ
     */
    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateMrzData(@RequestBody String mrzText) {
        try {
            log.info("Validation MRZ demandée");

            // Pour l'instant, validation simple
            boolean isValid = mrzText != null && mrzText.length() >= 44;

            return ResponseEntity.ok(isValid);

        } catch (Exception e) {
            log.error("Erreur lors de la validation MRZ: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(false);
        }
    }

    /**
     * Endpoint de test pour vérifier que le service MRZ fonctionne
     */
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Service MRZ opérationnel");
    }
}
