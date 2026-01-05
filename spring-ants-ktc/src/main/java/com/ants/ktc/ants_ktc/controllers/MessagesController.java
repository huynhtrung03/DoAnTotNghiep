package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ants.ktc.ants_ktc.dtos.message.MessageResponseDto;
import com.ants.ktc.ants_ktc.services.MessagesService;
// DISABLED: Online/offline feature not needed for rental app
// import com.ants.ktc.ants_ktc.services.UserPresenceService;

@RestController
@RequestMapping("/api/messages")
public class MessagesController {
    @Autowired
    private MessagesService messagesService;

    // DISABLED: Online/offline feature not needed for rental app
    // @Autowired
    // private UserPresenceService userPresenceService;

    // Lấy lịch sử tin nhắn giữa 2 user (cả 2 chiều), trả về DTO
    @GetMapping
    public List<MessageResponseDto> getMessagesBetweenUsers(
            @RequestParam("user1") UUID user1,
            @RequestParam("user2") UUID user2,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "before", required = false) String before) {
        java.time.LocalDateTime beforeTime = null;
        if (before != null && !before.isEmpty()) {
            beforeTime = java.time.LocalDateTime.parse(before);
        }
        return messagesService.getMessagesBetweenUsers(user1, user2, size, beforeTime);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getChatUsers(@RequestParam("userId") UUID userId) {
        return messagesService.getChatUsers(userId);
    }

    // ========================================================================
    // DISABLED: Online/offline feature not needed for rental app
    // All presence-related API endpoints have been commented out
    // ========================================================================

    // // 1. Mobile gọi khi mở App
    // @PostMapping("/chat-active")
    // public ResponseEntity<?> setChatActive(@RequestParam("userId") UUID userId) {
    // userPresenceService.setUserChatActive(userId);
    // return ResponseEntity.ok(Map.of("message", "User set to ONLINE"));
    // }

    // // 2. Mobile gọi khi tắt App / Background
    // @PostMapping("/chat-inactive")
    // public ResponseEntity<?> setChatInactive(@RequestParam("userId") UUID userId)
    // {
    // userPresenceService.setUserChatInactive(userId);
    // return ResponseEntity.ok(Map.of("message", "User set to OFFLINE"));
    // }

    // // 3. Mobile gọi định kỳ mỗi 30s (Heartbeat)
    // @PostMapping("/heartbeat")
    // public ResponseEntity<?> sendHeartbeat(@RequestParam("userId") UUID userId) {
    // userPresenceService.sendHeartbeat(userId);
    // return ResponseEntity.ok(Map.of("message", "Heartbeat received"));
    // }

    // // 4. Lấy trạng thái 1 user (để hiển thị trong khung chat)
    // @GetMapping("/user-status/{userId}")
    // public ResponseEntity<?> getUserStatus(@PathVariable("userId") UUID userId) {
    // boolean isOnline = userPresenceService.isUserOnline(userId);
    // return ResponseEntity.ok(Map.of(
    // "userId", userId,
    // "isOnline", isOnline,
    // "status", isOnline ? "ONLINE" : "OFFLINE"
    // ));
    // }

    // // 5. Lấy trạng thái nhiều user (để hiển thị danh sách bạn bè)
    // @PostMapping("/users-status")
    // public ResponseEntity<?> getUsersStatus(@RequestBody List<UUID> userIds) {
    // return
    // ResponseEntity.ok(userPresenceService.getUsersPresenceStatus(userIds));
    // }
}
