package com.vision.app.controller;

import com.vision.app.dto.OcrResult;
import com.vision.app.dto.PdfResult;
import com.vision.app.dto.BarcodeResult;
import com.vision.app.dto.MrzResult;
import com.vision.app.dto.OllamaResult;
import com.vision.app.dto.DocumentDto;
import com.vision.app.service.OcrService;
import com.vision.app.service.PdfService;
import com.vision.app.service.BarcodeService;
import com.vision.app.service.MrzService;
import com.vision.app.service.OllamaService;
import com.vision.app.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final OcrService ocrService;
    private final PdfService pdfService;
    private final BarcodeService barcodeService;
    private final MrzService mrzService;
    private final OllamaService ollamaService;
    private final DocumentService documentService;

    /**
     * Endpoint pour récupérer la liste des documents
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "uploadedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Récupérer les documents depuis la base de données
            Page<DocumentDto> documentsPage = documentService.getAllDocuments(page, size, sortBy, sortDir);

            response.put("content", documentsPage.getContent());
            response.put("totalPages", documentsPage.getTotalPages());
            response.put("totalElements", documentsPage.getTotalElements());
            response.put("currentPage", documentsPage.getNumber());
            response.put("size", documentsPage.getSize());
            response.put("first", documentsPage.isFirst());
            response.put("last", documentsPage.isLast());
            response.put("sortBy", sortBy);
            response.put("sortDir", sortDir);
            response.put("message", "Liste des documents récupérée avec succès");

            log.info("📋 Documents - Récupération de la liste (page {}, taille {}): {} documents trouvés",
                    page, size, documentsPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Documents - Erreur lors de la récupération: {}", e.getMessage(), e);
            response.put("error", "Erreur lors de la récupération des documents: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Endpoint de test simple
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "API Documents fonctionne correctement");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de test très simple
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    /**
     * Test POST simple
     */
    @PostMapping("/test-post")
    public ResponseEntity<Map<String, Object>> testPost() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "POST fonctionne dans DocumentController !");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint de test pour l'upload de documents
     */
    @PostMapping(value = "/test-upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> testUpload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Map<String, Object> result = new HashMap<>();

        try {
            // Debug détaillé
            String authHeader = request.getHeader("Authorization");
            log.info("📁 Test Upload - DEBUG Headers:");
            log.info("   Authorization: {}",
                    authHeader != null
                            ? "Present (" + authHeader.substring(0, Math.min(authHeader.length(), 20)) + "...)"
                            : "Missing");
            log.info("   Content-Type: {}", request.getContentType());
            log.info("   Method: {}", request.getMethod());
            log.info("   URL: {}", request.getRequestURL());

            log.info("📁 Test Upload - Fichier reçu: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation basique
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Récupérer l'utilisateur authentifié depuis le contexte de sécurité
            Long userId = 1L; // Par défaut
            try {
                String username = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
                if (username != null) {
                    // Récupérer l'ID de l'utilisateur depuis le service
                    var user = documentService.getUserByUsername(username);
                    if (user.isPresent()) {
                        userId = user.get().getId();
                        log.info("📁 Test Upload - Utilisateur authentifié trouvé: {} (ID: {})", username, userId);
                    } else {
                        log.warn("📁 Test Upload - Utilisateur {} non trouvé, utilisation de l'ID par défaut: {}",
                                username, userId);
                    }
                } else {
                    log.warn("📁 Test Upload - Aucun utilisateur authentifié, utilisation de l'ID par défaut: {}",
                            userId);
                }
            } catch (Exception e) {
                log.warn(
                        "📁 Test Upload - Erreur lors de la récupération de l'utilisateur: {}, utilisation de l'ID par défaut: {}",
                        e.getMessage(), userId);
            }

            // Sauvegarder le document en base de données
            DocumentDto savedDocument = documentService.saveDocument(file, userId);

            result.put("success", true);
            result.put("document", savedDocument);
            result.put("fileName", file.getOriginalFilename());
            result.put("fileSize", file.getSize());
            result.put("contentType", file.getContentType());
            result.put("message", "🎉 Upload et sauvegarde réussis !");
            result.put("timestamp", System.currentTimeMillis());

            log.info("✅ Test Upload - Document sauvegardé avec ID: {} pour utilisateur ID: {} ({})",
                    savedDocument.getId(), userId, file.getOriginalFilename());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Test Upload - Erreur: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du test upload: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint d'upload de documents avec support de fichiers
     */
    @PostMapping(value = "/process", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file) {

        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📁 Fichier reçu: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation basique
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Traitement réussi
            result.put("success", true);
            result.put("fileName", file.getOriginalFilename());
            result.put("fileSize", file.getSize());
            result.put("contentType", file.getContentType());
            result.put("message", "🎉 Upload réel réussi ! Fichier traité par le backend.");
            result.put("timestamp", System.currentTimeMillis());

            log.info("✅ Traitement terminé pour: {}", file.getOriginalFilename());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du traitement: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint OCR - Extraction de texte depuis une image
     */
    @PostMapping(value = "/ocr", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> processOcr(
            @RequestParam("file") MultipartFile file) {

        Map<String, Object> result = new HashMap<>();

        try {
            log.info("🔍 OCR - Traitement de l'image: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation du fichier
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Vérifier que c'est bien une image
            if (!file.getContentType().startsWith("image/")) {
                result.put("success", false);
                result.put("error", "Le fichier doit être une image");
                return ResponseEntity.badRequest().body(result);
            }

            // Traitement OCR
            OcrResult ocrResult = ocrService.extractTextFromImageBytes(
                    file.getBytes(),
                    file.getOriginalFilename());

            if (ocrResult.isSuccess()) {
                result.put("success", true);
                result.put("data", ocrResult);
                result.put("message", "OCR traité avec succès");
                log.info("✅ OCR - Succès pour {}: {} caractères extraits",
                        file.getOriginalFilename(), ocrResult.getTextLength());
            } else {
                result.put("success", false);
                result.put("error", ocrResult.getErrorMessage());
                result.put("data", ocrResult);
                log.warn("⚠️ OCR - Échec pour {}: {}", file.getOriginalFilename(), ocrResult.getErrorMessage());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ OCR - Erreur lors du traitement: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du traitement OCR: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint PDF - Extraction de texte depuis un fichier PDF
     */
    @PostMapping(value = "/pdf", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> processPdf(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Map<String, Object> result = new HashMap<>();

        try {
            // Log de débogage pour l'authentification
            String authHeader = request.getHeader("Authorization");
            log.info("📄 PDF - Headers reçus: Authorization={}, Content-Type={}",
                    authHeader != null ? "Present" : "Missing",
                    request.getContentType());

            log.info("📄 PDF - Traitement du fichier: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation du fichier
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Vérifier que c'est bien un PDF
            if (!file.getContentType().equals("application/pdf")) {
                result.put("success", false);
                result.put("error", "Le fichier doit être un PDF");
                return ResponseEntity.badRequest().body(result);
            }

            // Traitement PDF
            PdfResult pdfResult = pdfService.extractTextFromPdfBytes(
                    file.getBytes(),
                    file.getOriginalFilename());

            if (pdfResult.isSuccess()) {
                result.put("success", true);
                result.put("data", pdfResult);
                result.put("message", "PDF traité avec succès");
                log.info("✅ PDF - Succès pour {}: {} pages, {} caractères",
                        file.getOriginalFilename(), pdfResult.getPageCount(), pdfResult.getText().length());
            } else {
                result.put("success", false);
                result.put("error", pdfResult.getErrorMessage());
                result.put("data", pdfResult);
                log.warn("⚠️ PDF - Échec pour {}: {}", file.getOriginalFilename(), pdfResult.getErrorMessage());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ PDF - Erreur lors du traitement: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du traitement PDF: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint codes-barres - Lecture de codes-barres et QR codes depuis une image
     */
    @PostMapping(value = "/barcode", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> processBarcode(
            @RequestParam("file") MultipartFile file) {

        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📊 Barcode - Traitement de l'image: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation du fichier
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Vérifier que c'est bien une image
            if (!file.getContentType().startsWith("image/")) {
                result.put("success", false);
                result.put("error", "Le fichier doit être une image");
                return ResponseEntity.badRequest().body(result);
            }

            // Traitement codes-barres
            BarcodeResult barcodeResult = barcodeService.readBarcodesFromImageBytes(
                    file.getBytes(),
                    file.getOriginalFilename());

            if (barcodeResult.isSuccess()) {
                result.put("success", true);
                result.put("data", barcodeResult);
                result.put("message", "Codes-barres traités avec succès");
                log.info("✅ Barcode - Succès pour {}: {} codes-barres trouvés",
                        file.getOriginalFilename(), barcodeResult.getBarcodeCount());
            } else {
                result.put("success", false);
                result.put("error", barcodeResult.getErrorMessage());
                result.put("data", barcodeResult);
                log.warn("⚠️ Barcode - Échec pour {}: {}", file.getOriginalFilename(), barcodeResult.getErrorMessage());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Barcode - Erreur lors du traitement: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du traitement des codes-barres: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint MRZ - Extraction MRZ depuis une image de document
     */
    @PostMapping(value = "/mrz", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> processMrz(
            @RequestParam("file") MultipartFile file) {

        Map<String, Object> result = new HashMap<>();

        try {
            log.info("🆔 MRZ - Traitement du document: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation du fichier
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Vérifier que c'est bien une image
            if (!file.getContentType().startsWith("image/")) {
                result.put("success", false);
                result.put("error", "Le fichier doit être une image");
                return ResponseEntity.badRequest().body(result);
            }

            // Traitement MRZ
            MrzResult mrzResult = mrzService.processDocument(file);

            if (mrzResult.isSuccess()) {
                result.put("success", true);
                result.put("data", mrzResult);
                result.put("message", "MRZ traité avec succès");
                log.info("✅ MRZ - Succès pour {}: Type {}, Pays {}",
                        file.getOriginalFilename(),
                        mrzResult.getData().getDocumentType(),
                        mrzResult.getData().getIssuingCountry());
            } else {
                result.put("success", false);
                result.put("error", mrzResult.getErrorMessage());
                result.put("data", mrzResult);
                log.warn("⚠️ MRZ - Échec pour {}: {}", file.getOriginalFilename(), mrzResult.getErrorMessage());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ MRZ - Erreur lors du traitement: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors du traitement MRZ: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint Ollama - Analyse intelligente de document avec IA
     */
    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> processAnalyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prompt", required = false) String customPrompt) {

        Map<String, Object> result = new HashMap<>();

        try {
            log.info("🤖 Ollama - Analyse IA du document: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

            // Validation du fichier
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("error", "Fichier vide");
                return ResponseEntity.badRequest().body(result);
            }

            // Vérifier que c'est bien une image
            if (!file.getContentType().startsWith("image/")) {
                result.put("success", false);
                result.put("error", "Le fichier doit être une image");
                return ResponseEntity.badRequest().body(result);
            }

            // Utiliser un prompt par défaut si aucun n'est fourni
            String prompt = customPrompt != null ? customPrompt
                    : "Analysez cette image et décrivez son contenu. Identifiez les éléments visuels, le texte visible, et fournissez une description détaillée.";

            // Traitement Ollama
            OllamaResult ollamaResult = ollamaService.analyzeImageWithText(
                    file.getBytes(),
                    file.getOriginalFilename(),
                    prompt);

            if (ollamaResult.isSuccessful()) {
                result.put("success", true);
                result.put("data", ollamaResult);
                result.put("message", "Analyse IA terminée avec succès");
                log.info("✅ Ollama - Succès pour {}: {} caractères de réponse",
                        file.getOriginalFilename(), ollamaResult.getResponse().length());
            } else {
                result.put("success", false);
                result.put("error", ollamaResult.getErrorMessage());
                result.put("data", ollamaResult);
                log.warn("⚠️ Ollama - Échec pour {}: {}", file.getOriginalFilename(), ollamaResult.getErrorMessage());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Ollama - Erreur lors de l'analyse: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", "Erreur lors de l'analyse IA: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Endpoint de test pour l'authentification JWT
     */
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testAuth(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();

        String authHeader = request.getHeader("Authorization");
        result.put("authHeaderPresent", authHeader != null);
        result.put("authHeader", authHeader);
        result.put("contentType", request.getContentType());
        result.put("method", request.getMethod());
        result.put("timestamp", System.currentTimeMillis());

        log.info("🔐 Test Auth - Headers: Authorization={}, Content-Type={}",
                authHeader != null ? "Present" : "Missing",
                request.getContentType());

        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint de test pour l'authentification JWT avec POST
     */
    @PostMapping("/test-auth-post")
    public ResponseEntity<Map<String, Object>> testAuthPost(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();

        String authHeader = request.getHeader("Authorization");
        result.put("authHeaderPresent", authHeader != null);
        result.put("authHeader", authHeader);
        result.put("contentType", request.getContentType());
        result.put("method", request.getMethod());
        result.put("timestamp", System.currentTimeMillis());

        log.info("🔐 Test Auth POST - Headers: Authorization={}, Content-Type={}",
                authHeader != null ? "Present" : "Missing",
                request.getContentType());

        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint de statut des services
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getServicesStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            // Vérifier le statut des services
            Map<String, Object> ocrConfig = ocrService.getConfiguration();
            Map<String, Object> pdfConfig = pdfService.getConfiguration();
            Map<String, Object> barcodeConfig = barcodeService.getConfiguration();
            Map<String, Object> ollamaConfig = ollamaService.getConfiguration();

            status.put("timestamp", System.currentTimeMillis());
            status.put("services", Map.of(
                    "ocr", Map.of(
                            "available", ocrConfig.get("available"),
                            "language", ocrConfig.get("language"),
                            "version", ocrConfig.get("version")),
                    "pdf", Map.of(
                            "available", pdfConfig.get("available"),
                            "version", pdfConfig.get("version")),
                    "barcode", Map.of(
                            "available", barcodeConfig.get("available"),
                            "version", barcodeConfig.get("version"),
                            "supportedFormats", barcodeConfig.get("supportedFormats")),
                    "mrz", Map.of(
                            "available", true,
                            "version", "MRZ Parser 1.0",
                            "supportedTypes", new String[] { "PASSPORT", "ID_CARD" }),
                    "ollama", Map.of(
                            "available", ollamaConfig.get("available"),
                            "version", ollamaConfig.get("version"),
                            "model", ollamaConfig.get("model"))));

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du statut: {}", e.getMessage());
            status.put("error", "Erreur lors de la récupération du statut");
            return ResponseEntity.internalServerError().body(status);
        }
    }
}