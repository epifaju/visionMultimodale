package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BarcodeInfo {

    private String text;
    private String format;
    private Double confidence;
    private Integer topLeftX;
    private Integer topLeftY;

    // Méthodes utilitaires
    public boolean hasText() {
        return text != null && !text.trim().isEmpty();
    }

    public double getConfidencePercentage() {
        return confidence != null ? confidence * 100 : 0.0;
    }

    public boolean isQRCode() {
        return "QR_CODE".equals(format);
    }

    public boolean is1DBarcode() {
        if (format == null)
            return false;

        String[] oneDFormats = { "EAN_13", "EAN_8", "UPC_A", "UPC_E", "CODE_128", "CODE_39", "ITF", "CODABAR" };
        for (String oneDFormat : oneDFormats) {
            if (oneDFormat.equals(format)) {
                return true;
            }
        }
        return false;
    }

    public boolean is2DBarcode() {
        if (format == null)
            return false;

        String[] twoDFormats = { "QR_CODE", "DATA_MATRIX", "PDF_417", "AZTEC" };
        for (String twoDFormat : twoDFormats) {
            if (twoDFormat.equals(format)) {
                return true;
            }
        }
        return false;
    }

    public boolean hasPosition() {
        return topLeftX != null && topLeftY != null;
    }

    public String getType() {
        if (isQRCode())
            return "QR Code";
        if (is1DBarcode())
            return "1D Barcode";
        if (is2DBarcode())
            return "2D Barcode";
        return "Unknown";
    }
}
