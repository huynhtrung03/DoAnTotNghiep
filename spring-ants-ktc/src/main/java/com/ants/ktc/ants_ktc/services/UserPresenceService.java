package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.entities.UserPresence;
import com.ants.ktc.ants_ktc.repositories.UserPresenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserPresenceService {

    @Autowired
    private UserPresenceRepository presenceRepository;

    // ========================================================================
    // DISABLED: Online/offline feature not needed for rental app
    // All presence-related methods have been commented out
    // ========================================================================

    // // 1. Khi user mở app/chat -> Set ONLINE
    // @Transactional
    // public void setUserChatActive(UUID userId) {
    // UserPresence presence = presenceRepository.findByUserId(userId)
    // .orElse(new UserPresence());

    // if (presence.getId() == null) {
    // presence.setUserId(userId);
    // }

    // presence.setStatus(UserPresence.PresenceStatus.ONLINE);
    // presence.setLastSeen(LocalDateTime.now());

    // presenceRepository.save(presence);
    // }

    // // 2. Khi user tắt app/chat -> Set OFFLINE
    // @Transactional
    // public void setUserChatInactive(UUID userId) {
    // presenceRepository.findByUserId(userId).ifPresent(presence -> {
    // presence.setStatus(UserPresence.PresenceStatus.OFFLINE);
    // presence.setLastSeen(LocalDateTime.now());
    // presence.setActiveChatWith(null);
    // presenceRepository.save(presence);
    // });
    // }

    // // 3. Heartbeat: Gọi mỗi 30s để duy trì trạng thái Online
    // @Transactional
    // public void sendHeartbeat(UUID userId) {
    // presenceRepository.findByUserId(userId).ifPresent(presence -> {
    // presence.setLastSeen(LocalDateTime.now());
    // // Nếu đang offline mà có heartbeat -> Tự bật lại Online
    // if (presence.getStatus() != UserPresence.PresenceStatus.ONLINE) {
    // presence.setStatus(UserPresence.PresenceStatus.ONLINE);
    // }
    // presenceRepository.save(presence);
    // });
    // }

    // // 4. Lấy trạng thái của 1 user (để hiện chấm xanh)
    // public boolean isUserOnline(UUID userId) {
    // Optional<UserPresence> presence = presenceRepository.findByUserId(userId);
    // return presence.isPresent()
    // && presence.get().getStatus() == UserPresence.PresenceStatus.ONLINE
    // && presence.get().getLastSeen().isAfter(LocalDateTime.now().minusMinutes(2));
    // // Timeout 2 phút
    // }

    // // 5. Lấy trạng thái của danh sách nhiều user (để hiện trong list chat)
    // public List<Map<String, Object>> getUsersPresenceStatus(List<UUID> userIds) {
    // List<Map<String, Object>> result = new ArrayList<>();

    // for (UUID userId : userIds) {
    // Optional<UserPresence> presence = presenceRepository.findByUserId(userId);
    // Map<String, Object> statusMap = new HashMap<>();

    // statusMap.put("userId", userId);

    // if (presence.isPresent() && isUserOnline(userId)) {
    // statusMap.put("isOnline", true);
    // statusMap.put("lastSeen", presence.get().getLastSeen());
    // statusMap.put("status", "ONLINE");
    // } else {
    // statusMap.put("isOnline", false);
    // statusMap.put("lastSeen",
    // presence.map(UserPresence::getLastSeen).orElse(null));
    // statusMap.put("status", "OFFLINE");
    // }

    // result.add(statusMap);
    // }

    // return result;
    // }

    // // @Scheduled(fixedRate = 60000)
    // // public void cleanupStaleConnections() {
    // // // Mark offline user nào không heartbeat trong 2 phút
    // // LocalDateTime cutoff = LocalDateTime.now().minusMinutes(2);
    // // int updated = presenceRepository.markStaleSessionsOffline(cutoff);
    // // if (updated > 0) {
    // // System.out.println("Auto set OFFLINE for " + updated + " inactive
    // users.");
    // // }
    // // }
}
