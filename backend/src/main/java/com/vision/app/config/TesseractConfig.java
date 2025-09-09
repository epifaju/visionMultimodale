package com.vision.app.config;

import net.sourceforge.tess4j.Tesseract;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration pour Tesseract OCR
 * Note: Cette configuration est désactivée pour éviter les conflits d'initialisation
 * L'initialisation de Tesseract est gérée directement dans OcrService
 */
@Configuration
public class TesseractConfig {

    @Value("${tesseract.data.path:./tessdata}")
    private String tessDataPath;

    @Value("${tesseract.language:fra+eng}")
    private String language;

    /**
     * Bean Tesseract principal utilisé par tous les services OCR
     * Désactivé pour éviter les conflits d'initialisation
     */
    // @Bean
    // @Primary
    public Tesseract tesseract() {
        Tesseract tesseract = new Tesseract();

        // Configuration du chemin des données
        if (tessDataPath != null && !tessDataPath.isEmpty()) {
            tesseract.setDatapath(tessDataPath);
        }

        // Configuration de la langue
        if (language != null && !language.isEmpty()) {
            tesseract.setLanguage(language);
        }

        // Configuration des paramètres OCR
        tesseract.setPageSegMode(3); // Mode automatique de segmentation de page
        tesseract.setOcrEngineMode(3); // Mode moteur OCR par défaut

        return tesseract;
    }

}
