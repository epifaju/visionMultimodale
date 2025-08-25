package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentProcessingResult {

    private String fileName;
    private Long fileSize;
    private String fileType;
    private Boolean success;
    private String errorMessage;

    // Texte extrait
    private String extractedText;
    private String detectedLanguage;
    private Double ocrConfidence;
    private Integer pageCount;

    // Résultats des services
    private OcrResult ocrResult;
    private PdfResult pdfResult;
    private BarcodeResult barcodeResult;

    // Résultats Ollama
    private OllamaResult summaryResult;
    private OllamaResult classificationResult;
    private OllamaResult structuredExtractionResult;
    private Boolean ollamaAnalysisSuccess = true;
    private String ollamaErrorMessage;

    // Méthodes utilitaires
    public boolean hasExtractedText() {
        return extractedText != null && !extractedText.trim().isEmpty();
    }

    public boolean hasOcrResult() {
        return ocrResult != null && ocrResult.isSuccess();
    }

    public boolean hasPdfResult() {
        return pdfResult != null && pdfResult.isSuccess();
    }

    public boolean hasBarcodeResult() {
        return barcodeResult != null && barcodeResult.isSuccess();
    }

    public boolean hasOllamaResults() {
        return summaryResult != null || classificationResult != null || structuredExtractionResult != null;
    }

    public String getStatus() {
        return success ? "SUCCESS" : "FAILED";
    }

    public int getExtractedTextLength() {
        return hasExtractedText() ? extractedText.length() : 0;
    }

    public boolean isImageDocument() {
        return "image".equals(fileType);
    }

    public boolean isPdfDocument() {
        return "pdf".equals(fileType);
    }

    public boolean isSuccess() {
        return success != null && success;
    }

    public boolean isMultiPage() {
        return pageCount != null && pageCount > 1;
    }

    public String getProcessingSummary() {
        if (!success) {
            return "Processing failed: " + errorMessage;
        }

        StringBuilder summary = new StringBuilder();
        summary.append("Document processed successfully. ");

        if (hasExtractedText()) {
            summary.append("Text extracted: ").append(getExtractedTextLength()).append(" characters. ");
        }

        if (isMultiPage()) {
            summary.append("Pages: ").append(pageCount).append(". ");
        }

        if (hasOllamaResults()) {
            summary.append("AI analysis completed. ");
        }

        if (hasBarcodeResult() && barcodeResult.hasBarcodes()) {
            summary.append("Barcodes detected: ").append(barcodeResult.getTotalBarcodes()).append(". ");
        }

        return summary.toString();
    }
}
