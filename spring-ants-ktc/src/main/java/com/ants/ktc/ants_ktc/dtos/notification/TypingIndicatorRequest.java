package com.ants.ktc.ants_ktc.dtos.notification;

import lombok.Data;
import java.util.UUID;

/**
 * DTO cho yêu cầu thông báo typing indicator
 */
@Data
public class TypingIndicatorRequest {
    private UUID senderId;
    private String senderName;
    private UUID recipientId;
    private String timestamp;
}
