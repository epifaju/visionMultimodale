package com.vision.app.service;

import com.vision.app.dto.OcrResult;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class OcrService {

    @Value("${tesseract.data.path:./tessdata}")
    private String tessDataPath;

    @Value("${tesseract.language:fra+eng}")
    private String language;

    private Tesseract tesseract;

    public OcrService() {
        initializeTesseract();
    }

    private void initializeTesseract() {
        try {
            tesseract = new Tesseract();
            tesseract.setDatapath(tessDataPath);
            tesseract.setLanguage(language);
            tesseract.setPageSegMode(1); // Automatic page segmentation
            tesseract.setOcrEngineMode(1); // Neural nets LSTM engine

            log.info("Tesseract initialized with language: {} and data path: {}", language, tessDataPath);
        } catch (Exception e) {
            log.error("Failed to initialize Tesseract: {}", e.getMessage());
            throw new RuntimeException("Tesseract initialization failed", e);
        }
    }

    /**
     * Extrait le texte d'une image avec détection automatique de langue
     */
    public OcrResult extractTextFromImage(File imageFile) {
        try {
            log.info("Starting OCR extraction for file: {}", imageFile.getName());

            BufferedImage image = ImageIO.read(imageFile);
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file: " + imageFile.getName());
            }

            // Extraction du texte
            String extractedText = tesseract.doOCR(image);

            // Détection de la langue (basée sur la configuration)
            String detectedLanguage = detectLanguage(extractedText);

            // Calcul de la confiance (approximatif)
            double confidence = calculateConfidence(extractedText);

            OcrResult result = OcrResult.builder()
                    .text(extractedText.trim())
                    .language(detectedLanguage)
                    .confidence(confidence)
                    .imageWidth(image.getWidth())
                    .imageHeight(image.getHeight())
                    .fileSize(imageFile.length())
                    .fileName(imageFile.getName())
                    .success(true)
                    .build();

            log.info("OCR extraction completed for {}: {} characters, language: {}, confidence: {}%",
                    imageFile.getName(), extractedText.length(), detectedLanguage,
                    String.format("%.1f", confidence * 100));

            return result;

        } catch (TesseractException e) {
            log.error("OCR extraction failed for {}: {}", imageFile.getName(), e.getMessage());
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("OCR extraction failed: " + e.getMessage())
                    .build();
        } catch (IOException e) {
            log.error("Failed to read image file {}: {}", imageFile.getName(), e.getMessage());
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("Failed to read image file: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error during OCR extraction for {}: {}", imageFile.getName(), e.getMessage());
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Extrait le texte d'une image depuis un chemin de fichier
     */
    public OcrResult extractTextFromImage(String imagePath) {
        File imageFile = new File(imagePath);
        if (!imageFile.exists()) {
            return OcrResult.builder()
                    .fileName(imagePath)
                    .success(false)
                    .errorMessage("Image file not found: " + imagePath)
                    .build();
        }
        return extractTextFromImage(imageFile);
    }

    /**
     * Extrait le texte d'une image depuis des bytes
     */
    public OcrResult extractTextFromImageBytes(byte[] imageBytes, String fileName) {
        try {
            log.info("Starting OCR extraction for image bytes: {}", fileName);

            BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
            if (image == null) {
                throw new IllegalArgumentException("Invalid image data for file: " + fileName);
            }

            // Extraction du texte
            String extractedText = tesseract.doOCR(image);

            // Détection de la langue
            String detectedLanguage = detectLanguage(extractedText);

            // Calcul de la confiance
            double confidence = calculateConfidence(extractedText);

            OcrResult result = OcrResult.builder()
                    .text(extractedText.trim())
                    .language(detectedLanguage)
                    .confidence(confidence)
                    .imageWidth(image.getWidth())
                    .imageHeight(image.getHeight())
                    .fileSize((long) imageBytes.length)
                    .fileName(fileName)
                    .success(true)
                    .build();

            log.info("OCR extraction completed for {}: {} characters, language: {}, confidence: {}%",
                    fileName, extractedText.length(), detectedLanguage,
                    String.format("%.1f", confidence * 100));

            return result;

        } catch (Exception e) {
            log.error("OCR extraction failed for {}: {}", fileName, e.getMessage());
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("OCR extraction failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Détecte la langue du texte extrait (basique)
     */
    private String detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "unknown";
        }

        // Détection basique basée sur les caractères
        int frenchChars = countFrenchCharacters(text);
        int englishChars = countEnglishCharacters(text);

        if (frenchChars > englishChars) {
            return "fra";
        } else if (englishChars > frenchChars) {
            return "eng";
        } else {
            return "fra+eng"; // Mixte
        }
    }

    /**
     * Compte les caractères français dans le texte
     */
    private int countFrenchCharacters(String text) {
        int count = 0;
        for (char c : text.toLowerCase().toCharArray()) {
            if ("àâäéèêëïîôöùûüÿç".indexOf(c) != -1) {
                count++;
            }
        }
        return count;
    }

    /**
     * Compte les caractères anglais dans le texte
     */
    private int countEnglishCharacters(String text) {
        int count = 0;
        for (char c : text.toLowerCase().toCharArray()) {
            if (Character.isLetter(c) && "àâäéèêëïîôöùûüÿç".indexOf(c) == -1) {
                count++;
            }
        }
        return count;
    }

    /**
     * Calcule un score de confiance approximatif basé sur la qualité du texte
     */
    private double calculateConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }

        int totalChars = text.length();
        int validChars = 0;
        int wordCount = 0;
        boolean inWord = false;

        for (char c : text.toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                validChars++;
                if (!inWord) {
                    wordCount++;
                    inWord = true;
                }
            } else if (Character.isWhitespace(c)) {
                inWord = false;
            }
        }

        // Score basé sur la proportion de caractères valides et le nombre de mots
        double charConfidence = (double) validChars / totalChars;
        double wordConfidence = Math.min((double) wordCount / Math.max(1, totalChars / 10), 1.0);

        return (charConfidence * 0.7 + wordConfidence * 0.3);
    }

    /**
     * Vérifie si Tesseract est correctement configuré
     */
    public boolean isAvailable() {
        try {
            return tesseract != null && new File(tessDataPath).exists();
        } catch (Exception e) {
            log.error("Error checking Tesseract availability: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Obtient les informations de configuration Tesseract
     */
    public Map<String, Object> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("tessDataPath", tessDataPath);
        config.put("language", language);
        config.put("available", isAvailable());
        config.put("version", tesseract != null ? "Tesseract 4.x" : "Not initialized");
        return config;
    }
}
