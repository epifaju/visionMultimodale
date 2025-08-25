package com.vision.app.model;

/**
 * Types de documents supportés pour l'extraction MRZ
 */
public enum DocumentType {

    /**
     * Passeport
     */
    PASSPORT("P", "Passeport"),

    /**
     * Carte d'identité nationale
     */
    ID_CARD("I", "Carte d'identité nationale"),

    /**
     * Carte de résident
     */
    RESIDENCE_CARD("A", "Carte de résident"),

    /**
     * Type inconnu
     */
    UNKNOWN("?", "Type inconnu");

    private final String code;
    private final String description;

    DocumentType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Trouve le type de document par son code
     */
    public static DocumentType fromCode(String code) {
        if (code == null)
            return UNKNOWN;

        for (DocumentType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return UNKNOWN;
    }
}
