package com.vision.app.service;

import com.vision.app.dto.PdfResult;
import com.vision.app.dto.PageInfo;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDMetadata;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.PDFTextStripperByArea;
import org.springframework.stereotype.Service;

import java.awt.Rectangle;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class PdfService {

    /**
     * Extrait le texte d'un fichier PDF
     */
    public PdfResult extractTextFromPdf(File pdfFile) {
        try (PDDocument document = PDDocument.load(pdfFile)) {
            log.info("Starting PDF text extraction for file: {}", pdfFile.getName());

            PdfResult result = new PdfResult();
            result.setFileName(pdfFile.getName());
            result.setFileSize(pdfFile.length());
            result.setPageCount(document.getNumberOfPages());

            // Extraction du texte
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            result.setText(text);

            // Extraction des métadonnées
            Map<String, Object> metadata = extractMetadata(document);
            result.setMetadata(metadata);

            // Extraction des informations par page
            List<PageInfo> pages = extractPageInfo(document);
            result.setPages(pages);

            // Détection de la langue
            String language = detectLanguage(text);
            result.setDetectedLanguage(language);

            // Vérification si le PDF contient du texte ou des images
            boolean hasText = text != null && !text.trim().isEmpty();
            boolean hasImages = hasImages(document);
            result.setHasText(hasText);
            result.setHasImages(hasImages);

            result.setSuccess(true);

            log.info("PDF text extraction completed for {}: {} pages, {} characters, language: {}",
                    pdfFile.getName(), result.getPageCount(), text.length(), language);

            return result;

        } catch (IOException e) {
            log.error("PDF text extraction failed for {}: {}", pdfFile.getName(), e.getMessage());
            PdfResult result = new PdfResult();
            result.setFileName(pdfFile.getName());
            result.setSuccess(false);
            result.setErrorMessage("PDF extraction failed: " + e.getMessage());
            return result;
        } catch (Exception e) {
            log.error("Unexpected error during PDF extraction for {}: {}", pdfFile.getName(), e.getMessage());
            PdfResult result = new PdfResult();
            result.setFileName(pdfFile.getName());
            result.setSuccess(false);
            result.setErrorMessage("Unexpected error: " + e.getMessage());
            return result;
        }
    }

    /**
     * Extrait le texte d'un PDF depuis des bytes
     */
    public PdfResult extractTextFromPdfBytes(byte[] pdfBytes, String fileName) {
        try (InputStream inputStream = new java.io.ByteArrayInputStream(pdfBytes);
                PDDocument document = PDDocument.load(inputStream)) {

            log.info("Starting PDF text extraction for bytes: {}", fileName);

            PdfResult result = new PdfResult();
            result.setFileName(fileName);
            result.setFileSize((long) pdfBytes.length);
            result.setPageCount(document.getNumberOfPages());

            // Extraction du texte
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            result.setText(text);

            // Extraction des métadonnées
            Map<String, Object> metadata = extractMetadata(document);
            result.setMetadata(metadata);

            // Extraction des informations par page
            List<PageInfo> pages = extractPageInfo(document);
            result.setPages(pages);

            // Détection de la langue
            String language = detectLanguage(text);
            result.setDetectedLanguage(language);

            // Vérification du contenu
            boolean hasText = text != null && !text.trim().isEmpty();
            boolean hasImages = hasImages(document);
            result.setHasText(hasText);
            result.setHasImages(hasImages);

            result.setSuccess(true);

            log.info("PDF text extraction completed for {}: {} pages, {} characters, language: {}",
                    fileName, result.getPageCount(), text.length(), language);

            return result;

        } catch (Exception e) {
            log.error("PDF text extraction failed for {}: {}", fileName, e.getMessage());
            PdfResult result = new PdfResult();
            result.setFileName(fileName);
            result.setSuccess(false);
            result.setErrorMessage("PDF extraction failed: " + e.getMessage());
            return result;
        }
    }

    /**
     * Extrait le texte d'une page spécifique
     */
    public String extractTextFromPage(File pdfFile, int pageNumber) {
        try (PDDocument document = PDDocument.load(pdfFile)) {
            if (pageNumber < 0 || pageNumber >= document.getNumberOfPages()) {
                throw new IllegalArgumentException("Invalid page number: " + pageNumber);
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setStartPage(pageNumber + 1);
            stripper.setEndPage(pageNumber + 1);

            return stripper.getText(document);

        } catch (IOException e) {
            log.error("Failed to extract text from page {} of {}: {}", pageNumber, pdfFile.getName(), e.getMessage());
            throw new RuntimeException("Page extraction failed", e);
        }
    }

    /**
     * Extrait le texte d'une zone spécifique d'une page
     */
    public String extractTextFromArea(File pdfFile, int pageNumber, Rectangle area) {
        try (PDDocument document = PDDocument.load(pdfFile)) {
            if (pageNumber < 0 || pageNumber >= document.getNumberOfPages()) {
                throw new IllegalArgumentException("Invalid page number: " + pageNumber);
            }

            PDFTextStripperByArea stripper = new PDFTextStripperByArea();
            stripper.addRegion("area", area);
            stripper.extractRegions(document.getPage(pageNumber));

            return stripper.getTextForRegion("area");

        } catch (IOException e) {
            log.error("Failed to extract text from area of page {} of {}: {}", pageNumber, pdfFile.getName(),
                    e.getMessage());
            throw new RuntimeException("Area extraction failed", e);
        }
    }

    /**
     * Extrait les métadonnées du PDF
     */
    private Map<String, Object> extractMetadata(PDDocument document) {
        Map<String, Object> metadata = new HashMap<>();

        try {
            // Informations de base
            metadata.put("title", document.getDocumentInformation().getTitle());
            metadata.put("author", document.getDocumentInformation().getAuthor());
            metadata.put("subject", document.getDocumentInformation().getSubject());
            metadata.put("creator", document.getDocumentInformation().getCreator());
            metadata.put("producer", document.getDocumentInformation().getProducer());
            metadata.put("creationDate", document.getDocumentInformation().getCreationDate());
            metadata.put("modificationDate", document.getDocumentInformation().getModificationDate());
            metadata.put("keywords", document.getDocumentInformation().getKeywords());

            // Informations techniques
            metadata.put("version", document.getVersion());
            metadata.put("encrypted", document.isEncrypted());
            metadata.put("numberOfPages", document.getNumberOfPages());

            // Métadonnées XMP si disponibles
            PDMetadata xmpMetadata = document.getDocumentCatalog().getMetadata();
            if (xmpMetadata != null) {
                metadata.put("hasXmpMetadata", true);
                // Ici on pourrait parser le XML XMP pour plus de détails
            } else {
                metadata.put("hasXmpMetadata", false);
            }

        } catch (Exception e) {
            log.warn("Failed to extract some metadata: {}", e.getMessage());
        }

        return metadata;
    }

    /**
     * Extrait les informations de chaque page
     */
    private List<PageInfo> extractPageInfo(PDDocument document) {
        List<PageInfo> pages = new ArrayList<>();

        try {
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                PDPage page = document.getPage(i);
                PageInfo pageInfo = new PageInfo();

                pageInfo.setPageNumber(i);
                pageInfo.setWidth(page.getMediaBox().getWidth());
                pageInfo.setHeight(page.getMediaBox().getHeight());
                pageInfo.setRotation(page.getRotation());

                // Extraction du texte de la page
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setStartPage(i + 1);
                stripper.setEndPage(i + 1);
                String pageText = stripper.getText(document);
                pageInfo.setTextLength(pageText.length());
                pageInfo.setHasText(!pageText.trim().isEmpty());

                pages.add(pageInfo);
            }
        } catch (Exception e) {
            log.warn("Failed to extract some page information: {}", e.getMessage());
        }

        return pages;
    }

    /**
     * Vérifie si le PDF contient des images
     */
    private boolean hasImages(PDDocument document) {
        try {
            for (PDPage page : document.getPages()) {
                if (page.getResources() != null && page.getResources().getXObjectNames() != null) {
                    for (org.apache.pdfbox.cos.COSName name : page.getResources().getXObjectNames()) {
                        try {
                            if (page.getResources().getXObject(name) instanceof PDImageXObject) {
                                return true;
                            }
                        } catch (Exception e) {
                            // Ignorer les erreurs pour certains types d'objets
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to check for images: {}", e.getMessage());
        }
        return false;
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
     * Vérifie si PDFBox est disponible
     */
    public boolean isAvailable() {
        try {
            return PDDocument.class != null;
        } catch (Exception e) {
            log.error("Error checking PDFBox availability: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Obtient les informations de configuration PDFBox
     */
    public Map<String, Object> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("available", isAvailable());
        config.put("version", "PDFBox 2.x");
        config.put("features", new String[] {
                "Text extraction",
                "Metadata extraction",
                "Page information",
                "Image detection",
                "Area extraction"
        });
        return config;
    }
}
