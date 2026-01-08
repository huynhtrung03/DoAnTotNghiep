package com.ants.ktc.ants_ktc.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.MailUserProjection;
import com.ants.ktc.ants_ktc.services.MailService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal")
public class InternalApprovalController {

    @Autowired
    private MailService mailService;

    @Autowired
    private RoomJpaRepository roomJpaRepository;

    @PostMapping("/notify-approval")
    public ResponseEntity<?> notifyApproval(@RequestBody Map<String, Object> payload) {
        try {
            String roomIdStr = (String) payload.get("room_id");
            String status = (String) payload.get("status"); // "APPROVED" or "REJECTED"
            String reason = (String) payload.get("reason");

            if (roomIdStr == null || status == null) {
                return ResponseEntity.badRequest().body("Missing room_id or status");
            }

            UUID roomId = UUID.fromString(roomIdStr);

            // Tìm thông tin chủ phòng để gửi mail
            MailUserProjection mailuser = roomJpaRepository.findMailUsersByRoomId(roomId).stream()
                    .findFirst()
                    .orElse(null);

            if (mailuser != null && mailuser.getEmail() != null && !mailuser.getEmail().trim().isEmpty()) {
                String email = mailuser.getEmail();
                String name = mailuser.getFullName() != null ? mailuser.getFullName() : "Chủ nhà";

                // Lấy tên phòng để hiển thị trong mail
                String roomTitle = "Phòng trọ";
                try {
                    Room room = roomJpaRepository.findById(roomId).orElse(null);
                    if (room != null && room.getTitle() != null) {
                        roomTitle = room.getTitle();
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching room title: " + e.getMessage());
                }

                if ("APPROVED".equalsIgnoreCase(status) || "1".equals(status)) {
                    // Gửi mail duyệt
                    mailService.sendRoomApprovalNotification(email, name, roomTitle);
                    return ResponseEntity.ok("Approval email sent to " + email);

                } else if ("REJECTED".equalsIgnoreCase(status) || "2".equals(status)) {
                    // Gửi mail từ chối
                    mailService.sendRoomRejectionNotification(email, name, roomTitle,
                            reason != null ? reason : "Không đạt yêu cầu");
                    return ResponseEntity.ok("Rejection email sent to " + email);
                } else {
                    return ResponseEntity.badRequest().body("Invalid status: " + status);
                }
            } else {
                return ResponseEntity.ok("No valid email found for room owner, skipped email.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
