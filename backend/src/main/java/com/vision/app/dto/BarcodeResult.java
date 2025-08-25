package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BarcodeResult {

    private String fileName;
    private Long fileSize;
    private Integer imageWidth;
    private Integer imageHeight;
    private List<BarcodeInfo> barcodes;
    private Integer barcodeCount;
    private Map<String, Integer> typeCounts;
    private Boolean success;
    private String errorMessage;

    // Méthodes utilitaires
    public boolean hasBarcodes() {
        return barcodes != null && !barcodes.isEmpty();
    }

    public boolean hasQRCodes() {
        return typeCounts != null && typeCounts.containsKey("QR_CODE") && typeCounts.get("QR_CODE") > 0;
    }

    public boolean has1DBarcodes() {
        if (typeCounts == null)
            return false;

        String[] oneDFormats = { "EAN_13", "EAN_8", "UPC_A", "UPC_E", "CODE_128", "CODE_39", "ITF", "CODABAR" };
        for (String format : oneDFormats) {
            if (typeCounts.containsKey(format) && typeCounts.get(format) > 0) {
                return true;
            }
        }
        return false;
    }

    public boolean has2DBarcodes() {
        if (typeCounts == null)
            return false;

        String[] twoDFormats = { "QR_CODE", "DATA_MATRIX", "PDF_417", "AZTEC" };
        for (String format : twoDFormats) {
            if (typeCounts.containsKey(format) && typeCounts.get(format) > 0) {
                return true;
            }
        }
        return false;
    }

    public String getStatus() {
        return success ? "SUCCESS" : "FAILED";
    }

    public int getTotalBarcodes() {
        return barcodeCount != null ? barcodeCount : 0;
    }

    public boolean isSuccess() {
        return success != null && success;
    }
}
