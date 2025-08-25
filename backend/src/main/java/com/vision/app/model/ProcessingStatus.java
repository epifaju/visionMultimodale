package com.vision.app.model;

public enum ProcessingStatus {
    PENDING, // En attente de traitement
    PROCESSING, // En cours de traitement
    COMPLETED, // Traitement terminé avec succès
    FAILED, // Traitement échoué
    CANCELLED // Traitement annulé
}
