package com.vision.app.dto;

import com.vision.app.model.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Données MRZ extraites d'un document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrzData {

    /**
     * Type de document (passeport, carte d'identité)
     */
    private DocumentType documentType;

    /**
     * Pays émetteur du document
     */
    private String issuingCountry;

    /**
     * Nom de famille
     */
    private String surname;

    /**
     * Prénoms
     */
    private String givenNames;

    /**
     * Numéro du document
     */
    private String documentNumber;

    /**
     * Nationalité
     */
    private String nationality;

    /**
     * Date de naissance (format YYYY-MM-DD)
     */
    private String dateOfBirth;

    /**
     * Genre (MALE, FEMALE, UNSPECIFIED)
     */
    private String gender;

    /**
     * Date d'expiration (format YYYY-MM-DD)
     */
    private String expiryDate;

    /**
     * Numéro personnel
     */
    private String personalNumber;
}
