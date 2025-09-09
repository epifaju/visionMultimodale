package com.vision.app.service;

import com.vision.app.dto.OllamaResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class OllamaService {

    @Value("${ollama.url:http://localhost:11434/api/generate}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3.2:1b}")
    private String model;

    private final RestTemplate restTemplate;

    public OllamaService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Analyse un texte avec Ollama
     */
    public OllamaResult analyzeText(String text, String prompt) {
        try {
            log.info("Starting Ollama analysis for text ({} chars) with prompt: {}", text.length(), prompt);

            // Construction de la requête
            Map<String, Object> request = new HashMap<>();
            request.put("model", model);
            request.put("prompt", buildPrompt(prompt, text));
            request.put("stream", false);
            request.put("options", buildOptions());

            // Appel à l'API Ollama
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    ollamaUrl,
                    HttpMethod.POST,
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();

                OllamaResult result = new OllamaResult();
                result.setSuccess(true);
                result.setModel(model);
                result.setPrompt(prompt);
                result.setResponse((String) responseBody.get("response"));
                result.setDone((Boolean) responseBody.get("done"));

                // Métadonnées de la réponse
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("totalDuration", responseBody.get("total_duration"));
                metadata.put("loadDuration", responseBody.get("load_duration"));
                metadata.put("promptEvalCount", responseBody.get("prompt_eval_count"));
                metadata.put("promptEvalDuration", responseBody.get("prompt_eval_duration"));
                metadata.put("evalCount", responseBody.get("eval_count"));
                metadata.put("evalDuration", responseBody.get("eval_duration"));
                result.setMetadata(metadata);

                log.info("Ollama analysis completed successfully for prompt: {}", prompt);
                return result;

            } else {
                log.error("Ollama API returned unexpected response: {}", response.getStatusCode());
                return createErrorResult("Unexpected API response: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Ollama analysis failed: {}", e.getMessage());
            return createErrorResult("Analysis failed: " + e.getMessage());
        }
    }

    /**
     * Analyse un document avec des instructions spécifiques
     */
    public OllamaResult analyzeDocument(String text, DocumentAnalysisType analysisType) {
        String prompt = buildDocumentPrompt(analysisType);
        return analyzeText(text, prompt);
    }

    /**
     * Génère un résumé d'un texte
     */
    public OllamaResult summarizeText(String text) {
        return analyzeDocument(text, DocumentAnalysisType.SUMMARY);
    }

    /**
     * Extrait des informations structurées d'un texte
     */
    public OllamaResult extractStructuredInfo(String text) {
        return analyzeDocument(text, DocumentAnalysisType.STRUCTURED_EXTRACTION);
    }

    /**
     * Classifie un document
     */
    public OllamaResult classifyDocument(String text) {
        return analyzeDocument(text, DocumentAnalysisType.CLASSIFICATION);
    }

    /**
     * Traduit un texte
     */
    public OllamaResult translateText(String text, String targetLanguage) {
        String prompt = String.format("Traduis le texte suivant en %s. Retourne uniquement la traduction:\n\n%s",
                targetLanguage, text);
        return analyzeText(text, prompt);
    }

    /**
     * Analyse une image avec du texte (pour l'endpoint /analyze)
     */
    public OllamaResult analyzeImageWithText(byte[] imageBytes, String fileName, String prompt) {
        try {
            log.info("🤖 Starting Ollama image analysis for file: {} with prompt: {}", fileName, prompt);

            // Vérifier d'abord si Ollama est disponible
            if (!isOllamaAvailable()) {
                log.warn("⚠️ Ollama is not available - returning mock result");
                return createMockResult(prompt);
            }

            // Encoder l'image en base64 pour l'envoyer à Ollama
            String base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);

            // Construction de la requête pour l'analyse d'image
            Map<String, Object> request = new HashMap<>();
            request.put("model", model);
            request.put("prompt", prompt);
            request.put("images", new String[] { base64Image });
            request.put("stream", false);
            request.put("options", buildOptions());

            // Appel à l'API Ollama
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    ollamaUrl,
                    HttpMethod.POST,
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();

                // Vérifier si c'est une erreur de modèle
                if (responseBody.containsKey("error")) {
                    String errorMessage = (String) responseBody.get("error");
                    log.error("❌ Ollama model error: {}", errorMessage);

                    if (errorMessage.contains("model") && errorMessage.contains("not found")) {
                        return createErrorResult("Modèle Ollama non trouvé. Veuillez installer le modèle " + model
                                + " avec: ollama pull " + model);
                    }
                    return createErrorResult("Erreur Ollama: " + errorMessage);
                }

                OllamaResult result = new OllamaResult();
                result.setSuccess(true);
                result.setModel(model);
                result.setPrompt(prompt);
                result.setResponse((String) responseBody.get("response"));
                result.setDone((Boolean) responseBody.getOrDefault("done", true));

                // Ajouter les métadonnées si disponibles
                if (responseBody.containsKey("total_duration")) {
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("totalDuration", (Long) responseBody.get("total_duration"));
                    metadata.put("evalCount", (Integer) responseBody.get("eval_count"));
                    metadata.put("promptEvalCount", (Integer) responseBody.get("prompt_eval_count"));
                    metadata.put("evalDuration", (Long) responseBody.get("eval_duration"));
                    result.setMetadata(metadata);
                }

                log.info("✅ Ollama image analysis completed successfully for {}", fileName);
                return result;
            } else {
                log.error("❌ Ollama API returned error status: {}", response.getStatusCode());
                return createErrorResult("Ollama API error: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("❌ Ollama image analysis failed for {}: {}", fileName, e.getMessage(), e);

            // Vérifier si c'est une erreur de modèle spécifique
            if (e.getMessage().contains("model") && e.getMessage().contains("not found")) {
                return createErrorResult("Modèle Ollama non trouvé. Veuillez installer le modèle " + model
                        + " avec: ollama pull " + model);
            }

            return createErrorResult("Image analysis failed: " + e.getMessage());
        }
    }

    /**
     * Construit le prompt complet pour Ollama
     */
    private String buildPrompt(String basePrompt, String text) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(basePrompt).append("\n\n");
        prompt.append("Texte à analyser:\n");
        prompt.append(text).append("\n\n");
        prompt.append(
                "Instructions: Réponds de manière claire et structurée. Si le texte est vide ou illisible, indique-le clairement.");

        return prompt.toString();
    }

    /**
     * Construit le prompt pour l'analyse de document
     */
    private String buildDocumentPrompt(DocumentAnalysisType analysisType) {
        switch (analysisType) {
            case SUMMARY:
                return "Génère un résumé concis et structuré du document suivant. " +
                        "Inclus les points clés, les informations importantes et une conclusion.";

            case STRUCTURED_EXTRACTION:
                return "Extrais et structure les informations importantes du document suivant. " +
                        "Organise les données en sections logiques (dates, montants, personnes, lieux, etc.). " +
                        "Retourne le résultat au format JSON si possible.";

            case CLASSIFICATION:
                return "Classifie le document suivant selon sa nature et son contenu. " +
                        "Identifie le type de document (facture, contrat, rapport, etc.), " +
                        "le domaine d'activité et le niveau de confidentialité.";

            case TRANSLATION:
                return "Traduis le document suivant en français. " +
                        "Conserve la structure et le formatage original.";

            default:
                return "Analyse le document suivant et fournis des insights pertinents.";
        }
    }

    /**
     * Construit les options pour l'API Ollama
     */
    private Map<String, Object> buildOptions() {
        Map<String, Object> options = new HashMap<>();
        options.put("temperature", 0.1); // Réponses plus déterministes
        options.put("top_p", 0.9);
        options.put("top_k", 40);
        options.put("num_predict", 2048); // Limite de tokens de réponse
        return options;
    }

    /**
     * Crée un résultat d'erreur
     */
    private OllamaResult createErrorResult(String errorMessage) {
        OllamaResult result = new OllamaResult();
        result.setSuccess(false);
        result.setErrorMessage(errorMessage);
        result.setModel(model);
        return result;
    }

    /**
     * Obtient le modèle Ollama configuré
     */
    public String getModel() {
        return model;
    }

    /**
     * Obtient l'URL Ollama configurée
     */
    public String getOllamaUrl() {
        return ollamaUrl;
    }

    /**
     * Vérifie si Ollama est disponible
     */
    public boolean isAvailable() {
        try {
            // Test simple de connexion
            OllamaResult testResult = analyzeText("test", "test");
            return testResult.isSuccessful();
        } catch (Exception e) {
            log.warn("Ollama availability check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Vérifie si Ollama est disponible (version simplifiée)
     */
    private boolean isOllamaAvailable() {
        try {
            // Test de connexion simple sans traitement
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> testRequest = new HashMap<>();
            testRequest.put("model", model);
            testRequest.put("prompt", "test");
            testRequest.put("stream", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(testRequest, headers);

            // Test avec un timeout court
            restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory());
            ((org.springframework.http.client.SimpleClientHttpRequestFactory) restTemplate.getRequestFactory())
                    .setConnectTimeout(5000);
            ((org.springframework.http.client.SimpleClientHttpRequestFactory) restTemplate.getRequestFactory())
                    .setReadTimeout(5000);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    ollamaUrl,
                    HttpMethod.POST,
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.debug("Ollama availability check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Crée un résultat mock quand Ollama n'est pas disponible
     */
    private OllamaResult createMockResult(String prompt) {
        OllamaResult result = new OllamaResult();
        result.setSuccess(true);
        result.setModel(model + " (mock)");
        result.setPrompt(prompt);
        result.setResponse("🤖 Analyse IA simulée\n\n" +
                "Ollama n'est pas disponible sur ce système. " +
                "Pour utiliser l'analyse IA réelle, veuillez :\n\n" +
                "1. Installer Ollama : https://ollama.ai/\n" +
                "2. Installer le modèle : ollama pull " + model + "\n" +
                "3. Démarrer Ollama : ollama serve\n\n" +
                "En mode simulation, cette réponse est générée automatiquement.");
        result.setDone(true);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("totalDuration", 1000000000L); // 1 seconde simulée
        metadata.put("evalCount", 50);
        metadata.put("promptEvalCount", 10);
        metadata.put("evalDuration", 800000000L);
        result.setMetadata(metadata);

        return result;
    }

    /**
     * Obtient les informations de configuration Ollama
     */
    public Map<String, Object> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("url", ollamaUrl);
        config.put("model", model);
        config.put("available", isAvailable());
        config.put("features", new String[] {
                "Text analysis",
                "Document summarization",
                "Structured extraction",
                "Document classification",
                "Translation",
                "Custom prompts"
        });
        return config;
    }

    /**
     * Types d'analyse de documents supportés
     */
    public enum DocumentAnalysisType {
        SUMMARY,
        STRUCTURED_EXTRACTION,
        CLASSIFICATION,
        TRANSLATION,
        CUSTOM
    }
}
