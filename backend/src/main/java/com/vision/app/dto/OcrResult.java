package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrResult {

    private String text;
    private String language;
    private Double confidence;
    private Integer imageWidth;
    private Integer imageHeight;
    private Long fileSize;
    private String fileName;
    private Boolean success;
    private String errorMessage;

    // Méthodes utilitaires
    public boolean hasText() {
        return text != null && !text.trim().isEmpty();
    }

    public int getTextLength() {
        return hasText() ? text.length() : 0;
    }

    public double getConfidencePercentage() {
        return confidence != null ? confidence * 100 : 0.0;
    }

    public String getStatus() {
        return success ? "SUCCESS" : "FAILED";
    }

    public boolean isSuccess() {
        return success != null && success;
    }
}
