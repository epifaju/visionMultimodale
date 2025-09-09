package com.vision.app.service;

import com.vision.app.dto.OcrResult;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class OcrService {

    @Value("${tesseract.data.path:./tessdata}")
    private String tessDataPath;

    @Value("${tesseract.language:fra+eng}")
    private String language;

    private Tesseract tesseract;
    private boolean tesseractAvailable = false;

    public OcrService() {
        // Ne pas initialiser Tesseract dans le constructeur
        // L'initialisation sera faite de manière paresseuse
    }

    private void initializeTesseract() {
        if (tesseract != null) {
            return; // Déjà initialisé
        }
        
        try {
            log.info("🔧 Initializing Tesseract OCR...");
            tesseract = new Tesseract();
            
            // Essayer d'initialiser Tesseract avec des paramètres par défaut appropriés
            String actualDataPath = findOrCreateTessData();
            
            if (actualDataPath == null) {
                log.warn("Aucun chemin tessdata valide trouvé - tentative d'utilisation des paramètres par défaut");
                // Essayer sans définir de datapath explicite - Tesseract utilisera ses valeurs par défaut
                tesseract.setLanguage("eng"); // Commencer avec l'anglais qui est généralement disponible
            } else {
                tesseract.setDatapath(actualDataPath);
                tesseract.setLanguage(language);
                log.info("Tesseract configured with data path: {}", actualDataPath);
            }
            
            // Configuration optimisée pour de meilleurs résultats
            tesseract.setPageSegMode(3); // Fully automatic page segmentation, but no OSD
            tesseract.setOcrEngineMode(3); // Default, based on what is available
            
            // Tester Tesseract avec une image simple
            if (testTesseractInstallation()) {
                tesseractAvailable = true;
                log.info("✅ Tesseract initialized successfully with language: {}", 
                        actualDataPath != null ? language : "eng");
            } else {
                log.warn("⚠️ Tesseract test failed - falling back to mock mode");
                tesseract = null;
                tesseractAvailable = false;
            }
            
        } catch (Exception e) {
            log.error("Failed to initialize Tesseract: {}", e.getMessage(), e);
            log.warn("Tesseract initialization failed - OCR will return mock data");
            tesseract = null;
            tesseractAvailable = false;
        }
    }

    /**
     * Trouve ou crée le répertoire tessdata approprié
     */
    private String findOrCreateTessData() {
        if (System.getProperty("os.name").toLowerCase().contains("windows")) {
            // Sur Windows, essayer plusieurs chemins possibles
            String[] possiblePaths = {
                "C:\\Program Files\\Tesseract-OCR\\tessdata",
                "C:\\Program Files (x86)\\Tesseract-OCR\\tessdata",
                System.getenv("TESSDATA_PREFIX"),
                "./tessdata",
                tessDataPath
            };
            
            for (String path : possiblePaths) {
                if (path != null && new File(path).exists() && new File(path, "eng.traineddata").exists()) {
                    log.info("✅ Found valid tessdata at: {}", path);
                    return path;
                }
            }
            
            // Essayer de créer un dossier tessdata local avec des données minimales
            return createLocalTessData();
        } else {
            // Sur Linux/Mac, utiliser les chemins standards
            String[] possiblePaths = {
                "/usr/share/tesseract-ocr/4.00/tessdata",
                "/usr/share/tesseract-ocr/tessdata",
                "/usr/local/share/tessdata",
                "./tessdata",
                tessDataPath
            };
            
            for (String path : possiblePaths) {
                if (path != null && new File(path).exists()) {
                    return path;
                }
            }
        }
        
        return null;
    }

    /**
     * Crée un dossier tessdata local avec des données minimales
     */
    private String createLocalTessData() {
        try {
            File tessDataDir = new File("./tessdata");
            if (!tessDataDir.exists()) {
                tessDataDir.mkdirs();
                log.info("📁 Created local tessdata directory: {}", tessDataDir.getAbsolutePath());
            }
            
            // Vérifier si eng.traineddata existe
            File engFile = new File(tessDataDir, "eng.traineddata");
            if (!engFile.exists()) {
                log.warn("❌ eng.traineddata not found in local tessdata");
                log.info("💡 Pour utiliser Tesseract, veuillez:");
                log.info("   1. Installer Tesseract: https://github.com/UB-Mannheim/tesseract/wiki");
                log.info("   2. Ou copier les fichiers .traineddata dans: {}", tessDataDir.getAbsolutePath());
                return null;
            }
            
            return tessDataDir.getAbsolutePath();
        } catch (Exception e) {
            log.error("Failed to create local tessdata: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Teste l'installation Tesseract avec une image simple
     */
    private boolean testTesseractInstallation() {
        try {
            // Créer une image de test simple (rectangle blanc avec du texte noir)
            BufferedImage testImage = new BufferedImage(200, 50, BufferedImage.TYPE_INT_RGB);
            java.awt.Graphics2D g2d = testImage.createGraphics();
            g2d.setColor(java.awt.Color.WHITE);
            g2d.fillRect(0, 0, 200, 50);
            g2d.setColor(java.awt.Color.BLACK);
            g2d.setFont(new java.awt.Font("Arial", java.awt.Font.PLAIN, 20));
            g2d.drawString("TEST", 50, 30);
            g2d.dispose();
            
            // Tenter l'OCR sur cette image de test
            String result = tesseract.doOCR(testImage);
            boolean success = result != null && result.toLowerCase().contains("test");
            
            if (success) {
                log.debug("✅ Tesseract test passed: '{}'", result.trim());
            } else {
                log.warn("⚠️ Tesseract test failed: '{}'", result);
            }
            
            return success;
        } catch (Error e) {
            // Capturer spécifiquement les erreurs de mémoire JNA
            log.error("❌ Tesseract memory access error: {}", e.getMessage());
            log.warn("This usually indicates Tesseract is not properly installed or configured");
            return false;
        } catch (Exception e) {
            log.warn("⚠️ Tesseract test error: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extrait le texte d'une image avec détection automatique de langue
     */
    public OcrResult extractTextFromImage(File imageFile) {
        try {
            log.info("Starting OCR extraction for file: {}", imageFile.getName());

            // Initialiser Tesseract de manière paresseuse si nécessaire
            if (tesseract == null) {
                initializeTesseract();
            }

            // Vérifier si Tesseract est disponible
            if (tesseract == null || !tesseractAvailable) {
                log.warn("Tesseract not available - returning mock OCR result");
                return createMockOcrResult(imageFile);
            }

            BufferedImage image = ImageIO.read(imageFile);
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file: " + imageFile.getName());
            }

            // Extraction du texte
            String extractedText = tesseract.doOCR(image);

            // Détection de la langue (basée sur la configuration)
            String detectedLanguage = detectLanguage(extractedText);

            // Calcul de la confiance (approximatif)
            double confidence = calculateConfidence(extractedText);

            OcrResult result = OcrResult.builder()
                    .text(extractedText.trim())
                    .language(detectedLanguage)
                    .confidence(confidence)
                    .imageWidth(image.getWidth())
                    .imageHeight(image.getHeight())
                    .fileSize(imageFile.length())
                    .fileName(imageFile.getName())
                    .success(true)
                    .build();

            log.info("OCR extraction completed for {}: {} characters, language: {}, confidence: {}%",
                    imageFile.getName(), extractedText.length(), detectedLanguage,
                    String.format("%.1f", confidence * 100));

            return result;

        } catch (TesseractException e) {
            log.error("OCR extraction failed for {}: {}", imageFile.getName(), e.getMessage());
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("OCR extraction failed: " + e.getMessage())
                    .build();
        } catch (IOException e) {
            log.error("Failed to read image file {}: {}", imageFile.getName(), e.getMessage());
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("Failed to read image file: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error during OCR extraction for {}: {}", imageFile.getName(), e.getMessage());
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Extrait le texte d'une image depuis un chemin de fichier
     */
    public OcrResult extractTextFromImage(String imagePath) {
        File imageFile = new File(imagePath);
        if (!imageFile.exists()) {
            return OcrResult.builder()
                    .fileName(imagePath)
                    .success(false)
                    .errorMessage("Image file not found: " + imagePath)
                    .build();
        }
        return extractTextFromImage(imageFile);
    }

    /**
     * Extrait le texte d'une image depuis des bytes
     */
    public OcrResult extractTextFromImageBytes(byte[] imageBytes, String fileName) {
        try {
            log.info("Starting OCR extraction for image bytes: {}", fileName);

            // Essayer d'abord Docker, puis fallback vers Tesseract local
            OcrResult dockerResult = extractWithDocker(imageBytes, fileName);
            if (dockerResult.isSuccess()) {
                return dockerResult;
            }

            // Initialiser Tesseract de manière paresseuse si nécessaire
            if (tesseract == null) {
                initializeTesseract();
            }

            // Fallback vers Tesseract local si disponible
            if (tesseract != null && tesseractAvailable) {
                log.info("Docker failed, trying local Tesseract for: {}", fileName);
                return extractWithLocalTesseract(imageBytes, fileName);
            }

            // Si rien ne fonctionne, retourner le résultat Docker avec l'erreur
            log.warn("Neither Docker nor local Tesseract available - returning Docker error");
            return dockerResult;

        } catch (Exception e) {
            log.error("OCR extraction failed for {}: {}", fileName, e.getMessage());
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("OCR extraction failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Extraction OCR via Docker
     */
    private OcrResult extractWithDocker(byte[] imageBytes, String fileName) {
        try {
            log.info("🐳 Trying Docker OCR for: {}", fileName);

            // Vérifier si Docker est disponible
            if (!isDockerAvailable()) {
                return OcrResult.builder()
                        .fileName(fileName)
                        .success(false)
                        .errorMessage("Docker not available")
                        .build();
            }

            // Créer un fichier temporaire
            Path tempDir = Files.createTempDirectory("tesseract-ocr");
            String extension = getFileExtension(fileName);
            Path tempImageFile = tempDir.resolve("input." + extension);
            Files.write(tempImageFile, imageBytes);

            try {
                // Exécuter Tesseract via Docker
                String extractedText = runTesseractDocker(tempImageFile);
                
                // Créer le résultat
                BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
                
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

                log.info("✅ Docker OCR successful for {}: {} characters extracted", 
                        fileName, extractedText.length());
                
                return result;
                
            } finally {
                // Nettoyer les fichiers temporaires
                cleanupTempDirectory(tempDir);
            }

        } catch (Exception e) {
            log.warn("🐳 Docker OCR failed for {}: {}", fileName, e.getMessage());
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Docker OCR failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Extraction OCR avec Tesseract local (fallback)
     */
    private OcrResult extractWithLocalTesseract(byte[] imageBytes, String fileName) {
        try {
            BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
            if (image == null) {
                throw new IllegalArgumentException("Invalid image data for file: " + fileName);
            }

            // Extraction du texte
            String extractedText = tesseract.doOCR(image);

            // Détection de la langue
            String detectedLanguage = detectLanguage(extractedText);

            // Calcul de la confiance
            double confidence = calculateConfidence(extractedText);

            OcrResult result = OcrResult.builder()
                    .text(extractedText.trim())
                    .language(detectedLanguage)
                    .confidence(confidence)
                    .imageWidth(image.getWidth())
                    .imageHeight(image.getHeight())
                    .fileSize((long) imageBytes.length)
                    .fileName(fileName)
                    .success(true)
                    .build();

            log.info("✅ Local Tesseract successful for {}: {} characters extracted", 
                    fileName, extractedText.length());

            return result;

        } catch (Exception e) {
            log.error("Local Tesseract failed for {}: {}", fileName, e.getMessage());
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Local Tesseract failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Détecte la langue du texte extrait (basique)
     */
    private String detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "unknown";
        }

        // Détection basique basée sur les caractères
        int frenchChars = countFrenchCharacters(text);
        int englishChars = countEnglishCharacters(text);

        if (frenchChars > englishChars) {
            return "fra";
        } else if (englishChars > frenchChars) {
            return "eng";
        } else {
            return "fra+eng"; // Mixte
        }
    }

    /**
     * Compte les caractères français dans le texte
     */
    private int countFrenchCharacters(String text) {
        int count = 0;
        for (char c : text.toLowerCase().toCharArray()) {
            if ("àâäéèêëïîôöùûüÿç".indexOf(c) != -1) {
                count++;
            }
        }
        return count;
    }

    /**
     * Compte les caractères anglais dans le texte
     */
    private int countEnglishCharacters(String text) {
        int count = 0;
        for (char c : text.toLowerCase().toCharArray()) {
            if (Character.isLetter(c) && "àâäéèêëïîôöùûüÿç".indexOf(c) == -1) {
                count++;
            }
        }
        return count;
    }

    /**
     * Calcule un score de confiance approximatif basé sur la qualité du texte
     */
    private double calculateConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }

        int totalChars = text.length();
        int validChars = 0;
        int wordCount = 0;
        boolean inWord = false;

        for (char c : text.toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                validChars++;
                if (!inWord) {
                    wordCount++;
                    inWord = true;
                }
            } else if (Character.isWhitespace(c)) {
                inWord = false;
            }
        }

        // Score basé sur la proportion de caractères valides et le nombre de mots
        double charConfidence = (double) validChars / totalChars;
        double wordConfidence = Math.min((double) wordCount / Math.max(1, totalChars / 10), 1.0);

        return (charConfidence * 0.7 + wordConfidence * 0.3);
    }

    /**
     * Vérifie si Tesseract est correctement configuré
     */
    public boolean isAvailable() {
        try {
            // Initialiser Tesseract de manière paresseuse si nécessaire
            if (tesseract == null) {
                initializeTesseract();
            }
            return tesseract != null && tesseractAvailable;
        } catch (Exception e) {
            log.error("Error checking Tesseract availability: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Obtient les informations de configuration Tesseract
     */
    public Map<String, Object> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("tessDataPath", tessDataPath);
        config.put("language", language);
        config.put("available", isAvailable());
        config.put("version", tesseract != null ? "Tesseract 4.x" : "Not initialized");
        return config;
    }

    /**
     * Crée un résultat OCR mock pour les tests ou quand Tesseract n'est pas disponible
     */
    private OcrResult createMockOcrResult(File imageFile) {
        try {
            BufferedImage image = ImageIO.read(imageFile);
            String mockText = "Texte extrait simulé\nCeci est un exemple de texte extrait par OCR.\n" +
                    "En mode de démonstration, Tesseract n'est pas installé.\n" +
                    "Pour une extraction réelle, installez Tesseract OCR.";

            return OcrResult.builder()
                    .text(mockText)
                    .language("fra")
                    .confidence(0.85)
                    .imageWidth(image != null ? image.getWidth() : 800)
                    .imageHeight(image != null ? image.getHeight() : 600)
                    .fileSize(imageFile.length())
                    .fileName(imageFile.getName())
                    .success(true)
                    .build();
        } catch (IOException e) {
            return OcrResult.builder()
                    .fileName(imageFile.getName())
                    .success(false)
                    .errorMessage("Mock OCR failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Crée un résultat OCR mock depuis des bytes
     */
    private OcrResult createMockOcrResultFromBytes(byte[] imageBytes, String fileName) {
        try {
            BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
            String mockText = "Texte extrait simulé\nCeci est un exemple de texte extrait par OCR.\n" +
                    "En mode de démonstration, Tesseract n'est pas installé.\n" +
                    "Pour une extraction réelle, installez Tesseract OCR.";

            return OcrResult.builder()
                    .text(mockText)
                    .language("fra")
                    .confidence(0.85)
                    .imageWidth(image != null ? image.getWidth() : 800)
                    .imageHeight(image != null ? image.getHeight() : 600)
                    .fileSize((long) imageBytes.length)
                    .fileName(fileName)
                    .success(true)
                    .build();
        } catch (IOException e) {
            return OcrResult.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Mock OCR failed: " + e.getMessage())
                    .build();
        }
    }

    // ========== MÉTHODES DOCKER ==========

    /**
     * Vérifie si Docker est disponible
     */
    private boolean isDockerAvailable() {
        try {
            ProcessBuilder pb = new ProcessBuilder("docker", "--version");
            Process process = pb.start();
            boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
            
            if (finished && process.exitValue() == 0) {
                log.debug("✅ Docker is available");
                return true;
            } else {
                log.debug("⚠️ Docker is not responding");
                return false;
            }
        } catch (Exception e) {
            log.debug("⚠️ Docker check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Exécute Tesseract via Docker
     */
    private String runTesseractDocker(Path imagePath) throws IOException, InterruptedException {
        String containerImagePath = "/tmp/input." + getFileExtension(imagePath.getFileName().toString());
        String outputPath = "/tmp/output";
        
        // Commande Docker pour exécuter Tesseract
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "--rm",
                "-v", imagePath.getParent().toString() + ":/tmp",
                "tesseractshadow/tesseract4re",
                "tesseract", containerImagePath, outputPath,
                "-l", language,
                "--psm", "3",
                "--oem", "3"
        );
        
        log.debug("🐳 Running Docker command: {}", String.join(" ", pb.command()));
        
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
        boolean finished = process.waitFor(60, java.util.concurrent.TimeUnit.SECONDS);
        
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Docker Tesseract timeout (60s)");
        }
        
        if (process.exitValue() != 0) {
            String error = errorOutput.toString();
            if (error.contains("Unable to find image")) {
                // Essayer de télécharger l'image Docker
                log.info("🐳 Tesseract Docker image not found, trying to pull...");
                pullTesseractDockerImage();
                // Réessayer une fois
                return runTesseractDocker(imagePath);
            }
            throw new RuntimeException("Docker Tesseract failed: " + error);
        }
        
        // Lire le résultat
        Path outputFile = imagePath.getParent().resolve("output.txt");
        if (Files.exists(outputFile)) {
            String result = Files.readString(outputFile);
            Files.deleteIfExists(outputFile); // Nettoyer le fichier de sortie
            return result;
        } else {
            throw new RuntimeException("OCR output file not found");
        }
    }

    /**
     * Télécharge l'image Docker Tesseract
     */
    private void pullTesseractDockerImage() throws IOException, InterruptedException {
        log.info("🐳 Pulling Tesseract Docker image...");
        
        ProcessBuilder pb = new ProcessBuilder("docker", "pull", "tesseractshadow/tesseract4re");
        Process process = pb.start();
        
        // Attendre le téléchargement (peut prendre du temps)
        boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.MINUTES);
        
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Docker image pull timeout (5 minutes)");
        }
        
        if (process.exitValue() != 0) {
            throw new RuntimeException("Failed to pull Docker image");
        }
        
        log.info("✅ Tesseract Docker image pulled successfully");
    }

    /**
     * Obtient l'extension du fichier
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : "png";
    }

    /**
     * Nettoie un répertoire temporaire
     */
    private void cleanupTempDirectory(Path tempDir) {
        try {
            Files.walk(tempDir)
                 .sorted((a, b) -> b.compareTo(a)) // Supprimer les fichiers avant les dossiers
                 .forEach(path -> {
                     try {
                         Files.deleteIfExists(path);
                     } catch (IOException e) {
                         log.warn("Failed to delete temp file: {}", path);
                     }
                 });
            log.debug("🗑️ Cleaned up temp directory: {}", tempDir);
        } catch (IOException e) {
            log.warn("⚠️ Failed to cleanup temp directory: {}", tempDir);
        }
    }
}
