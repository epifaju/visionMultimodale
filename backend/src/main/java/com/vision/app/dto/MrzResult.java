package com.vision.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Résultat du traitement MRZ d'un document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrzResult {

    /**
     * Nom du fichier traité
     */
    private String fileName;

    /**
     * Indique si le traitement a réussi
     */
    private boolean success;

    /**
     * Texte MRZ brut extrait
     */
    private String mrzText;

    /**
     * Données MRZ structurées
     */
    private MrzData data;

    /**
     * Message d'erreur en cas d'échec
     */
    private String errorMessage;
}
