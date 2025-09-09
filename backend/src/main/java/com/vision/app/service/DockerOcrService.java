package com.vision.app.service;

import com.vision.app.dto.OcrResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.concurrent.TimeUnit;

/**
 * Service OCR utilisant Tesseract via Docker
 */
@Service
@Slf4j
public class DockerOcrService {

    @Value("${tesseract.docker.enabled:true}")
    private boolean dockerEnabled;

    @Value("${tesseract.docker.image:tesseractshadow/tesseract4re}")
    private String dockerImage;

    @Value("${tesseract.language:fra+eng}")
    private String language;

    /**
     * Extrait le texte d'une image en utilisant Tesseract via Docker
     */
    public OcrResult extractTextFromImageBytes(byte[] imageBytes, String fileName) {
        try {
            log.info("🐳 Docker OCR - Traitement de l'image: {}", fileName);

            if (!dockerEnabled || !isDockerAvailable()) {
                log.warn("Docker non disponible - retour du service OCR standard");
                return createFallbackResult(imageBytes, fileName);
            }

            // Créer un fichier temporaire pour l'image
            Path tempImagePath = createTempImage(imageBytes, fileName);
            
            try {
                // Exécuter Tesseract via Docker
                String extractedText = runTesseractDocker(tempImagePath);
                
                // Créer le résultat
                BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
                
                OcrResult result = OcrResult.builder()
                        .text(extractedText.trim())
                        .language(detectLanguage(extractedText))
                        .confidence(calculateConfidence(extractedText))
                        .imageWidth(image != null ? image.getWidth() : 0)
                        .imageHeight(image != null ? image.getHeight() : 0)
                        .fileSize((long) imageBytes.length)
                        .fileName(fileName)
                        .success(true)
                        .build();

                log.info("✅ Docker OCR - Succès pour {}: {} caractères extraits", 
                        fileName, extractedText.length());
                
                return result;
                
            } finally {
                // Nettoyer le fichier temporaire
                cleanupTempFile(tempImagePath);
            }

        } catch (Exception e) {
            log.error("❌ Docker OCR - Erreur pour {}: {}", fileName, e.getMessage(), e);
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Docker OCR failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Vérifie si Docker est disponible
     */
    private boolean isDockerAvailable() {
        try {
            ProcessBuilder pb = new ProcessBuilder("docker", "--version");
            Process process = pb.start();
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            
            if (finished && process.exitValue() == 0) {
                log.debug("✅ Docker est disponible");
                return true;
            } else {
                log.warn("⚠️ Docker n'est pas disponible ou ne répond pas");
                return false;
            }
        } catch (Exception e) {
            log.warn("⚠️ Erreur lors de la vérification de Docker: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Crée un fichier temporaire pour l'image
     */
    private Path createTempImage(byte[] imageBytes, String fileName) throws IOException {
        // Créer le dossier temp s'il n'existe pas
        Path tempDir = Path.of(System.getProperty("java.io.tmpdir"), "tesseract-ocr");
        Files.createDirectories(tempDir);
        
        // Extraire l'extension du fichier
        String extension = getFileExtension(fileName);
        
        // Créer le fichier temporaire
        Path tempFile = tempDir.resolve("ocr_" + System.currentTimeMillis() + "." + extension);
        Files.write(tempFile, imageBytes);
        
        log.debug("📁 Fichier temporaire créé: {}", tempFile);
        return tempFile;
    }

    /**
     * Exécute Tesseract via Docker
     */
    private String runTesseractDocker(Path imagePath) throws IOException, InterruptedException {
        String containerImagePath = "/tmp/" + imagePath.getFileName();
        String outputPath = "/tmp/output";
        
        // Commande Docker pour exécuter Tesseract
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "--rm",
                "-v", imagePath.getParent() + ":/tmp",
                dockerImage,
                "tesseract", containerImagePath, outputPath,
                "-l", language,
                "--psm", "3",
                "--oem", "3"
        );
        
        log.debug("🐳 Exécution de la commande Docker: {}", String.join(" ", pb.command()));
        
        Process process = pb.start();
        
        // Capturer les erreurs
        StringBuilder errorOutput = new StringBuilder();
        try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = errorReader.readLine()) != null) {
                errorOutput.append(line).append("\n");
            }
        }
        
        // Attendre la fin du processus
        boolean finished = process.waitFor(30, TimeUnit.SECONDS);
        
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Docker Tesseract timeout");
        }
        
        if (process.exitValue() != 0) {
            throw new RuntimeException("Docker Tesseract failed: " + errorOutput.toString());
        }
        
        // Lire le résultat
        Path outputFile = imagePath.getParent().resolve("output.txt");
        if (Files.exists(outputFile)) {
            String result = Files.readString(outputFile);
            Files.deleteIfExists(outputFile); // Nettoyer le fichier de sortie
            return result;
        } else {
            throw new RuntimeException("Output file not found");
        }
    }

    /**
     * Nettoie le fichier temporaire
     */
    private void cleanupTempFile(Path tempFile) {
        try {
            Files.deleteIfExists(tempFile);
            log.debug("🗑️ Fichier temporaire supprimé: {}", tempFile);
        } catch (IOException e) {
            log.warn("⚠️ Impossible de supprimer le fichier temporaire: {}", tempFile);
        }
    }

    /**
     * Obtient l'extension du fichier
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : "png";
    }

    /**
     * Détecte la langue du texte (méthode simplifiée)
     */
    private String detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "unknown";
        }
        
        // Détection basique basée sur les caractères français
        long frenchChars = text.chars().filter(c -> "àâäéèêëïîôöùûüÿç".indexOf(c) != -1).count();
        long totalChars = text.chars().filter(Character::isLetter).count();
        
        if (totalChars > 0 && (double) frenchChars / totalChars > 0.1) {
            return "fra";
        } else {
            return "eng";
        }
    }

    /**
     * Calcule un score de confiance approximatif
     */
    private double calculateConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }
        
        long totalChars = text.length();
        long validChars = text.chars().filter(c -> Character.isLetterOrDigit(c) || Character.isWhitespace(c)).count();
        
        return Math.min(1.0, (double) validChars / totalChars);
    }

    /**
     * Crée un résultat de fallback si Docker n'est pas disponible
     */
    private OcrResult createFallbackResult(byte[] imageBytes, String fileName) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            String fallbackText = "Docker OCR non disponible\n" +
                    "Tesseract via Docker requis pour l'extraction réelle.\n" +
                    "Vérifiez que Docker est installé et en cours d'exécution.";

            return OcrResult.builder()
                    .text(fallbackText)
                    .language("fra")
                    .confidence(0.0)
                    .imageWidth(image != null ? image.getWidth() : 0)
                    .imageHeight(image != null ? image.getHeight() : 0)
                    .fileSize((long) imageBytes.length)
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Docker not available")
                    .build();
        } catch (IOException e) {
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Fallback OCR failed: " + e.getMessage())
                    .build();
        }
    }
}
