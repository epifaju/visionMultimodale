package com.vision.app.service;

import com.vision.app.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessingService {

    private final OcrService ocrService;
    private final PdfService pdfService;
    private final BarcodeService barcodeService;
    private final OllamaService ollamaService;

    /**
     * Traite un document et extrait toutes les informations disponibles
     */
    public DocumentProcessingResult processDocument(File documentFile) {
        try {
            log.info("Starting comprehensive document processing for: {}", documentFile.getName());

            DocumentProcessingResult result = new DocumentProcessingResult();
            result.setFileName(documentFile.getName());
            result.setFileSize(documentFile.length());
            result.setFileType(detectFileType(documentFile));

            // Traitement selon le type de fichier
            switch (result.getFileType()) {
                case "image":
                    processImageDocument(documentFile, result);
                    break;
                case "pdf":
                    processPdfDocument(documentFile, result);
                    break;
                case "unknown":
                    result.setSuccess(false);
                    result.setErrorMessage("Unsupported file type");
                    break;
            }

            // Analyse LLM si du texte a été extrait
            if (result.isSuccess() && result.hasExtractedText()) {
                analyzeWithOllama(result);
            }

            log.info("Document processing completed for {}: {}", documentFile.getName(), result.getStatus());
            return result;

        } catch (Exception e) {
            log.error("Document processing failed for {}: {}", documentFile.getName(), e.getMessage());
            DocumentProcessingResult result = new DocumentProcessingResult();
            result.setFileName(documentFile.getName());
            result.setSuccess(false);
            result.setErrorMessage("Processing failed: " + e.getMessage());
            return result;
        }
    }

    /**
     * Traite un document image (OCR + codes-barres)
     */
    private void processImageDocument(File imageFile, DocumentProcessingResult result) {
        log.info("Processing image document: {}", imageFile.getName());

        // Extraction OCR
        OcrResult ocrResult = ocrService.extractTextFromImage(imageFile);
        result.setOcrResult(ocrResult);

        // Lecture des codes-barres
        BarcodeResult barcodeResult = barcodeService.readBarcodesFromImage(imageFile);
        result.setBarcodeResult(barcodeResult);

        // Détermination du succès
        boolean ocrSuccess = ocrResult.isSuccess() && ocrResult.hasText();
        boolean barcodeSuccess = barcodeResult.isSuccess() && barcodeResult.hasBarcodes();

        result.setSuccess(ocrSuccess || barcodeSuccess);
        result.setExtractedText(ocrResult.getText());
        result.setDetectedLanguage(ocrResult.getLanguage());
        result.setOcrConfidence(ocrResult.getConfidence());

        if (!result.isSuccess()) {
            result.setErrorMessage("No text or barcodes could be extracted from the image");
        }
    }

    /**
     * Traite un document PDF
     */
    private void processPdfDocument(File pdfFile, DocumentProcessingResult result) {
        log.info("Processing PDF document: {}", pdfFile.getName());

        // Extraction PDF
        PdfResult pdfResult = pdfService.extractTextFromPdf(pdfFile);
        result.setPdfResult(pdfResult);

        // Lecture des codes-barres si le PDF contient des images
        if (pdfResult.hasImages()) {
            // Note: Pour les PDF avec images, on pourrait extraire les images et les
            // traiter
            // Pour l'instant, on se contente du texte extrait
            log.info("PDF contains images, barcode detection not yet implemented for PDF images");
        }

        // Détermination du succès
        boolean pdfSuccess = pdfResult.isSuccess() && pdfResult.hasText();
        result.setSuccess(pdfSuccess);
        result.setExtractedText(pdfResult.getText());
        result.setDetectedLanguage(pdfResult.getDetectedLanguage());
        result.setPageCount(pdfResult.getPageCount());

        if (!result.isSuccess()) {
            result.setErrorMessage("No text could be extracted from the PDF");
        }
    }

    /**
     * Analyse le texte extrait avec Ollama
     */
    private void analyzeWithOllama(DocumentProcessingResult result) {
        if (result.getExtractedText() == null || result.getExtractedText().trim().isEmpty()) {
            log.warn("No text to analyze with Ollama");
            return;
        }

        try {
            log.info("Starting Ollama analysis for extracted text ({} chars)", result.getExtractedText().length());

            // Résumé automatique
            OllamaResult summaryResult = ollamaService.summarizeText(result.getExtractedText());
            result.setSummaryResult(summaryResult);

            // Classification du document
            OllamaResult classificationResult = ollamaService.classifyDocument(result.getExtractedText());
            result.setClassificationResult(classificationResult);

            // Extraction d'informations structurées
            OllamaResult extractionResult = ollamaService.extractStructuredInfo(result.getExtractedText());
            result.setStructuredExtractionResult(extractionResult);

            log.info("Ollama analysis completed successfully");

        } catch (Exception e) {
            log.error("Ollama analysis failed: {}", e.getMessage());
            result.setOllamaAnalysisSuccess(false);
            result.setOllamaErrorMessage("Analysis failed: " + e.getMessage());
        }
    }

    /**
     * Détecte le type de fichier
     */
    private String detectFileType(File file) {
        String fileName = file.getName().toLowerCase();

        if (fileName.endsWith(".pdf")) {
            return "pdf";
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ||
                fileName.endsWith(".png") || fileName.endsWith(".gif") ||
                fileName.endsWith(".bmp") || fileName.endsWith(".tiff")) {
            return "image";
        } else {
            return "unknown";
        }
    }

    /**
     * Traite un document depuis des bytes
     */
    public DocumentProcessingResult processDocumentBytes(byte[] documentBytes, String fileName) {
        try {
            log.info("Starting document processing for bytes: {}", fileName);

            DocumentProcessingResult result = new DocumentProcessingResult();
            result.setFileName(fileName);
            result.setFileSize((long) documentBytes.length);
            result.setFileType(detectFileTypeFromName(fileName));

            // Traitement selon le type de fichier
            switch (result.getFileType()) {
                case "image":
                    processImageBytes(documentBytes, fileName, result);
                    break;
                case "pdf":
                    processPdfBytes(documentBytes, fileName, result);
                    break;
                case "unknown":
                    result.setSuccess(false);
                    result.setErrorMessage("Unsupported file type");
                    break;
            }

            // Analyse LLM si du texte a été extrait
            if (result.isSuccess() && result.hasExtractedText()) {
                analyzeWithOllama(result);
            }

            log.info("Document processing completed for {}: {}", fileName, result.getStatus());
            return result;

        } catch (Exception e) {
            log.error("Document processing failed for {}: {}", fileName, e.getMessage());
            DocumentProcessingResult result = new DocumentProcessingResult();
            result.setFileName(fileName);
            result.setSuccess(false);
            result.setErrorMessage("Processing failed: " + e.getMessage());
            return result;
        }
    }

    /**
     * Traite des bytes d'image
     */
    private void processImageBytes(byte[] imageBytes, String fileName, DocumentProcessingResult result) {
        // Extraction OCR
        OcrResult ocrResult = ocrService.extractTextFromImageBytes(imageBytes, fileName);
        result.setOcrResult(ocrResult);

        // Lecture des codes-barres
        BarcodeResult barcodeResult = barcodeService.readBarcodesFromImageBytes(imageBytes, fileName);
        result.setBarcodeResult(barcodeResult);

        // Détermination du succès
        boolean ocrSuccess = ocrResult.isSuccess() && ocrResult.hasText();
        boolean barcodeSuccess = barcodeResult.isSuccess() && barcodeResult.hasBarcodes();

        result.setSuccess(ocrSuccess || barcodeSuccess);
        result.setExtractedText(ocrResult.getText());
        result.setDetectedLanguage(ocrResult.getLanguage());
        result.setOcrConfidence(ocrResult.getConfidence());

        if (!result.isSuccess()) {
            result.setErrorMessage("No text or barcodes could be extracted from the image");
        }
    }

    /**
     * Traite des bytes de PDF
     */
    private void processPdfBytes(byte[] pdfBytes, String fileName, DocumentProcessingResult result) {
        // Extraction PDF
        PdfResult pdfResult = pdfService.extractTextFromPdfBytes(pdfBytes, fileName);
        result.setPdfResult(pdfResult);

        // Détermination du succès
        boolean pdfSuccess = pdfResult.isSuccess() && pdfResult.hasText();
        result.setSuccess(pdfSuccess);
        result.setExtractedText(pdfResult.getText());
        result.setDetectedLanguage(pdfResult.getDetectedLanguage());
        result.setPageCount(pdfResult.getPageCount());

        if (!result.isSuccess()) {
            result.setErrorMessage("No text could be extracted from the PDF");
        }
    }

    /**
     * Détecte le type de fichier depuis le nom
     */
    private String detectFileTypeFromName(String fileName) {
        String lowerFileName = fileName.toLowerCase();

        if (lowerFileName.endsWith(".pdf")) {
            return "pdf";
        } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg") ||
                lowerFileName.endsWith(".png") || lowerFileName.endsWith(".gif") ||
                lowerFileName.endsWith(".bmp") || lowerFileName.endsWith(".tiff")) {
            return "image";
        } else {
            return "unknown";
        }
    }

    /**
     * Obtient le statut de tous les services
     */
    public Map<String, Object> getServicesStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("ocr", Map.of(
                "available", ocrService.isAvailable(),
                "config", ocrService.getConfiguration()));

        status.put("pdf", Map.of(
                "available", pdfService.isAvailable(),
                "config", pdfService.getConfiguration()));

        status.put("barcode", Map.of(
                "available", barcodeService.isAvailable(),
                "config", barcodeService.getConfiguration()));

        status.put("ollama", Map.of(
                "available", ollamaService.isAvailable(),
                "config", ollamaService.getConfiguration()));

        return status;
    }
}
