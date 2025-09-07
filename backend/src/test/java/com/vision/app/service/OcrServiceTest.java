package com.vision.app.service;

import com.vision.app.dto.OcrResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OcrServiceTest {

    @InjectMocks
    private OcrService ocrService;

    private byte[] testImageBytes;
    private String testFileName = "test-image.jpg";

    @BeforeEach
    void setUp() {
        // Configuration du service avec des valeurs de test
        ReflectionTestUtils.setField(ocrService, "tesseractPath", "/usr/bin/tesseract");
        ReflectionTestUtils.setField(ocrService, "language", "fra");
        ReflectionTestUtils.setField(ocrService, "dataPath", "/usr/share/tesseract-ocr/4.00/tessdata");
        
        // Charger une image de test (1x1 pixel PNG)
        testImageBytes = createTestImageBytes();
    }

    @Test
    void testExtractTextFromImageBytes_EmptyFile() {
        // Given
        byte[] emptyBytes = new byte[0];
        
        // When
        OcrResult result = ocrService.extractTextFromImageBytes(emptyBytes, testFileName);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
        assertTrue(result.getErrorMessage().contains("empty"));
    }

    @Test
    void testExtractTextFromImageBytes_NullInput() {
        // When
        OcrResult result = ocrService.extractTextFromImageBytes(null, testFileName);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
        assertTrue(result.getErrorMessage().contains("null"));
    }

    @Test
    void testExtractTextFromImageBytes_UnsupportedFormat() {
        // Given
        byte[] invalidBytes = "not an image".getBytes();
        
        // When
        OcrResult result = ocrService.extractTextFromImageBytes(invalidBytes, "test.txt");
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
    }

    @Test
    void testGetConfiguration() {
        // When
        var config = ocrService.getConfiguration();
        
        // Then
        assertNotNull(config);
        assertTrue(config.containsKey("available"));
        assertTrue(config.containsKey("language"));
        assertTrue(config.containsKey("version"));
        assertTrue(config.containsKey("tesseractPath"));
    }

    @Test
    void testExtractTextFromImageBytes_WithValidImage() {
        // When
        OcrResult result = ocrService.extractTextFromImageBytes(testImageBytes, testFileName);
        
        // Then
        assertNotNull(result);
        // Note: Le test peut échouer si Tesseract n'est pas installé, c'est normal
        // On teste juste que la méthode ne lève pas d'exception et retourne un résultat valide
        assertNotNull(result.getText());
        assertTrue(result.getConfidence() >= 0.0 && result.getConfidence() <= 1.0);
        assertEquals("fra", result.getLanguage());
        assertTrue(result.getTextLength() >= 0);
    }

    // Méthode utilitaire pour créer des bytes d'image de test
    private byte[] createTestImageBytes() {
        // Créer un PNG 1x1 pixel minimal avec cast explicite
        return new byte[]{
            (byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A, // PNG signature
            (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0D, (byte) 0x49, (byte) 0x48, (byte) 0x44, (byte) 0x52, // IHDR chunk
            (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x01, // 1x1 dimensions
            (byte) 0x08, (byte) 0x02, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x90, (byte) 0x77, (byte) 0x53, (byte) 0xDE, // bit depth, color type, etc.
            (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0C, (byte) 0x49, (byte) 0x44, (byte) 0x41, (byte) 0x54, // IDAT chunk
            (byte) 0x08, (byte) 0x99, (byte) 0x01, (byte) 0x01, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0xFF, (byte) 0xFF, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x02, (byte) 0x00, (byte) 0x01, // image data
            (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x49, (byte) 0x45, (byte) 0x4E, (byte) 0x44, (byte) 0xAE, (byte) 0x42, (byte) 0x60, (byte) 0x82 // IEND chunk
        };
    }
}