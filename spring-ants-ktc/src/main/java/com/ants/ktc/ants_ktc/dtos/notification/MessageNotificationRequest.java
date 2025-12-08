package com.ants.ktc.ants_ktc.dtos.notification;

import lombok.Data;
import java.util.UUID;

/**
 * DTO cho yêu cầu gửi thông báo tin nhắn
 */
@Data
public class MessageNotificationRequest {
    private String type; // new_message
    private UUID senderId;
    private String senderName;
    private String senderAvatar;
    private UUID recipientId;
    private String messageType; // text, image
    private String messageText;
    private String imageUrl;
    private String timestamp;
}
