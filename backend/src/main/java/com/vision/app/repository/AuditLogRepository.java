package com.vision.app.repository;

import com.vision.app.model.AuditLog;
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
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByUser(User user, Pageable pageable);

    Page<AuditLog> findByAction(String action, Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.user = :user AND a.timestamp >= :since")
    List<AuditLog> findByUserAndTimestampAfter(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT a FROM AuditLog a WHERE a.action = :action AND a.timestamp >= :since")
    List<AuditLog> findByActionAndTimestampAfter(@Param("action") String action, @Param("since") LocalDateTime since);

    @Query("SELECT a FROM AuditLog a WHERE a.success = :success")
    Page<AuditLog> findBySuccess(@Param("success") Boolean success, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.ipAddress = :ipAddress")
    Page<AuditLog> findByIpAddress(@Param("ipAddress") String ipAddress, Pageable pageable);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.user = :user AND a.timestamp >= :since")
    long countByUserAndTimestampAfter(@Param("user") User user, @Param("since") LocalDateTime since);
}
