package com.vision.app.service;

import com.vision.app.dto.BarcodeResult;
import com.vision.app.dto.BarcodeInfo;
import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BarcodeService {

    /**
     * Lit tous les codes-barres et QR codes d'une image
     */
    public BarcodeResult readBarcodesFromImage(File imageFile) {
        try {
            log.info("Starting barcode reading for file: {}", imageFile.getName());

            BufferedImage image = ImageIO.read(imageFile);
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file: " + imageFile.getName());
            }

            BarcodeResult result = new BarcodeResult();
            result.setFileName(imageFile.getName());
            result.setFileSize(imageFile.length());
            result.setImageWidth(image.getWidth());
            result.setImageHeight(image.getHeight());

            // Lecture des codes-barres
            List<BarcodeInfo> barcodes = readBarcodes(image);
            result.setBarcodes(barcodes);
            result.setBarcodeCount(barcodes.size());

            // Vérification des types détectés
            Map<String, Integer> typeCounts = new HashMap<>();
            for (BarcodeInfo barcode : barcodes) {
                String type = barcode.getFormat();
                typeCounts.put(type, typeCounts.getOrDefault(type, 0) + 1);
            }
            result.setTypeCounts(typeCounts);

            result.setSuccess(true);

            log.info("Barcode reading completed for {}: {} barcodes found",
                    imageFile.getName(), barcodes.size());

            return result;

        } catch (IOException e) {
            log.error("Failed to read image file {}: {}", imageFile.getName(), e.getMessage());
            BarcodeResult result = new BarcodeResult();
            result.setFileName(imageFile.getName());
            result.setSuccess(false);
            result.setErrorMessage("Failed to read image file: " + e.getMessage());
            return result;
        } catch (Exception e) {
            log.error("Unexpected error during barcode reading for {}: {}", imageFile.getName(), e.getMessage());
            BarcodeResult result = new BarcodeResult();
            result.setFileName(imageFile.getName());
            result.setSuccess(false);
            result.setErrorMessage("Unexpected error: " + e.getMessage());
            return result;
        }
    }

    /**
     * Lit les codes-barres depuis des bytes d'image
     */
    public BarcodeResult readBarcodesFromImageBytes(byte[] imageBytes, String fileName) {
        try {
            log.info("Starting barcode reading for image bytes: {}", fileName);

            BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
            if (image == null) {
                throw new IllegalArgumentException("Invalid image data for file: " + fileName);
            }

            BarcodeResult result = new BarcodeResult();
            result.setFileName(fileName);
            result.setFileSize((long) imageBytes.length);
            result.setImageWidth(image.getWidth());
            result.setImageHeight(image.getHeight());

            // Lecture des codes-barres
            List<BarcodeInfo> barcodes = readBarcodes(image);
            result.setBarcodes(barcodes);
            result.setBarcodeCount(barcodes.size());

            // Vérification des types détectés
            Map<String, Integer> typeCounts = new HashMap<>();
            for (BarcodeInfo barcode : barcodes) {
                String type = barcode.getFormat();
                typeCounts.put(type, typeCounts.getOrDefault(type, 0) + 1);
            }
            result.setTypeCounts(typeCounts);

            result.setSuccess(true);

            log.info("Barcode reading completed for {}: {} barcodes found",
                    fileName, barcodes.size());

            return result;

        } catch (Exception e) {
            log.error("Barcode reading failed for {}: {}", fileName, e.getMessage());
            BarcodeResult result = new BarcodeResult();
            result.setFileName(fileName);
            result.setSuccess(false);
            result.setErrorMessage("Barcode reading failed: " + e.getMessage());
            return result;
        }
    }

    /**
     * Lit tous les codes-barres d'une image
     */
    private List<BarcodeInfo> readBarcodes(BufferedImage image) {
        List<BarcodeInfo> barcodes = new ArrayList<>();

        try {
            // Configuration du lecteur
            MultiFormatReader reader = new MultiFormatReader();

            // Lecture avec différents formats
            BarcodeFormat[] formats = {
                    BarcodeFormat.QR_CODE,
                    BarcodeFormat.DATA_MATRIX,
                    BarcodeFormat.PDF_417,
                    BarcodeFormat.AZTEC,
                    BarcodeFormat.CODE_128,
                    BarcodeFormat.CODE_39,
                    BarcodeFormat.EAN_13,
                    BarcodeFormat.EAN_8,
                    BarcodeFormat.UPC_A,
                    BarcodeFormat.UPC_E,
                    BarcodeFormat.ITF,
                    BarcodeFormat.CODABAR
            };

            for (BarcodeFormat format : formats) {
                try {
                    Map<DecodeHintType, Object> hints = new HashMap<>();
                    hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
                    hints.put(DecodeHintType.PURE_BARCODE, Boolean.TRUE);

                    BinaryBitmap binaryBitmap = new BinaryBitmap(
                            new HybridBinarizer(new BufferedImageLuminanceSource(image)));

                    Result result = reader.decode(binaryBitmap, hints);
                    if (result != null) {
                        BarcodeInfo barcodeInfo = new BarcodeInfo();
                        barcodeInfo.setText(result.getText());
                        barcodeInfo.setFormat(result.getBarcodeFormat().toString());
                        barcodeInfo.setConfidence(calculateConfidence(result));

                        // Informations de position
                        ResultPoint[] points = result.getResultPoints();
                        if (points != null && points.length > 0) {
                            barcodeInfo.setTopLeftX((int) points[0].getX());
                            barcodeInfo.setTopLeftY((int) points[0].getY());
                        }

                        barcodes.add(barcodeInfo);
                        log.debug("Found {} barcode: {}", format, result.getText());
                    }
                } catch (NotFoundException e) {
                    // Format non trouvé, continuer avec le suivant
                    continue;
                } catch (Exception e) {
                    log.warn("Error reading {} format: {}", format, e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Error during barcode reading: {}", e.getMessage());
        }

        return barcodes;
    }

    /**
     * Génère un QR code
     */
    public BufferedImage generateQRCode(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            return MatrixToImageWriter.toBufferedImage(bitMatrix);

        } catch (WriterException e) {
            log.error("Failed to generate QR code: {}", e.getMessage());
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    /**
     * Sauvegarde un QR code généré
     */
    public boolean saveQRCode(String text, String filePath, int width, int height) {
        try {
            BufferedImage qrCode = generateQRCode(text, width, height);
            File outputFile = new File(filePath);

            // Créer le répertoire parent si nécessaire
            File parentDir = outputFile.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }

            return ImageIO.write(qrCode, "PNG", outputFile);

        } catch (Exception e) {
            log.error("Failed to save QR code: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Calcule un score de confiance basé sur la qualité du résultat
     */
    private double calculateConfidence(Result result) {
        if (result == null)
            return 0.0;

        double confidence = 0.5; // Base confidence

        // Augmenter la confiance si le texte semble valide
        String text = result.getText();
        if (text != null && !text.trim().isEmpty()) {
            confidence += 0.3;

            // Vérifier la longueur (certains formats ont des contraintes)
            BarcodeFormat format = result.getBarcodeFormat();
            if (format == BarcodeFormat.EAN_13 && text.length() == 13) {
                confidence += 0.2;
            } else if (format == BarcodeFormat.EAN_8 && text.length() == 8) {
                confidence += 0.2;
            } else if (format == BarcodeFormat.UPC_A && text.length() == 12) {
                confidence += 0.2;
            } else if (format == BarcodeFormat.QR_CODE && text.length() > 10) {
                confidence += 0.2;
            }
        }

        return Math.min(confidence, 1.0);
    }

    /**
     * Valide un code-barres selon son format
     */
    public boolean validateBarcode(String text, String format) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }

        try {
            BarcodeFormat barcodeFormat = BarcodeFormat.valueOf(format);

            switch (barcodeFormat) {
                case EAN_13:
                    return text.length() == 13 && text.matches("\\d{13}");
                case EAN_8:
                    return text.length() == 8 && text.matches("\\d{8}");
                case UPC_A:
                    return text.length() == 12 && text.matches("\\d{12}");
                case UPC_E:
                    return text.length() == 8 && text.matches("\\d{8}");
                case CODE_128:
                    return text.length() > 0;
                case CODE_39:
                    return text.matches("[0-9A-Z\\-\\*\\.\\s]+");
                case QR_CODE:
                    return text.length() > 0;
                case DATA_MATRIX:
                    return text.length() > 0;
                default:
                    return text.length() > 0;
            }

        } catch (IllegalArgumentException e) {
            log.warn("Unknown barcode format: {}", format);
            return false;
        }
    }

    /**
     * Vérifie si ZXing est disponible
     */
    public boolean isAvailable() {
        try {
            return MultiFormatReader.class != null;
        } catch (Exception e) {
            log.error("Error checking ZXing availability: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Obtient les informations de configuration ZXing
     */
    public Map<String, Object> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("available", isAvailable());
        config.put("version", "ZXing 3.x");
        config.put("supportedFormats", new String[] {
                "QR_CODE", "DATA_MATRIX", "PDF_417", "AZTEC",
                "CODE_128", "CODE_39", "EAN_13", "EAN_8",
                "UPC_A", "UPC_E", "ITF", "CODABAR"
        });
        config.put("features", new String[] {
                "1D Barcode reading",
                "2D Barcode reading",
                "QR Code generation",
                "Barcode validation"
        });
        return config;
    }
}
