package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PdfResult {

    private String fileName;
    private Long fileSize;
    private Integer pageCount;
    private String text;
    private String detectedLanguage;
    private Boolean hasText;
    private Boolean hasImages;
    private Boolean success;
    private String errorMessage;
    private Map<String, Object> metadata;
    private List<PageInfo> pages;

    // Méthodes utilitaires
    public boolean hasText() {
        return hasText != null && hasText;
    }

    public boolean hasImages() {
        return hasImages != null && hasImages;
    }

    public int getTextLength() {
        return text != null ? text.length() : 0;
    }

    public String getStatus() {
        return success ? "SUCCESS" : "FAILED";
    }

    public boolean isMultiPage() {
        return pageCount != null && pageCount > 1;
    }

    public boolean isSuccess() {
        return success != null && success;
    }
}
