package com.ants.ktc.ants_ktc.dtos.notification;

import lombok.Data;
import java.util.UUID;

/**
 * DTO cho yêu cầu thông báo tin nhắn đã đọc
 */
@Data
public class MessageReadRequest {
    private UUID senderId;
    private UUID recipientId;
    private String messageId;
    private String timestamp;
}
