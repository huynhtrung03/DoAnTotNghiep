package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPresenceRepository extends JpaRepository<UserPresence, UUID> {
    
    Optional<UserPresence> findByUserId(UUID userId);

    List<UserPresence> findByStatus(UserPresence.PresenceStatus status);

    // Cập nhật trạng thái Offline cho những user không tương tác quá lâu (Stale connection)
    @Modifying
    @Transactional
    @Query("UPDATE UserPresence p SET p.status = 'OFFLINE' WHERE p.lastSeen < :cutoffTime AND p.status = 'ONLINE'")
    int markStaleSessionsOffline(@Param("cutoffTime") LocalDateTime cutoffTime);
}
