package com.vision.app.repository;

import com.vision.app.model.Document;
import com.vision.app.model.ProcessingStatus;
import com.vision.app.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByUploadedBy(User user, Pageable pageable);

    Page<Document> findByStatus(ProcessingStatus status, Pageable pageable);

    Page<Document> findByUploadedByAndStatus(User user, ProcessingStatus status, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.uploadedBy = :user AND d.uploadedAt >= :since")
    List<Document> findByUploadedByAndUploadedAtAfter(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT d FROM Document d WHERE d.fileType = :fileType")
    Page<Document> findByFileType(@Param("fileType") String fileType, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.detectedLanguage = :language")
    Page<Document> findByDetectedLanguage(@Param("language") String language, Pageable pageable);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = :status")
    long countByStatus(@Param("status") ProcessingStatus status);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.uploadedBy = :user")
    long countByUploadedBy(@Param("user") User user);

    @Query("SELECT d FROM Document d WHERE d.extractedText LIKE %:searchTerm%")
    Page<Document> findByExtractedTextContaining(@Param("searchTerm") String searchTerm, Pageable pageable);
}
