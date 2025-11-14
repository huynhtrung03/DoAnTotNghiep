package com.ants.ktc.ants_ktc.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/statistics")
public class PublicStatisticsController {

    @Autowired
    private RoomJpaRepository roomRepository;

    @Autowired
    private UserJpaRepository userRepository;

    /**
     * API công khai để lấy thống kê tổng quan cho trang chủ người dùng
     * GET /api/public/statistics/overview
     * 
     * Response:
     * {
     *   "totalRooms": 150,
     *   "vipRooms": 45,
     *   "totalUsers": 1250,
     *   "totalLandlords": 320
     * }
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverviewStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Tổng số phòng đã được duyệt và còn khả dụng
            Long totalRooms = roomRepository.countAcceptedApprovalRooms();
            stats.put("totalRooms", totalRooms != null ? totalRooms : 0L);
            
            // Số phòng VIP (có thể cần thêm query riêng nếu có trường VIP)
            // Tạm thời dùng 30% của total rooms hoặc query thực tế
            Long vipRooms = roomRepository.countVipRooms(); // Cần thêm method này
            stats.put("vipRooms", vipRooms != null ? vipRooms : 0L);
            
            // Tổng số người dùng (không bao gồm admin)
            Long totalUsers = userRepository.count() - userRepository.countAdministrators();
            stats.put("totalUsers", totalUsers != null ? totalUsers : 0L);
            
            // Số lượng landlord
            Long totalLandlords = userRepository.countUsersWithRole("Landlords");
            stats.put("totalLandlords", totalLandlords != null ? totalLandlords : 0L);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error getting overview statistics: " + e.getMessage());
            e.printStackTrace();
            // Return default values on error
            Map<String, Object> defaultStats = new HashMap<>();
            defaultStats.put("totalRooms", 0L);
            defaultStats.put("vipRooms", 0L);
            defaultStats.put("totalUsers", 0L);
            defaultStats.put("totalLandlords", 0L);
            return ResponseEntity.ok(defaultStats);
        }
    }

    /**
     * API lấy số phòng trống
     */
    @GetMapping("/available-rooms")
    public ResponseEntity<Long> getAvailableRoomsCount() {
        try {
            Long count = roomRepository.countAcceptedApprovalRooms();
            return ResponseEntity.ok(count != null ? count : 0L);
        } catch (Exception e) {
            System.err.println("Error getting available rooms count: " + e.getMessage());
            return ResponseEntity.ok(0L);
        }
    }

    /**
     * API lấy số phòng VIP
     */
    @GetMapping("/vip-rooms")
    public ResponseEntity<Long> getVipRoomsCount() {
        try {
            Long count = roomRepository.countVipRooms();
            return ResponseEntity.ok(count != null ? count : 0L);
        } catch (Exception e) {
            System.err.println("Error getting VIP rooms count: " + e.getMessage());
            return ResponseEntity.ok(0L);
        }
    }

    /**
     * API lấy tổng số người dùng
     */
    @GetMapping("/total-users")
    public ResponseEntity<Long> getTotalUsersCount() {
        try {
            Long total = userRepository.count();
            Long admins = userRepository.countAdministrators();
            Long count = total - (admins != null ? admins : 0L);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("Error getting total users count: " + e.getMessage());
            return ResponseEntity.ok(0L);
        }
    }
}
