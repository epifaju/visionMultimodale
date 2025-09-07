package com.vision.app.service;

import com.vision.app.dto.DocumentDto;
import com.vision.app.model.Document;
import com.vision.app.model.ProcessingStatus;
import com.vision.app.model.User;
import com.vision.app.repository.DocumentRepository;
import com.vision.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    /**
     * Sauvegarder un document uploadé
     */
    public DocumentDto saveDocument(MultipartFile file, Long userId) {
        try {
            // Récupérer l'utilisateur
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Créer le document
            Document document = new Document();
            document.setFileName(file.getOriginalFilename());
            document.setOriginalFileName(file.getOriginalFilename());
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setFilePath("uploads/" + file.getOriginalFilename()); // Chemin temporaire
            document.setStatus(ProcessingStatus.PENDING);
            document.setUploadedBy(user);
            document.setUploadedAt(LocalDateTime.now());

            // Sauvegarder
            Document savedDocument = documentRepository.save(document);
            log.info("📁 Document sauvegardé: {} (ID: {})", file.getOriginalFilename(), savedDocument.getId());

            return convertToDto(savedDocument);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la sauvegarde du document: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la sauvegarde du document", e);
        }
    }

    /**
     * Récupérer tous les documents avec pagination
     */
    public Page<DocumentDto> getAllDocuments(int page, int size, String sortBy, String sortDir) {
        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Document> documents = documentRepository.findAll(pageable);

            return documents.map(this::convertToDto);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des documents: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la récupération des documents", e);
        }
    }

    /**
     * Récupérer les documents d'un utilisateur
     */
    public Page<DocumentDto> getDocumentsByUser(Long userId, int page, int size, String sortBy, String sortDir) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Document> documents = documentRepository.findByUploadedBy(user, pageable);

            return documents.map(this::convertToDto);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des documents de l'utilisateur: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la récupération des documents", e);
        }
    }

    /**
     * Récupérer un document par ID
     */
    public DocumentDto getDocumentById(Long id) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document non trouvé"));

            return convertToDto(document);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du document {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la récupération du document", e);
        }
    }

    /**
     * Mettre à jour le statut d'un document
     */
    public DocumentDto updateDocumentStatus(Long id, ProcessingStatus status) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document non trouvé"));

            document.setStatus(status);
            document.setUpdatedAt(LocalDateTime.now());

            if (status == ProcessingStatus.COMPLETED) {
                document.setProcessedAt(LocalDateTime.now());
            }

            Document savedDocument = documentRepository.save(document);
            log.info("📁 Statut du document {} mis à jour: {}", id, status);

            return convertToDto(savedDocument);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour du statut: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la mise à jour du statut", e);
        }
    }

    /**
     * Supprimer un document
     */
    public void deleteDocument(Long id) {
        try {
            if (!documentRepository.existsById(id)) {
                throw new RuntimeException("Document non trouvé");
            }

            documentRepository.deleteById(id);
            log.info("📁 Document {} supprimé", id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression du document {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la suppression du document", e);
        }
    }

    /**
     * Récupérer un utilisateur par nom d'utilisateur
     */
    public Optional<User> getUserByUsername(String username) {
        try {
            return userRepository.findByUsername(username);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'utilisateur {}: {}", username, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Convertir Document en DocumentDto
     */
    private DocumentDto convertToDto(Document document) {
        DocumentDto dto = new DocumentDto();
        dto.setId(document.getId());
        dto.setFileName(document.getFileName());
        dto.setOriginalFileName(document.getOriginalFileName());
        dto.setFileType(document.getFileType());
        dto.setFileSize(document.getFileSize());
        dto.setExtractedText(document.getExtractedText());
        dto.setOcrConfidence(document.getOcrConfidence());
        dto.setDetectedLanguage(document.getDetectedLanguage());
        dto.setStatus(document.getStatus());
        dto.setProcessingErrors(document.getProcessingErrors());
        dto.setMetadata(document.getMetadata());
        dto.setUploadedById(document.getUploadedBy().getId());
        dto.setUploadedByUsername(document.getUploadedBy().getUsername());
        dto.setUploadedAt(document.getUploadedAt());
        dto.setProcessedAt(document.getProcessedAt());
        dto.setUpdatedAt(document.getUpdatedAt());
        return dto;
    }
}
