package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.notification.*;
import com.ants.ktc.ants_ktc.entities.DeviceToken;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.DeviceTokenRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.services.FCMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private FCMService fcmService;

    // API cho Mobile gọi để lưu Token
    @PostMapping("/register-token")
    public ResponseEntity<?> registerToken(@RequestBody RegisterTokenRequest request) {
        try {
            Optional<DeviceToken> existingToken = deviceTokenRepository.findByToken(request.getToken());

            DeviceToken deviceToken;
            if (existingToken.isPresent()) {
                deviceToken = existingToken.get();
                // Update user mới nếu thiết bị đổi chủ
                Optional<User> user = userRepository.findById(request.getUserId());
                if (user.isPresent()) {
                    deviceToken.setUser(user.get());
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
                }
            } else {
                deviceToken = new DeviceToken();
                deviceToken.setToken(request.getToken());
                Optional<User> user = userRepository.findById(request.getUserId());
                if (user.isPresent()) {
                    deviceToken.setUser(user.get());
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
                }
                deviceToken.setDeviceType(request.getDeviceType());
                deviceToken.setActive(true);
            }

            deviceTokenRepository.save(deviceToken);
            return ResponseEntity.ok(Map.of("message", "Token registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // API Test gửi thông báo (Dùng Postman gọi để test)
    @PostMapping("/test-send")
    public ResponseEntity<?> sendTestNotification(@RequestParam String token) {
        String response = fcmService.sendNotification(
            token,
            "Test Notification",
            "Đây là tin nhắn thử nghiệm từ Spring Boot",
            null
        );
        return ResponseEntity.ok(Map.of("firebaseResponse", response));
    }

    /**
     * API để gửi thông báo tin nhắn mới
     * Client gọi: POST /api/notifications/send-message-notification
     */
    @PostMapping("/send-message-notification")
    public ResponseEntity<?> sendMessageNotification(@RequestBody MessageNotificationRequest request) {
        try {
            // Kiểm tra user nhận tin nhắn có tồn tại
            Optional<User> recipient = userRepository.findById(request.getRecipientId());
            if (recipient.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new NotificationResponse(false, "Recipient user not found")
                );
            }

            // Lấy tất cả device tokens của người nhận
            List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserId(request.getRecipientId());
            
            if (deviceTokens.isEmpty()) {
                return ResponseEntity.ok(
                    new NotificationResponse(false, "No device tokens found for recipient")
                );
            }

            // Chuẩn bị dữ liệu để gửi FCM
            String title = "Tin nhắn từ " + request.getSenderName();
            String body = request.getMessageText() != null ? request.getMessageText() : "Có tin nhắn mới";

            Map<String, String> data = new HashMap<>();
            data.put("type", "new_message");
            data.put("senderId", request.getSenderId().toString());
            data.put("senderName", request.getSenderName());
            if (request.getSenderAvatar() != null) {
                data.put("senderAvatar", request.getSenderAvatar());
            }
            data.put("messageType", request.getMessageType());
            if ("image".equals(request.getMessageType()) && request.getImageUrl() != null) {
                data.put("imageUrl", request.getImageUrl());
            }
            data.put("timestamp", request.getTimestamp());

            // Gửi thông báo đến tất cả thiết bị
            int successCount = 0;
            for (DeviceToken deviceToken : deviceTokens) {
                if (deviceToken.isActive()) {
                    String response = fcmService.sendNotification(
                        deviceToken.getToken(),
                        title,
                        body,
                        data
                    );
                    if (response != null && !response.startsWith("Error")) {
                        successCount++;
                    }
                }
            }

            if (successCount > 0) {
                return ResponseEntity.ok(
                    new NotificationResponse(true, "Message notification sent to " + successCount + " device(s)")
                );
            } else {
                return ResponseEntity.ok(
                    new NotificationResponse(false, "Failed to send notification to any device")
                );
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                new NotificationResponse(false, "Error: " + e.getMessage())
            );
        }
    }

    /**
     * API để gửi thông báo typing indicator
     * Client gọi: POST /api/notifications/typing-indicator
     */
    @PostMapping("/typing-indicator")
    public ResponseEntity<?> sendTypingIndicator(@RequestBody TypingIndicatorRequest request) {
        try {
            // Kiểm tra user nhận thông báo có tồn tại
            Optional<User> recipient = userRepository.findById(request.getRecipientId());
            if (recipient.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new NotificationResponse(false, "Recipient user not found")
                );
            }

            // Lấy tất cả device tokens của người nhận
            List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserId(request.getRecipientId());
            
            if (deviceTokens.isEmpty()) {
                return ResponseEntity.ok(
                    new NotificationResponse(false, "No device tokens found for recipient")
                );
            }

            Map<String, String> data = new HashMap<>();
            data.put("type", "typing_indicator");
            data.put("senderId", request.getSenderId().toString());
            data.put("senderName", request.getSenderName());
            data.put("timestamp", request.getTimestamp());

            int successCount = 0;
            for (DeviceToken deviceToken : deviceTokens) {
                if (deviceToken.isActive()) {
                    String response = fcmService.sendNotification(
                        deviceToken.getToken(),
                        request.getSenderName() + " đang nhập tin nhắn...",
                        "",
                        data
                    );
                    if (response != null && !response.startsWith("Error")) {
                        successCount++;
                    }
                }
            }

            if (successCount > 0) {
                return ResponseEntity.ok(
                    new NotificationResponse(true, "Typing indicator sent to " + successCount + " device(s)")
                );
            } else {
                return ResponseEntity.ok(
                    new NotificationResponse(false, "Failed to send typing indicator")
                );
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                new NotificationResponse(false, "Error: " + e.getMessage())
            );
        }
    }

    /**
     * API để gửi thông báo tin nhắn đã đọc (read receipt)
     * Client gọi: POST /api/notifications/message-read
     */
    @PostMapping("/message-read")
    public ResponseEntity<?> sendMessageReadReceipt(@RequestBody MessageReadRequest request) {
        try {
            // Kiểm tra user nhận thông báo có tồn tại
            Optional<User> recipient = userRepository.findById(request.getRecipientId());
            if (recipient.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new NotificationResponse(false, "Recipient user not found")
                );
            }

            // Lấy tất cả device tokens của người nhận
            List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserId(request.getRecipientId());
            
            if (deviceTokens.isEmpty()) {
                return ResponseEntity.ok(
                    new NotificationResponse(false, "No device tokens found for recipient")
                );
            }

            Map<String, String> data = new HashMap<>();
            data.put("type", "message_read");
            data.put("senderId", request.getSenderId().toString());
            data.put("messageId", request.getMessageId());
            data.put("timestamp", request.getTimestamp());

            int successCount = 0;
            for (DeviceToken deviceToken : deviceTokens) {
                if (deviceToken.isActive()) {
                    String response = fcmService.sendNotification(
                        deviceToken.getToken(),
                        "Tin nhắn đã được xem",
                        "",
                        data
                    );
                    if (response != null && !response.startsWith("Error")) {
                        successCount++;
                    }
                }
            }

            if (successCount > 0) {
                return ResponseEntity.ok(
                    new NotificationResponse(true, "Read receipt sent to " + successCount + " device(s)")
                );
            } else {
                return ResponseEntity.ok(
                    new NotificationResponse(false, "Failed to send read receipt")
                );
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                new NotificationResponse(false, "Error: " + e.getMessage())
            );
        }
    }

}
