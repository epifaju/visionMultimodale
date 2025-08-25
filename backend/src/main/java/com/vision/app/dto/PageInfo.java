package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageInfo {

    private Integer pageNumber;
    private Float width;
    private Float height;
    private Integer rotation;
    private Integer textLength;
    private Boolean hasText;

    // Méthodes utilitaires
    public boolean hasText() {
        return hasText != null && hasText;
    }

    public boolean isRotated() {
        return rotation != null && rotation != 0;
    }

    public String getOrientation() {
        if (rotation == null)
            return "unknown";
        switch (rotation) {
            case 0:
                return "portrait";
            case 90:
                return "landscape";
            case 180:
                return "portrait";
            case 270:
                return "landscape";
            default:
                return "unknown";
        }
    }

    public float getAspectRatio() {
        if (width == null || height == null || height == 0)
            return 0.0f;
        return width / height;
    }
}
