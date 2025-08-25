package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaResult {

    private Boolean success;
    private String model;
    private String prompt;
    private String response;
    private Boolean done;
    private String errorMessage;
    private Map<String, Object> metadata;

    // Méthodes utilitaires
    public boolean isSuccessful() {
        return success != null && success;
    }

    public boolean hasResponse() {
        return response != null && !response.trim().isEmpty();
    }

    public boolean hasMetadata() {
        return metadata != null && !metadata.isEmpty();
    }

    public String getStatus() {
        return success ? "SUCCESS" : "FAILED";
    }

    public int getResponseLength() {
        return hasResponse() ? response.length() : 0;
    }

    public Long getTotalDuration() {
        if (metadata != null && metadata.containsKey("totalDuration")) {
            Object duration = metadata.get("totalDuration");
            if (duration instanceof Number) {
                return ((Number) duration).longValue();
            }
        }
        return null;
    }

    public Long getEvalDuration() {
        if (metadata != null && metadata.containsKey("evalDuration")) {
            Object duration = metadata.get("evalDuration");
            if (duration instanceof Number) {
                return ((Number) duration).longValue();
            }
        }
        return null;
    }

    public Integer getEvalCount() {
        if (metadata != null && metadata.containsKey("evalCount")) {
            Object count = metadata.get("evalCount");
            if (count instanceof Number) {
                return ((Number) count).intValue();
            }
        }
        return null;
    }

    public String getFormattedDuration() {
        Long totalDuration = getTotalDuration();
        if (totalDuration == null)
            return "Unknown";

        if (totalDuration < 1000) {
            return totalDuration + "ns";
        } else if (totalDuration < 1_000_000) {
            return String.format("%.2fμs", totalDuration / 1000.0);
        } else if (totalDuration < 1_000_000_000) {
            return String.format("%.2fms", totalDuration / 1_000_000.0);
        } else {
            return String.format("%.2fs", totalDuration / 1_000_000_000.0);
        }
    }
}
