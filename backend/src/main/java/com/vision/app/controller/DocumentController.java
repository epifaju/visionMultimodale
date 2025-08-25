package com.vision.app.controller;

import com.vision.app.dto.DocumentProcessingResult;
import com.vision.app.dto.OcrResult;
import com.vision.app.dto.PdfResult;
import com.vision.app.dto.BarcodeResult;
import com.vision.app.dto.OllamaResult;
import com.vision.app.dto.DocumentDto;
import com.vision.app.model.Document;
import com.vision.app.model.ProcessingStatus;
import com.vision.app.model.User;
import com.vision.app.repository.DocumentRepository;
import com.vision.app.service.DocumentProcessingService;
import com.vision.app.service.OcrService;
import com.vision.app.service.PdfService;
import com.vision.app.service.BarcodeService;
import com.vision.app.service.OllamaService;
import com.vision.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    // private final DocumentProcessingService documentProcessingService;
    // private final OcrService ocrService;
    // private final PdfService pdfService;
    // private final BarcodeService barcodeService;
    // private final OllamaService ollamaService;
    private final DocumentRepository documentRepository;
    private final UserService userService;

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
     * Récupère la liste des documents de l'utilisateur connecté
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "uploadedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) ProcessingStatus status,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String searchQuery) {

        try {
            // Récupérer l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // Si pas d'authentification ou utilisateur anonyme, retourner tous les
            // documents
            if (username == null || username.equals("anonymousUser")) {
                log.info("Aucune authentification détectée, retour de tous les documents");
                return getAllDocuments(page, size, sortBy, sortDir, status, fileType, searchQuery);
            }

            User user = userService.getUserEntityByUsername(username);

            if (user == null) {
                log.warn("Utilisateur non trouvé: {}", username);
                return ResponseEntity.badRequest().body(Map.of("error", "Utilisateur non trouvé"));
            }

            // Configuration de la pagination et du tri
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir.toUpperCase()), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            // Récupération des documents avec filtres
            Page<Document> documentsPage;

            if (status != null && fileType != null) {
                documentsPage = documentRepository.findByUploadedByAndStatus(user, status, pageable);
            } else if (status != null) {
                documentsPage = documentRepository.findByStatus(status, pageable);
            } else if (fileType != null) {
                documentsPage = documentRepository.findByFileType(fileType, pageable);
            } else if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                documentsPage = documentRepository.findByExtractedTextContaining(searchQuery, pageable);
            } else {
                documentsPage = documentRepository.findByUploadedBy(user, pageable);
            }

            // Conversion en DTOs
            Page<DocumentDto> documentsDtoPage = documentsPage.map(this::convertToDto);

            Map<String, Object> response = new HashMap<>();
            response.put("content", documentsDtoPage.getContent());
            response.put("totalElements", documentsPage.getTotalElements());
            response.put("totalPages", documentsPage.getTotalPages());
            response.put("currentPage", documentsPage.getNumber());
            response.put("size", documentsPage.getSize());
            response.put("first", documentsPage.isFirst());
            response.put("last", documentsPage.isLast());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des documents: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur interne du serveur: " + e.getMessage()));
        }
    }

    /**
     * Récupère tous les documents (endpoint public pour le développement)
     */
    private ResponseEntity<Map<String, Object>> getAllDocuments(
            int page, int size, String sortBy, String sortDir,
            ProcessingStatus status, String fileType, String searchQuery) {

        try {
            // Configuration de la pagination et du tri
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir.toUpperCase()), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            // Récupération de tous les documents
            Page<Document> documentsPage = documentRepository.findAll(pageable);

            // Conversion en DTOs
            Page<DocumentDto> documentsDtoPage = documentsPage.map(this::convertToDto);

            Map<String, Object> response = new HashMap<>();
            response.put("content", documentsDtoPage.getContent());
            response.put("totalElements", documentsPage.getTotalElements());
            response.put("totalPages", documentsPage.getTotalPages());
            response.put("currentPage", documentsPage.getNumber());
            response.put("size", documentsPage.getSize());
            response.put("first", documentsPage.isFirst());
            response.put("last", documentsPage.isLast());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération de tous les documents: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur interne du serveur: " + e.getMessage()));
        }
    }

    /**
     * Récupère un document spécifique par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        try {
            // Récupérer l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.getUserEntityByUsername(username);

            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            // Récupérer le document
            Document document = documentRepository.findById(id)
                    .orElse(null);

            if (document == null) {
                return ResponseEntity.notFound().build();
            }

            // Vérifier que l'utilisateur est propriétaire du document
            if (!document.getUploadedBy().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }

            return ResponseEntity.ok(convertToDto(document));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du document {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Convertit un Document en DocumentDto
     */
    private DocumentDto convertToDto(Document document) {
        try {
            DocumentDto dto = new DocumentDto();
            dto.setId(document.getId());
            dto.setFileName(document.getFileName());
            dto.setOriginalFileName(document.getOriginalFileName());
            dto.setFileType(document.getFileType());
            dto.setFileSize(document.getFileSize());
            dto.setExtractedText(document.getExtractedText());
            dto.setOcrConfidence(document.getOcrConfidence());
            dto.setDetectedLanguage(document.getDetectedLanguage());
            dto.setStatus(document.getStatus());
            dto.setProcessingErrors(document.getProcessingErrors());
            dto.setMetadata(document.getMetadata());

            // Gestion sécurisée de l'utilisateur
            if (document.getUploadedBy() != null) {
                dto.setUploadedById(document.getUploadedBy().getId());
                dto.setUploadedByUsername(document.getUploadedBy().getUsername());
            } else {
                dto.setUploadedById(null);
                dto.setUploadedByUsername("Unknown");
            }

            dto.setUploadedAt(document.getUploadedAt());
            dto.setProcessedAt(document.getProcessedAt());
            dto.setUpdatedAt(document.getUpdatedAt());
            return dto;
        } catch (Exception e) {
            log.error("Erreur lors de la conversion du document {} en DTO: {}", document.getId(), e.getMessage());
            // Retourner un DTO minimal en cas d'erreur
            DocumentDto errorDto = new DocumentDto();
            errorDto.setId(document.getId());
            errorDto.setFileName(document.getFileName() != null ? document.getFileName() : "Error");
            errorDto.setStatus(document.getStatus());
            return errorDto;
        }
    }

    // Méthodes temporairement commentées pour le diagnostic
    /*
     * @PostMapping(value = "/process", consumes =
     * MediaType.MULTIPART_FORM_DATA_VALUE)
     * public ResponseEntity<DocumentProcessingResult> processDocument(
     * 
     * @RequestParam("file") MultipartFile file) {
     * 
     * try {
     * log.info("Processing document: {} ({} bytes)", file.getOriginalFilename(),
     * file.getSize());
     * 
     * // Création d'un fichier temporaire
     * Path tempFile = Files.createTempFile("doc_", "_" +
     * file.getOriginalFilename());
     * file.transferTo(tempFile.toFile());
     * 
     * // Traitement du document
     * DocumentProcessingResult result =
     * documentProcessingService.processDocument(tempFile.toFile());
     * 
     * // Nettoyage du fichier temporaire
     * Files.deleteIfExists(tempFile);
     * 
     * return ResponseEntity.ok(result);
     * 
     * } catch (IOException e) {
     * log.error("Failed to process document: {}", e.getMessage());
     * DocumentProcessingResult errorResult = new DocumentProcessingResult();
     * errorResult.setFileName(file.getOriginalFilename());
     * errorResult.setSuccess(false);
     * errorResult.setErrorMessage("File processing failed: " + e.getMessage());
     * return ResponseEntity.badRequest().body(errorResult);
     * } catch (Exception e) {
     * log.error("Unexpected error during document processing: {}", e.getMessage());
     * DocumentProcessingResult errorResult = new DocumentProcessingResult();
     * errorResult.setFileName(file.getOriginalFilename());
     * errorResult.setSuccess(false);
     * errorResult.setErrorMessage("Unexpected error: " + e.getMessage());
     * return ResponseEntity.internalServerError().body(errorResult);
     * }
     * }
     * 
     * @PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
     * public ResponseEntity<OcrResult> extractTextFromImage(
     * 
     * @RequestParam("file") MultipartFile file) {
     * 
     * try {
     * log.info("OCR extraction for image: {} ({} bytes)",
     * file.getOriginalFilename(), file.getSize());
     * 
     * OcrResult result = ocrService.extractTextFromImageBytes(
     * file.getBytes(),
     * file.getOriginalFilename());
     * 
     * if (result.isSuccess()) {
     * return ResponseEntity.ok(result);
     * } else {
     * return ResponseEntity.badRequest().body(result);
     * }
     * 
     * } catch (Exception e) {
     * log.error("OCR extraction failed: {}", e.getMessage());
     * OcrResult errorResult = OcrResult.builder()
     * .fileName(file.getOriginalFilename())
     * .success(false)
     * .errorMessage("OCR extraction failed: " + e.getMessage())
     * .build();
     * return ResponseEntity.internalServerError().body(errorResult);
     * }
     * }
     * 
     * @PostMapping(value = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
     * public ResponseEntity<PdfResult> extractTextFromPdf(
     * 
     * @RequestParam("file") MultipartFile file) {
     * 
     * try {
     * log.info("PDF extraction for file: {} ({} bytes)",
     * file.getOriginalFilename(), file.getSize());
     * 
     * PdfResult result = pdfService.extractTextFromPdfBytes(
     * file.getBytes(),
     * file.getOriginalFilename());
     * 
     * if (result.isSuccess()) {
     * return ResponseEntity.ok(result);
     * } else {
     * return ResponseEntity.badRequest().body(result);
     * }
     * 
     * } catch (Exception e) {
     * log.error("PDF extraction failed: {}", e.getMessage());
     * PdfResult errorResult = new PdfResult();
     * errorResult.setFileName(file.getOriginalFilename());
     * errorResult.setSuccess(false);
     * errorResult.setErrorMessage("PDF extraction failed: " + e.getMessage());
     * return ResponseEntity.internalServerError().body(errorResult);
     * }
     * }
     * 
     * @PostMapping(value = "/barcode", consumes =
     * MediaType.MULTIPART_FORM_DATA_VALUE)
     * public ResponseEntity<BarcodeResult> readBarcodesFromImage(
     * 
     * @RequestParam("file") MultipartFile file) {
     * 
     * try {
     * log.info("Barcode reading for image: {} ({} bytes)",
     * file.getOriginalFilename(), file.getSize());
     * 
     * BarcodeResult result = barcodeService.readBarcodesFromImageBytes(
     * file.getBytes(),
     * file.getOriginalFilename());
     * 
     * if (result.isSuccess()) {
     * return ResponseEntity.ok(result);
     * } else {
     * return ResponseEntity.badRequest().body(result);
     * }
     * 
     * } catch (Exception e) {
     * log.error("Barcode reading failed: {}", e.getMessage());
     * BarcodeResult errorResult = new BarcodeResult();
     * errorResult.setFileName(file.getOriginalFilename());
     * errorResult.setSuccess(false);
     * errorResult.setErrorMessage("Barcode reading failed: " + e.getMessage());
     * return ResponseEntity.internalServerError().body(errorResult);
     * }
     * }
     * 
     * @PostMapping("/analyze")
     * public ResponseEntity<OllamaResult> analyzeText(
     * 
     * @RequestBody Map<String, String> request) {
     * 
     * try {
     * String text = request.get("text");
     * String prompt = request.get("prompt");
     * 
     * if (text == null || text.trim().isEmpty()) {
     * return ResponseEntity.badRequest().build();
     * }
     * 
     * log.info("Ollama analysis for text ({} chars) with prompt: {}",
     * text.length(), prompt);
     * 
     * OllamaResult result = ollamaService.analyzeText(text, prompt != null ? prompt
     * : "Analyze this text");
     * 
     * if (result.isSuccessful()) {
     * return ResponseEntity.ok(result);
     * } else {
     * return ResponseEntity.badRequest().body(result);
     * }
     * 
     * } catch (Exception e) {
     * log.error("Ollama analysis failed: {}", e.getMessage());
     * OllamaResult errorResult = new OllamaResult();
     * errorResult.setSuccess(false);
     * errorResult.setErrorMessage("Analysis failed: " + e.getMessage());
     * return ResponseEntity.internalServerError().body(errorResult);
     * }
     * }
     * 
     * @PostMapping("/summarize")
     * public ResponseEntity<OllamaResult> summarizeText(
     * 
     * @RequestBody Map<String, String> request) {
     * 
     * try {
     * String text = request.get("text");
     * 
     * if (text == null || text.trim().isEmpty()) {
     * return ResponseEntity.badRequest().build();
     * }
     * 
     * log.info("Text summarization for {} characters", text.length());
     * 
     * OllamaResult result = ollamaService.summarizeText(text);
     * 
     * if (result.isSuccessful()) {
     * return ResponseEntity.ok(result);
     * } else {
     * return ResponseEntity.badRequest().body(result);
     * }
     * 
     * } catch (Exception e) {
     * log.error("Text summarization failed: {}", e.getMessage());
     * OllamaResult errorResult = new OllamaResult();
     * errorResult.setSuccess(false);
     * errorResult.setErrorMessage("Summarization failed: " + e.getMessage());
     * return ResponseEntity.internalServerError().body(errorResult);
     * }
     * }
     * 
     * @GetMapping("/status")
     * public ResponseEntity<Map<String, Object>> getServicesStatus() {
     * Map<String, Object> status = new HashMap<>();
     * 
     * // Statut OCR
     * Map<String, Object> ocrStatus = ocrService.getConfiguration();
     * status.put("ocr", ocrStatus);
     * 
     * // Statut Ollama (test de connexion)
     * try {
     * OllamaResult testResult = ollamaService.analyzeText("test", "test");
     * status.put("ollama", Map.of(
     * "available", testResult.isSuccessful(),
     * "model", ollamaService.getModel(),
     * "url", ollamaService.getOllamaUrl()));
     * } catch (Exception e) {
     * status.put("ollama", Map.of(
     * "available", false,
     * "error", e.getMessage()));
     * }
     * 
     * // Statut général
     * status.put("timestamp", System.currentTimeMillis());
     * status.put("version", "1.0.0");
     * 
     * return ResponseEntity.ok(status);
     * }
     * 
     * @PostMapping("/test/ocr")
     * public ResponseEntity<Map<String, Object>> testOcrService() {
     * Map<String, Object> result = new HashMap<>();
     * 
     * try {
     * // Test avec une image de test (à implémenter)
     * result.put("status", "OCR service is available");
     * result.put("tesseract", ocrService.getConfiguration());
     * result.put("success", true);
     * 
     * } catch (Exception e) {
     * result.put("status", "OCR service test failed");
     * result.put("error", e.getMessage());
     * result.put("success", false);
     * }
     * 
     * return ResponseEntity.ok(result);
     * }
     */
}
