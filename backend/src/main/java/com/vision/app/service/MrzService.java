package com.vision.app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.vision.app.dto.MrzResult;
import com.vision.app.dto.MrzData;
import com.vision.app.model.DocumentType;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service pour la détection et extraction MRZ (Machine Readable Zone)
 * des passeports et cartes d'identité nationales
 */
@Service
@Slf4j
public class MrzService {

    private final OcrService ocrService;

    @Autowired
    public MrzService(OcrService ocrService) {
        this.ocrService = ocrService;
    }

    // Patterns MRZ pour différents types de documents
    private static final Pattern PASSPORT_PATTERN = Pattern.compile(
            "^[A-Z0-9<]{9}[0-9][A-Z0-9<]{3}[0-9]{6}[A-Z0-9<]{14}[0-9][0-9]$");

    private static final Pattern ID_CARD_PATTERN = Pattern.compile(
            "^[A-Z0-9<]{9}[0-9][A-Z0-9<]{3}[0-9]{6}[A-Z0-9<]{14}[0-9][0-9]$");

    /**
     * Traite un document et extrait les informations MRZ
     */
    public MrzResult processDocument(MultipartFile file) {
        try {
            log.info("Traitement MRZ du document: {}", file.getOriginalFilename());

            // Convertir le fichier en image
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IOException("Impossible de lire l'image");
            }

            // Détecter la zone MRZ
            BufferedImage mrzZone = detectMrzZone(image);
            if (mrzZone == null) {
                return createErrorResult(file.getOriginalFilename(), "Zone MRZ non détectée");
            }

            // Extraire le texte MRZ
            String mrzText = extractMrzText(mrzZone);
            if (mrzText == null || mrzText.trim().isEmpty()) {
                return createErrorResult(file.getOriginalFilename(), "Texte MRZ non extrait");
            }

            // Parser les informations MRZ
            MrzData mrzData = parseMrzData(mrzText);

            log.info("Document MRZ traité avec succès: {}", file.getOriginalFilename());

            return MrzResult.builder()
                    .fileName(file.getOriginalFilename())
                    .success(true)
                    .mrzText(mrzText)
                    .data(mrzData)
                    .build();

        } catch (Exception e) {
            log.error("Erreur lors du traitement MRZ du document {}: {}", file.getOriginalFilename(), e.getMessage());
            return createErrorResult(file.getOriginalFilename(), "Erreur MRZ: " + e.getMessage());
        }
    }

    /**
     * Détecte la zone MRZ dans l'image
     */
    private BufferedImage detectMrzZone(BufferedImage image) {
        try {
            // Pour l'instant, nous utilisons une approche simple
            // En production, on pourrait utiliser OpenCV pour une détection plus précise

            int width = image.getWidth();
            int height = image.getHeight();

            // La zone MRZ est généralement en bas de l'image (derniers 20%)
            int mrzStartY = (int) (height * 0.8);
            int mrzHeight = height - mrzStartY;

            // Extraire la zone MRZ
            return image.getSubimage(0, mrzStartY, width, mrzHeight);

        } catch (Exception e) {
            log.error("Erreur lors de la détection de la zone MRZ: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrait le texte MRZ de l'image
     */
    private String extractMrzText(BufferedImage mrzZone) {
        try {
            // Utiliser le service OCR existant avec des paramètres optimisés pour le MRZ
            // Convertir l'image en bytes pour utiliser le service OCR
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            ImageIO.write(mrzZone, "png", baos);
            byte[] imageBytes = baos.toByteArray();

            // Utiliser le service OCR avec des paramètres MRZ
            com.vision.app.dto.OcrResult ocrResult = ocrService.extractTextFromImageBytes(
                    imageBytes, "mrz_zone.png");

            if (ocrResult.isSuccess()) {
                return cleanMrzText(ocrResult.getText());
            } else {
                log.error("Échec de l'extraction OCR MRZ: {}", ocrResult.getErrorMessage());
                return null;
            }

        } catch (Exception e) {
            log.error("Erreur lors de l'extraction OCR MRZ: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Nettoie le texte MRZ extrait
     */
    private String cleanMrzText(String text) {
        if (text == null)
            return null;

        // Supprimer les caractères non-ASCII et les espaces
        String cleaned = text.replaceAll("[^A-Z0-9<]", "").trim();

        // Supprimer les lignes vides et les caractères de contrôle
        cleaned = cleaned.replaceAll("\\s+", "");

        return cleaned;
    }

    /**
     * Parse les données MRZ extraites
     */
    private MrzData parseMrzData(String mrzText) {
        try {
            // Diviser le texte MRZ en lignes
            String[] lines = mrzText.split("(?<=\\G.{44})");

            if (lines.length < 2) {
                throw new IllegalArgumentException("Format MRZ invalide");
            }

            // Détecter le type de document
            DocumentType documentType = detectDocumentType(lines[0]);

            // Parser selon le type de document
            switch (documentType) {
                case PASSPORT:
                    return parsePassportMrz(lines);
                case ID_CARD:
                    return parseIdCardMrz(lines);
                default:
                    throw new IllegalArgumentException("Type de document non supporté");
            }

        } catch (Exception e) {
            log.error("Erreur lors du parsing MRZ: {}", e.getMessage());
            throw new RuntimeException("Erreur parsing MRZ: " + e.getMessage());
        }
    }

    /**
     * Détecte le type de document basé sur le format MRZ
     */
    private DocumentType detectDocumentType(String firstLine) {
        if (firstLine.startsWith("P")) {
            return DocumentType.PASSPORT;
        } else if (firstLine.startsWith("I") || firstLine.startsWith("A")) {
            return DocumentType.ID_CARD;
        } else {
            return DocumentType.UNKNOWN;
        }
    }

    /**
     * Parse les données MRZ d'un passeport
     */
    private MrzData parsePassportMrz(String[] lines) {
        if (lines.length < 2) {
            throw new IllegalArgumentException("Format passeport MRZ invalide");
        }

        String line1 = lines[0];
        String line2 = lines[1];

        return MrzData.builder()
                .documentType(DocumentType.PASSPORT)
                .issuingCountry(extractIssuingCountry(line1))
                .surname(extractSurname(line1))
                .givenNames(extractGivenNames(line1))
                .documentNumber(extractDocumentNumber(line2))
                .nationality(extractNationality(line2))
                .dateOfBirth(extractDateOfBirth(line2))
                .gender(extractGender(line2))
                .expiryDate(extractExpiryDate(line2))
                .personalNumber(extractPersonalNumber(line2))
                .build();
    }

    /**
     * Parse les données MRZ d'une carte d'identité
     */
    private MrzData parseIdCardMrz(String[] lines) {
        if (lines.length < 2) {
            throw new IllegalArgumentException("Format CNI MRZ invalide");
        }

        String line1 = lines[0];
        String line2 = lines[1];

        return MrzData.builder()
                .documentType(DocumentType.ID_CARD)
                .issuingCountry(extractIssuingCountry(line1))
                .surname(extractSurname(line1))
                .givenNames(extractGivenNames(line1))
                .documentNumber(extractDocumentNumber(line2))
                .nationality(extractNationality(line2))
                .dateOfBirth(extractDateOfBirth(line2))
                .gender(extractGender(line2))
                .expiryDate(extractExpiryDate(line2))
                .personalNumber(extractPersonalNumber(line2))
                .build();
    }

    // Méthodes d'extraction des champs MRZ
    private String extractIssuingCountry(String line) {
        return line.substring(2, 5).replace("<", "");
    }

    private String extractSurname(String line) {
        String surname = line.substring(5, 44).split("<<")[0];
        return surname.replace("<", " ").trim();
    }

    private String extractGivenNames(String line) {
        String[] parts = line.substring(5, 44).split("<<");
        if (parts.length > 1) {
            return parts[1].replace("<", " ").trim();
        }
        return "";
    }

    private String extractDocumentNumber(String line) {
        return line.substring(0, 9).replace("<", "");
    }

    private String extractNationality(String line) {
        return line.substring(10, 13).replace("<", "");
    }

    private String extractDateOfBirth(String line) {
        String dob = line.substring(13, 19);
        return formatDate(dob);
    }

    private String extractGender(String line) {
        String gender = line.substring(20, 21);
        return gender.equals("M") ? "MALE" : gender.equals("F") ? "FEMALE" : "UNSPECIFIED";
    }

    private String extractExpiryDate(String line) {
        String expiry = line.substring(21, 27);
        return formatDate(expiry);
    }

    private String extractPersonalNumber(String line) {
        return line.substring(28, 42).replace("<", "");
    }

    /**
     * Formate une date MRZ (YYMMDD) en format lisible
     */
    private String formatDate(String mrzDate) {
        if (mrzDate == null || mrzDate.length() != 6) {
            return mrzDate;
        }

        try {
            int year = Integer.parseInt(mrzDate.substring(0, 2));
            int month = Integer.parseInt(mrzDate.substring(2, 4));
            int day = Integer.parseInt(mrzDate.substring(4, 6));

            // Ajouter 2000 pour les années 00-99
            year += 2000;

            return String.format("%04d-%02d-%02d", year, month, day);
        } catch (NumberFormatException e) {
            return mrzDate;
        }
    }

    /**
     * Crée un résultat d'erreur
     */
    private MrzResult createErrorResult(String fileName, String errorMessage) {
        return MrzResult.builder()
                .fileName(fileName)
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }

    /**
     * Valide les données MRZ extraites
     */
    public boolean validateMrzData(MrzData mrzData) {
        if (mrzData == null)
            return false;

        // Vérifications de base
        if (mrzData.getDocumentNumber() == null || mrzData.getDocumentNumber().isEmpty()) {
            return false;
        }

        if (mrzData.getSurname() == null || mrzData.getSurname().isEmpty()) {
            return false;
        }

        if (mrzData.getDateOfBirth() == null || mrzData.getDateOfBirth().isEmpty()) {
            return false;
        }

        return true;
    }
}
