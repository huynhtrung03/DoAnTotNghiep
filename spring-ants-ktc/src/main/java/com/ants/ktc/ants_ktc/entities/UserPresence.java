package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "user_presence")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserPresence extends BaseEntity {
    // Liên kết 1-1 với User
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PresenceStatus status = PresenceStatus.OFFLINE;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen = LocalDateTime.now();

    // User đang chat với ai (để tránh gửi noti nếu đang mở chat)
    @Column(name = "active_chat_with")
    private UUID activeChatWith;

    // Session ID của WebSocket để quản lý kết nối
    @Column(name = "websocket_session_id")
    private String websocketSessionId;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private Date createdDate;

    @UpdateTimestamp
    @Column(name = "modified_date")
    private Date modifiedDate;

    public enum PresenceStatus {
        ONLINE, OFFLINE, AWAY
    }
}
