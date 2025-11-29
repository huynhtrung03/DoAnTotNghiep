package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.notification.RegisterTokenRequest;
import com.ants.ktc.ants_ktc.entities.DeviceToken;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.DeviceTokenRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.services.FCMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
