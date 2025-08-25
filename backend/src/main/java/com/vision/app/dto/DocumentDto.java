package com.vision.app.dto;

import com.vision.app.model.ProcessingStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {

    private Long id;
    private String fileName;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String extractedText;
    private Double ocrConfidence;
    private String detectedLanguage;
    private ProcessingStatus status;
    private String processingErrors;
    private String metadata;
    private Long uploadedById;
    private String uploadedByUsername;
    private LocalDateTime uploadedAt;
    private LocalDateTime processedAt;
    private LocalDateTime updatedAt;
}
