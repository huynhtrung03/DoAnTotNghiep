// package com.ants.ktc.ants_ktc.services;

// import java.util.ArrayList;
// import java.util.Collections;
// import java.util.List;
// import java.util.UUID;
// import java.util.concurrent.CompletableFuture;
// import java.util.concurrent.Semaphore;
// import java.util.stream.Collectors;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.data.domain.PageRequest;
// import org.springframework.data.domain.Pageable;
// import org.springframework.scheduling.annotation.Async;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.ants.ktc.ants_ktc.dtos.room.RoomSuggestionInfoDto;
// import com.ants.ktc.ants_ktc.entities.Favorite;
// import com.ants.ktc.ants_ktc.entities.Room;
// import com.ants.ktc.ants_ktc.entities.User;
// import com.ants.ktc.ants_ktc.repositories.FavoriteJpaRepository;
// import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
// import com.ants.ktc.ants_ktc.repositories.projection.RoomSuggestionProjection;

// @Service
// public class RoomSuggestionService {

//     @Autowired
//     private FavoriteJpaRepository favoriteJpaRepository;

//     @Autowired
//     private RoomJpaRepository roomJpaRepository;

//     @Autowired
//     private MailService mailService;

//     // Semaphore để giới hạn số lượng email gửi đồng thời (tránh spam)
//     private final Semaphore emailSemaphore = new Semaphore(5); // Tối đa 5 email cùng lúc

//     // @Scheduled(cron = "0 0 7 * * ?")
//     // public void sendMorningSuggestions() {
//     // System.out.println("[RoomSuggestionService] Starting morning room suggestions
//     // at 7:00 AM");
//     // sendRoomSuggestionsToAllUsers();
//     // }

//     @Scheduled(cron = "0 0 19 * * ?")
//     public void sendEveningSuggestions() {
//         System.out.println("[RoomSuggestionService] Starting evening room suggestions at 7:00 PM");
//         sendRoomSuggestionsToAllUsers();
//     }

//     @Transactional(readOnly = true)
//     public void sendRoomSuggestionsToAllUsers() {
//         try {
//             // Lấy tất cả user có favorite rooms
//             List<User> usersWithFavorites = favoriteJpaRepository.findUsersWithFavorites();
//             System.out.println("[RoomSuggestionService] Found " + usersWithFavorites.size() + " users with favorites");

//             List<CompletableFuture<Void>> futures = new ArrayList<>();

//             for (User user : usersWithFavorites) {
//                 // Xử lý bất đồng bộ cho từng user để tránh block
//                 CompletableFuture<Void> future = processUserSuggestionAsync(user);
//                 futures.add(future);

//                 // Thêm delay nhỏ giữa các user để tránh quá tải
//                 try {
//                     Thread.sleep(3000); // 3000ms delay
//                 } catch (InterruptedException e) {
//                     Thread.currentThread().interrupt();
//                     break;
//                 }
//             }

//             // Đợi tất cả hoàn thành
//             CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
//             System.out.println("[RoomSuggestionService] Completed sending suggestions to all users");

//         } catch (Exception e) {
//             System.err.println("[RoomSuggestionService] Error in sendRoomSuggestionsToAllUsers: " + e.getMessage());
//             e.printStackTrace();
//         }
//     }

//     @Async
//     public CompletableFuture<Void> processUserSuggestionAsync(User user) {
//         try {
//             // Acquire semaphore trước khi gửi email
//             emailSemaphore.acquire();

//             try {
//                 // Kiểm tra user có bật email notifications không
//                 if (user.getProfile() == null || !user.getProfile().isEmailNotifications()) {
//                     System.out.println("[RoomSuggestionService] User " + user.getUsername()
//                             + " has email notifications disabled, skipping");
//                     return CompletableFuture.completedFuture(null);
//                 }

//                 List<RoomSuggestionInfoDto> suggestions = findSuggestedRoomsForUser(user);

//                 if (!suggestions.isEmpty()) {
//                     String userEmail = user.getProfile() != null ? user.getProfile().getEmail() : null;
//                     String userName = user.getProfile() != null ? user.getProfile().getFullName() : user.getUsername();

//                     if (userEmail != null && !userEmail.trim().isEmpty()) {
//                         mailService.sendRoomSuggestionEmail(userEmail, userName, suggestions);
//                         System.out.println(
//                                 "[RoomSuggestionService] Sent " + suggestions.size() + " suggestions to: " + userEmail);
//                     }
//                 }
//             } finally {
//                 // Release semaphore sau khi hoàn thành
//                 emailSemaphore.release();
//             }

//         } catch (Exception e) {
//             System.err.println(
//                     "[RoomSuggestionService] Error processing user " + user.getUsername() + ": " + e.getMessage());
//             e.printStackTrace();
//         }

//         return CompletableFuture.completedFuture(null);
//     }

//     @Transactional(readOnly = true)
//     public List<RoomSuggestionInfoDto> findSuggestedRoomsForUser(User user) {
//         try {
//             // Kiểm tra user có tọa độ search không
//             Double userLat = null;
//             Double userLng = null;

//             if (user.getProfile() != null) {
//                 userLat = user.getProfile().getSearchLatitude();
//                 userLng = user.getProfile().getSearchLongitude();
//             }

//             // Lấy danh sách phòng yêu thích của user để phân tích criteria
//             List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), Pageable.unpaged())
//                     .getContent();

//             if (favorites.isEmpty()) {
//                 System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has no favorite rooms");
//                 return Collections.emptyList();
//             }

//             System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has " + favorites.size()
//                     + " favorite rooms");

//             // Phân tích pattern từ phòng yêu thích để có criteria
//             RoomCriteria criteria = analyzeFavoriteRoomsCriteria(favorites);

//             // Nếu có tọa độ, tìm phòng trong bán kính + match criteria
//             if (userLat != null && userLng != null) {
//                 System.out.println("[RoomSuggestionService] User " + user.getUsername() +
//                         " has search coordinates: " + userLat + ", " + userLng +
//                         ", using combined radius + criteria search");

//                 List<RoomSuggestionProjection> combinedResults = findRoomsWithRadiusAndCriteria(
//                         userLat, userLng, criteria, user.getId());

//                 System.out.println("[RoomSuggestionService] Found " + combinedResults.size() +
//                         " rooms with combined criteria for user " + user.getUsername());

//                 if (!combinedResults.isEmpty()) {
//                     // Convert RoomSuggestionProjection sang RoomSuggestionInfoDto với khoảng cách
//                     return combinedResults.stream()
//                             .map(roomProj -> convertSuggestionProjectionToSuggestionInfo(roomProj))
//                             .collect(Collectors.toList());
//                 }

//                 // Fallback: nếu không tìm thấy phòng nào với combined criteria,
//                 // thử chỉ tìm theo bán kính (loại bỏ một số criteria)
//                 System.out.println("[RoomSuggestionService] No rooms found with combined criteria, " +
//                         "trying radius-only search for user " + user.getUsername());

//                 List<RoomSuggestionProjection> nearbyRooms = roomJpaRepository.findRoomSuggestionsWithRadius(
//                         userLat, userLng, 5.0);

//                 if (nearbyRooms.isEmpty()) {
//                     System.out.println("[RoomSuggestionService] No rooms found within 5km, trying 10km radius...");
//                     nearbyRooms = roomJpaRepository.findRoomSuggestionsWithRadius(
//                             userLat, userLng, 10.0);
//                 }

//                 if (!nearbyRooms.isEmpty()) {
//                     return nearbyRooms.stream()
//                             .map(roomProj -> convertSuggestionProjectionToSuggestionInfo(roomProj))
//                             .collect(Collectors.toList());
//                 }
//             }

//             // Nếu không có tọa độ hoặc không tìm thấy phòng trong bán kính,
//             // sử dụng logic cũ dựa trên yêu thích
//             System.out
//                     .println("[RoomSuggestionService] Using favorite-based suggestion for user " + user.getUsername());

//             // In ra thông tin phòng yêu thích để debug
//             for (Favorite fav : favorites) {
//                 Room favRoom = fav.getRoom();
//                 if (favRoom != null) {
//                     String location = "";
//                     if (favRoom.getAddress() != null && favRoom.getAddress().getWard() != null) {
//                         location = favRoom.getAddress().getWard().getDistrict().getProvince().getName();
//                     }
//                     System.out.println("[RoomSuggestionService] Favorite room: " + favRoom.getTitle() +
//                             ", Price: " + favRoom.getPrice_month() +
//                             ", Area: " + favRoom.getArea() +
//                             ", Location: " + location);
//                 }
//             }

//             // Tìm phòng phù hợp dựa trên criteria, loại trừ những phòng user đã yêu thích
//             List<Room> suggestedRooms = findRoomsByCriteria(criteria, user.getId());

//             System.out.println("[RoomSuggestionService] Found " + suggestedRooms.size() + " suggested rooms for user "
//                     + user.getUsername());

//             // Lấy địa chỉ của user để tính khoảng cách
//             String userAddress = getUserAddress(user);

//             // Convert sang RoomSuggestionInfo với tính khoảng cách
//             return suggestedRooms.stream()
//                     .map(room -> convertToSuggestionInfo(room, userAddress))
//                     .collect(Collectors.toList());

//         } catch (Exception e) {
//             System.err.println("[RoomSuggestionService] Error finding suggestions for user " + user.getUsername() + ": "
//                     + e.getMessage());
//             e.printStackTrace();
//             return Collections.emptyList();
//         }
//     }

//     /**
//      * Tìm phòng trong bán kính và match criteria yêu thích
//      */
//     private List<RoomSuggestionProjection> findRoomsWithRadiusAndCriteria(
//             Double userLat, Double userLng, RoomCriteria criteria, UUID excludeUserId) {

//         try {
//             // Chuẩn bị parameters cho query
//             double avgPrice = (criteria.getMinPrice() + criteria.getMaxPrice()) / 2;

//             // Thử tìm trong bán kính 5km trước
//             List<RoomSuggestionProjection> results = roomJpaRepository.findRoomSuggestionsWithRadiusAndCriteria(
//                     userLat, userLng, 5.0,
//                     criteria.getMinPrice(), criteria.getMaxPrice(), avgPrice,
//                     criteria.getMinArea(), criteria.getMaxArea(),
//                     criteria.getPreferredProvinces(),
//                     criteria.getPreferredDistricts(),
//                     criteria.getPreferredWards(),
//                     excludeUserId.toString());

//             // Nếu không có kết quả, thử bán kính 10km
//             if (results.isEmpty()) {
//                 System.out.println("[RoomSuggestionService] No rooms found within 5km with criteria, trying 10km...");
//                 results = roomJpaRepository.findRoomSuggestionsWithRadiusAndCriteria(
//                         userLat, userLng, 10.0,
//                         criteria.getMinPrice(), criteria.getMaxPrice(), avgPrice,
//                         criteria.getMinArea(), criteria.getMaxArea(),
//                         criteria.getPreferredProvinces(),
//                         criteria.getPreferredDistricts(),
//                         criteria.getPreferredWards(),
//                         excludeUserId.toString());
//             }

//             return results;
//         } catch (Exception e) {
//             System.err.println("[RoomSuggestionService] Error in findRoomsWithRadiusAndCriteria: " + e.getMessage());
//             e.printStackTrace();
//             return Collections.emptyList();
//         }
//     }

//     private RoomCriteria analyzeFavoriteRoomsCriteria(List<Favorite> favorites) {
//         RoomCriteria criteria = new RoomCriteria();

//         List<Double> prices = new ArrayList<>();
//         List<Double> areas = new ArrayList<>();
//         List<String> provinces = new ArrayList<>();
//         List<String> districts = new ArrayList<>();
//         List<String> wards = new ArrayList<>();

//         for (Favorite favorite : favorites) {
//             Room room = favorite.getRoom();
//             if (room != null) {
//                 prices.add(room.getPrice_month());
//                 areas.add(room.getArea());

//                 if (room.getAddress() != null) {
//                     if (room.getAddress().getWard() != null) {
//                         wards.add(room.getAddress().getWard().getName());

//                         if (room.getAddress().getWard().getDistrict() != null) {
//                             districts.add(room.getAddress().getWard().getDistrict().getName());

//                             if (room.getAddress().getWard().getDistrict().getProvince() != null) {
//                                 provinces.add(room.getAddress().getWard().getDistrict().getProvince().getName());
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         // Tính toán khoảng giá linh hoạt: ±1,000,000 VND từ trung bình (tăng từ ±300k)
//         // Nếu giá trung bình thấp, sử dụng % để linh hoạt hơn
//         if (!prices.isEmpty()) {
//             double avgPrice = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);

//             // Sử dụng khoảng linh hoạt: ±1 triệu hoặc ±50% (chọn giá trị lớn hơn)
//             double priceRange = Math.max(1000000, avgPrice * 0.5);

//             criteria.setMinPrice(Math.max(0, avgPrice - priceRange)); // Không âm
//             criteria.setMaxPrice(avgPrice + priceRange);

//             System.out.println("[RoomSuggestionService] Average price: " + avgPrice +
//                     ", Price range (±" + priceRange + "): " + criteria.getMinPrice() + " - " + criteria.getMaxPrice());
//         }

//         // Tính toán khoảng diện tích linh hoạt: ±40% từ trung bình
//         if (!areas.isEmpty()) {
//             double avgArea = areas.stream().mapToDouble(Double::doubleValue).average().orElse(0);
//             criteria.setMinArea(Math.max(5, avgArea * 0.6)); // Tối thiểu 5m²
//             criteria.setMaxArea(avgArea * 1.4);

//             System.out.println("[RoomSuggestionService] Average area: " + avgArea +
//                     ", Area range: " + criteria.getMinArea() + " - " + criteria.getMaxArea());
//         }

//         // Ưu tiên địa chỉ theo thứ tự: cùng phường > cùng quận > cùng tỉnh
//         criteria.setPreferredProvinces(getTopItems(provinces, 5)); // Tăng số lượng tỉnh
//         criteria.setPreferredDistricts(getTopItems(districts, 8)); // Tăng số lượng quận
//         criteria.setPreferredWards(getTopItems(wards, 10)); // Thêm phường

//         System.out.println(
//                 "[RoomSuggestionService] Preferred locations - Provinces: " + criteria.getPreferredProvinces() +
//                         ", Districts: " + criteria.getPreferredDistricts() +
//                         ", Wards: " + criteria.getPreferredWards());

//         // Debug: in ra tổng số địa danh để kiểm tra
//         System.out.println(
//                 "[RoomSuggestionService] Total location items - Provinces: " + criteria.getPreferredProvinces().size() +
//                         ", Districts: " + criteria.getPreferredDistricts().size() +
//                         ", Wards: " + criteria.getPreferredWards().size());

//         return criteria;
//     }

//     // Method để test với user cụ thể
//     public void testSuggestionForUser(String username) {
//         try {
//             List<User> allUsers = favoriteJpaRepository.findUsersWithFavorites();
//             User targetUser = allUsers.stream()
//                     .filter(user -> user.getUsername().equals(username))
//                     .findFirst()
//                     .orElse(null);

//             if (targetUser != null) {
//                 System.out.println("[RoomSuggestionService] Testing suggestion for user: " + username);
//                 List<RoomSuggestionInfoDto> suggestions = findSuggestedRoomsForUser(targetUser);

//                 if (!suggestions.isEmpty()) {
//                     String userEmail = targetUser.getProfile() != null ? targetUser.getProfile().getEmail() : null;
//                     String userName = targetUser.getProfile() != null ? targetUser.getProfile().getFullName()
//                             : targetUser.getUsername();

//                     if (userEmail != null && !userEmail.trim().isEmpty()) {
//                         System.out.println("[RoomSuggestionService] Sending " + suggestions.size() + " suggestions to: "
//                                 + userEmail);
//                         mailService.sendRoomSuggestionEmail(userEmail, userName, suggestions);
//                     } else {
//                         System.out.println("[RoomSuggestionService] User has no email address");
//                     }
//                 } else {
//                     System.out.println("[RoomSuggestionService] No suggestions found for user: " + username);
//                 }
//             } else {
//                 System.out.println("[RoomSuggestionService] User not found or has no favorites: " + username);
//             }
//         } catch (Exception e) {
//             System.err.println(
//                     "[RoomSuggestionService] Error testing suggestion for user " + username + ": " + e.getMessage());
//             e.printStackTrace();
//         }
//     }

//     private List<String> getTopItems(List<String> items, int limit) {
//         return items.stream()
//                 .collect(Collectors.groupingBy(item -> item, Collectors.counting()))
//                 .entrySet().stream()
//                 .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
//                 .limit(limit)
//                 .map(entry -> entry.getKey())
//                 .collect(Collectors.toList());
//     }

//     @Transactional(readOnly = true)
//     public List<Room> findRoomsByCriteria(RoomCriteria criteria, UUID excludeUserId) {
//         try {
//             Pageable pageable = PageRequest.of(0, 8); // 8 phòng gợi ý

//             System.out.println("[RoomSuggestionService] === QUERY DEBUG INFO ===");
//             System.out.println("[RoomSuggestionService] User ID to exclude: " + excludeUserId);
//             System.out.println(
//                     "[RoomSuggestionService] Price range (MAIN CRITERIA): " + criteria.getMinPrice() + " - "
//                             + criteria.getMaxPrice());
//             System.out.println(
//                     "[RoomSuggestionService] Area range (SORTING ONLY): " + criteria.getMinArea() + " - "
//                             + criteria.getMaxArea());
//             System.out
//                     .println("[RoomSuggestionService] Provinces (MAIN CRITERIA): " + criteria.getPreferredProvinces());
//             System.out
//                     .println("[RoomSuggestionService] Districts (SORTING ONLY): " + criteria.getPreferredDistricts());
//             System.out.println("[RoomSuggestionService] Wards (SORTING ONLY): " + criteria.getPreferredWards());
//             System.out.println(
//                     "[RoomSuggestionService] NOTE: Only price and province are used for filtering. Districts, wards and area are only used for sorting preference.");

//             // Xử lý empty lists để tránh lỗi SQL
//             List<String> provinces = criteria.getPreferredProvinces().isEmpty() ? List.of("__NO_PROVINCE_MATCH__")
//                     : criteria.getPreferredProvinces();
//             List<String> districts = criteria.getPreferredDistricts().isEmpty() ? List.of("__NO_DISTRICT_MATCH__")
//                     : criteria.getPreferredDistricts();
//             List<String> wards = criteria.getPreferredWards().isEmpty() ? List.of("__NO_WARD_MATCH__")
//                     : criteria.getPreferredWards();

//             List<Room> results = roomJpaRepository.findSuggestedRoomsFlexible(
//                     criteria.getMinPrice(),
//                     criteria.getMaxPrice(),
//                     criteria.getMinArea(),
//                     criteria.getMaxArea(),
//                     provinces,
//                     districts,
//                     wards,
//                     excludeUserId,
//                     pageable);

//             System.out.println(
//                     "[RoomSuggestionService] Query returned " + results.size() + " rooms for user " + excludeUserId);

//             if (results.isEmpty()) {
//                 System.out.println("[RoomSuggestionService] === NO RESULTS - POSSIBLE REASONS ===");
//                 System.out.println("[RoomSuggestionService] 1. No rooms with price between " + criteria.getMinPrice()
//                         + " - " + criteria.getMaxPrice());
//                 System.out.println("[RoomSuggestionService] 2. No rooms in specified provinces: "
//                         + criteria.getPreferredProvinces());
//                 System.out.println("[RoomSuggestionService] 3. All matching rooms are already in user's favorites");
//                 System.out.println(
//                         "[RoomSuggestionService] 4. No rooms with available=0, approval=1, hidden=0, isRemoved=0");
//                 System.out
//                         .println(
//                                 "[RoomSuggestionService] NOTE: Only province match is required. Districts, wards and area are used for sorting only");
//             }

//             // Log một số phòng suggest để debug
//             for (int i = 0; i < Math.min(3, results.size()); i++) {
//                 Room room = results.get(i);
//                 String location = "";
//                 if (room.getAddress() != null && room.getAddress().getWard() != null) {
//                     location = room.getAddress().getWard().getDistrict().getProvince().getName();
//                 }
//                 System.out.println("[RoomSuggestionService] Suggested room " + (i + 1) + ": " + room.getTitle() +
//                         ", Price: " + room.getPrice_month() +
//                         ", Area: " + room.getArea() +
//                         ", Location: " + location);
//             }

//             return results;

//         } catch (Exception e) {
//             System.err.println("[RoomSuggestionService] Error finding rooms by criteria: " + e.getMessage());
//             e.printStackTrace();
//             return Collections.emptyList();
//         }
//     }

//     private RoomSuggestionInfoDto convertToSuggestionInfo(Room room, String userAddress) {
//         String address = "";
//         String landlordName = "";
//         String landlordEmail = "";
//         String landlordPhone = "";

//         if (room.getAddress() != null) {
//             StringBuilder addressBuilder = new StringBuilder();
//             addressBuilder.append(room.getAddress().getStreet() != null ? room.getAddress().getStreet() : "");

//             if (room.getAddress().getWard() != null) {
//                 addressBuilder.append(", ").append(room.getAddress().getWard().getName());

//                 if (room.getAddress().getWard().getDistrict() != null) {
//                     addressBuilder.append(", ").append(room.getAddress().getWard().getDistrict().getName());

//                     if (room.getAddress().getWard().getDistrict().getProvince() != null) {
//                         addressBuilder.append(", ")
//                                 .append(room.getAddress().getWard().getDistrict().getProvince().getName());
//                     }
//                 }
//             }
//             address = addressBuilder.toString();
//         }

//         if (room.getUser() != null && room.getUser().getProfile() != null) {
//             landlordName = room.getUser().getProfile().getFullName() != null ? room.getUser().getProfile().getFullName()
//                     : room.getUser().getUsername();
//             landlordEmail = room.getUser().getProfile().getEmail();
//             landlordPhone = room.getUser().getProfile().getPhoneNumber();
//         }

//         // Note: Khoảng cách không được tính trong method này vì chỉ dùng cho
//         // favorite-based suggestion

//         RoomSuggestionInfoDto dto = new RoomSuggestionInfoDto();
//         dto.setId(room.getId());
//         dto.setTitle(room.getTitle());
//         dto.setPriceMonth(room.getPrice_month());
//         dto.setArea(room.getArea());
//         dto.setAddress(address);
//         dto.setDescription(room.getDescription());
//         dto.setLandlordName(landlordName);
//         dto.setLandlordEmail(landlordEmail);
//         dto.setLandlordPhone(landlordPhone);
//         dto.setDistanceKm(null); // distanceKm - không tính trong favorite-based suggestion

//         return dto;
//     }

//     /**
//      * Convert RoomSuggestionProjection (từ query findRoomSuggestionsWithRadius)
//      * sang
//      * RoomSuggestionInfoDto
//      * RoomSuggestionProjection đã có khoảng cách được tính sẵn
//      */
//     private RoomSuggestionInfoDto convertSuggestionProjectionToSuggestionInfo(RoomSuggestionProjection roomProj) {
//         RoomSuggestionInfoDto dto = new RoomSuggestionInfoDto();
//         dto.setId(roomProj.getId());
//         dto.setTitle(roomProj.getTitle());
//         dto.setPriceMonth(roomProj.getPriceMonth());
//         dto.setArea(roomProj.getArea());
//         dto.setAddress(roomProj.getFullAddress());
//         dto.setDescription(roomProj.getDescription());
//         dto.setLandlordName(roomProj.getLandlordName());
//         dto.setLandlordEmail(roomProj.getLandlordEmail());
//         dto.setLandlordPhone(roomProj.getLandlordPhone());
//         dto.setDistanceKm(roomProj.getDistance()); // Khoảng cách đã được tính trong query SQL

//         return dto;
//     }

//     // Inner class để chứa criteria tìm kiếm
//     private static class RoomCriteria {
//         private Double minPrice;
//         private Double maxPrice;
//         private Double minArea;
//         private Double maxArea;
//         private List<String> preferredProvinces = new ArrayList<>();
//         private List<String> preferredDistricts = new ArrayList<>();
//         private List<String> preferredWards = new ArrayList<>();

//         // Getters and Setters
//         public Double getMinPrice() {
//             return minPrice;
//         }

//         public void setMinPrice(Double minPrice) {
//             this.minPrice = minPrice;
//         }

//         public Double getMaxPrice() {
//             return maxPrice;
//         }

//         public void setMaxPrice(Double maxPrice) {
//             this.maxPrice = maxPrice;
//         }

//         public Double getMinArea() {
//             return minArea;
//         }

//         public void setMinArea(Double minArea) {
//             this.minArea = minArea;
//         }

//         public Double getMaxArea() {
//             return maxArea;
//         }

//         public void setMaxArea(Double maxArea) {
//             this.maxArea = maxArea;
//         }

//         public List<String> getPreferredProvinces() {
//             return preferredProvinces;
//         }

//         public void setPreferredProvinces(List<String> preferredProvinces) {
//             this.preferredProvinces = preferredProvinces;
//         }

//         public List<String> getPreferredDistricts() {
//             return preferredDistricts;
//         }

//         public void setPreferredDistricts(List<String> preferredDistricts) {
//             this.preferredDistricts = preferredDistricts;
//         }

//         public List<String> getPreferredWards() {
//             return preferredWards;
//         }

//         public void setPreferredWards(List<String> preferredWards) {
//             this.preferredWards = preferredWards;
//         }
//     }

//     // Method để lấy địa chỉ của user từ profile
//     private String getUserAddress(User user) {
//         if (user.getProfile() == null) {
//             System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has no profile");
//             return null;
//         }

//         if (user.getProfile().getAddress() == null) {
//             System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has no address in profile");
//             return null;
//         }

//         // Build địa chỉ từ Address entity
//         StringBuilder addressBuilder = new StringBuilder();
//         com.ants.ktc.ants_ktc.entities.address.Address address = user.getProfile().getAddress();

//         if (address.getStreet() != null && !address.getStreet().trim().isEmpty()) {
//             addressBuilder.append(address.getStreet());
//         }

//         if (address.getWard() != null) {
//             if (addressBuilder.length() > 0)
//                 addressBuilder.append(", ");
//             addressBuilder.append(address.getWard().getName());

//             if (address.getWard().getDistrict() != null) {
//                 addressBuilder.append(", ").append(address.getWard().getDistrict().getName());

//                 if (address.getWard().getDistrict().getProvince() != null) {
//                     addressBuilder.append(", ").append(address.getWard().getDistrict().getProvince().getName());
//                 }
//             }
//         }

//         String fullAddress = addressBuilder.toString();
//         if (fullAddress.trim().isEmpty()) {
//             System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has empty address");
//             return null;
//         }

//         System.out.println("[RoomSuggestionService] User " + user.getUsername() + " address: " + fullAddress);
//         return fullAddress;
//     }
// }
// ----------------------------------------------------------------------------------------//

package com.ants.ktc.ants_ktc.services;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.dtos.room.RoomSuggestionInfoDto;
import com.ants.ktc.ants_ktc.entities.*;
import com.ants.ktc.ants_ktc.repositories.FavoriteJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository; // Cần repo này để tìm user đơn lẻ
import com.ants.ktc.ants_ktc.repositories.UserViewRoomRepository;

@Service
public class RoomSuggestionService {

    @Autowired
    private FavoriteJpaRepository favoriteJpaRepository;
    @Autowired
    private RoomJpaRepository roomJpaRepository;
    @Autowired
    private UserJpaRepository userJpaRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private UserViewRoomRepository userViewRoomRepository;

    private static final double THRESHOLD = 0.75; // Ngưỡng chấp nhận Recommendation>=0.75

    // Gửi định kỳ lúc 19:00 hàng ngày
    @Scheduled(cron = "0 0 19 * * ?")
    public void sendRoomSuggestionsToAllUsers() {
        List<User> users = favoriteJpaRepository.findUsersWithFavorites();
        for (User user : users) {
            processUserSuggestionML(user);
        }
    }

    // Hàm test cho 1 user (Để sửa lỗi ở Controller)
    public void testSuggestionForUser(String username) {
        userJpaRepository.findByUsername(username).ifPresent(this::processUserSuggestionML);
    }

    @Transactional(readOnly = true)
    public void processUserSuggestionML(User user) {
        // 1. Check ML Readiness (Cần có Favorites & Tọa độ tìm kiếm)
        List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), PageRequest.of(0,
                50))
                .getContent();
        if (favorites.isEmpty() || user.getProfile() == null ||
                user.getProfile().getSearchLatitude() == null) {
            return;
        }

        // 2. Build User Preference Profile (Hồ sơ đặc trưng)
        UserPreferenceProfile profile = buildProfile(favorites, user);

        // 3. Find Candidate Rooms (Lọc sơ bộ các phòng khả dụng)
        List<Room> allRooms = roomJpaRepository.findAll().stream()
                .filter(r -> r.getApproval() == 1 && r.getIsRemoved() == 0 &&
                        r.getAvailable() == 0)
                .filter(r -> favorites.stream().noneMatch(f -> f.getRoom().getId().equals(r.getId())))
                .collect(Collectors.toList());

        // 4. Calculate Similarity & Filter (Weighted Power Sum)
        List<RoomSuggestionInfoDto> topSuggestions = allRooms.stream()
                .map(room -> calculateSimilarity(profile, room))
                .filter(dto -> dto.getMatchPercentage() >= (THRESHOLD * 100)) // Lọc theo ngưỡng 0.75
                .sorted(Comparator.comparing(RoomSuggestionInfoDto::getMatchPercentage).reversed())
                // Sắp xếp theo
                // Score
                .limit(5) // Lấy Top 5 gợi ý tốt nhất
                .collect(Collectors.toList());

        // 5. Send Email Notification
        if (!topSuggestions.isEmpty() && user.getProfile().isEmailNotifications()) {
            mailService.sendRoomSuggestionEmail(user.getProfile().getEmail(),
                    user.getProfile().getFullName(),
                    topSuggestions);
        }
    }

    // Hàm tính toán độ tương đồng của phòng yêu thích
    public Map<String, Object> getSuggestionsForUser(UUID userId) {
        User user = userJpaRepository.findById(userId).orElse(null);
        if (user == null)
            return null;

        List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), PageRequest.of(0, 50))
                .getContent();
        if (favorites.isEmpty() || user.getProfile() == null)
            return null;

        UserPreferenceProfile profile = buildProfile(favorites, user);

        Map<String, Object> result = new HashMap<>();
        result.put("userLat", profile.userLat);
        result.put("userLng", profile.userLng);
        result.put("avgPrice", profile.avgPrice);
        result.put("avgArea", profile.avgArea);
        result.put("avgCapacity", profile.avgCapacity);
        result.put("avgLen", profile.avgLen);
        result.put("avgWid", profile.avgWid);

        // Convert Set<Long> to List<Long> for better JSON compatibility
        // Convert favConvenientIds to detailed list with names
        if (profile.favConvenientIds != null && !profile.favConvenientIds.isEmpty()) {
            // Collect all convenients from favorites to map ID -> Name
            Map<Long, String> convenientIdToName = favorites.stream()
                    .flatMap(f -> f.getRoom().getConvenients().stream())
                    .filter(c -> profile.favConvenientIds.contains(c.getId()))
                    .collect(Collectors.toMap(
                            Convenient::getId,
                            Convenient::getName,
                            (existing, replacement) -> existing // Keep existing if duplicate
                    ));

            List<String> detailedConvenients = new ArrayList<>();
            for (Long id : profile.favConvenientIds) {
                if (convenientIdToName.containsKey(id)) {
                    detailedConvenients.add(convenientIdToName.get(id));
                }
            }
            result.put("favConvenientIds", detailedConvenients);
        } else {
            result.put("favConvenientIds", new ArrayList<>());
        }

        return result;
    }

    private RoomSuggestionInfoDto calculateSimilarity(UserPreferenceProfile p,
            Room r) {
        // Trọng số (wi) từ slide: Price(25%), Location(20%), Area(20%), Dimension(15%),
        // Capacity(10%), Utilities(10%)
        double wPrice = 0.25, wLocation = 0.20, wArea = 0.20, wDimension = 0.15,
                wCapacity = 0.10, wUtilities = 0.10;

        // Tính toán si (Normalized Differences)
        double sPrice = 1.0 - Math.min(1.0, Math.abs(r.getPrice_month() - p.avgPrice)
                / p.avgPrice);
        double sArea = 1.0 - Math.min(1.0, Math.abs(r.getArea() - p.avgArea) /
                p.avgArea);
        double sCap = 1.0
                - Math.min(1.0, Math.abs((r.getMaxPeople() != null ? r.getMaxPeople() : 0) -
                        p.avgCapacity) / 5.0);

        double distance = haversine(p.userLat, p.userLng, r.getAddress().getLat(),
                r.getAddress().getLng());
        double sLoc = Math.max(0, 1.0 - (distance / 10.0)); // Giả định tối ưu trong 10km

        double sDim = 1.0 - Math.min(1.0, (Math.abs((r.getRoomLength() != null ? r.getRoomLength() : 0) - p.avgLen) +
                Math.abs((r.getRoomWidth() != null ? r.getRoomWidth() : 0) - p.avgWid)) /
                10.0);

        long matches = r.getConvenients().stream().filter(c -> p.favConvenientIds.contains(c.getId())).count();
        double sUtil = p.favConvenientIds.isEmpty() ? 0
                : (double) matches /
                        p.favConvenientIds.size();

        // Công thức: S(u,r) = Σ wi * si
        double totalScore = (sPrice * wPrice) + (sLoc * wLocation) + (sArea * wArea)
                + (sDim * wDimension)
                + (sCap * wCapacity) + (sUtil * wUtilities);

        return convertToDto(r, totalScore, distance);
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Bán kính trái đất (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private UserPreferenceProfile buildProfile(List<Favorite> favs, User u) {
        UserPreferenceProfile p = new UserPreferenceProfile();
        p.userLat = u.getProfile().getSearchLatitude();
        p.userLng = u.getProfile().getSearchLongitude();
        p.avgPrice = favs.stream().mapToDouble(f -> f.getRoom().getPrice_month()).average().orElse(0);
        p.avgArea = favs.stream().mapToDouble(f -> f.getRoom().getArea()).average().orElse(0);
        p.avgCapacity = favs.stream()
                .mapToDouble(f -> f.getRoom().getMaxPeople() != null ? f.getRoom().getMaxPeople() : 0).average()
                .orElse(0);
        p.avgLen = favs.stream().mapToDouble(f -> f.getRoom().getRoomLength() != null
                ? f.getRoom().getRoomLength()
                : 0)
                .average().orElse(0);
        p.avgWid = favs.stream().mapToDouble(f -> f.getRoom().getRoomWidth() != null
                ? f.getRoom().getRoomWidth()
                : 0)
                .average().orElse(0);
        p.favConvenientIds = favs.stream().flatMap(f -> f.getRoom().getConvenients().stream()).map(Convenient::getId)
                .collect(Collectors.toSet());
        return p;
    }

    // private RoomSuggestionInfoDto convertToDto(Room r, double score, double dist)
    // {
    // RoomSuggestionInfoDto dto = new RoomSuggestionInfoDto();
    // dto.setId(r.getId());
    // dto.setTitle(r.getTitle());
    // dto.setPriceMonth(r.getPrice_month());
    // dto.setArea(r.getArea());
    // dto.setDistanceKm(dist);
    // dto.setMatchPercentage(score * 100);
    // dto.setLandlordName(
    // r.getUser().getProfile() != null ? r.getUser().getProfile().getFullName() :
    // r.getUser().getUsername());
    // return dto;
    // }
    private RoomSuggestionInfoDto convertToDto(Room r, double score, double dist) {
        RoomSuggestionInfoDto dto = new RoomSuggestionInfoDto();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setPriceMonth(r.getPrice_month());
        dto.setArea(r.getArea());
        dto.setDistanceKm(dist);
        dto.setMatchPercentage(score * 100);
        dto.setDescription(r.getDescription() != null ? r.getDescription() : "Không có mô tả");

        // Lấy địa chỉ đầy đủ từ thực thể Address (Phải fetch dữ liệu này từ DB)
        if (r.getAddress() != null) {
            StringBuilder addr = new StringBuilder();
            if (r.getAddress().getStreet() != null)
                addr.append(r.getAddress().getStreet());

            if (r.getAddress().getWard() != null) {
                addr.append(", ").append(r.getAddress().getWard().getName());
                if (r.getAddress().getWard().getDistrict() != null) {
                    addr.append(", ").append(r.getAddress().getWard().getDistrict().getName());
                    if (r.getAddress().getWard().getDistrict().getProvince() != null) {
                        addr.append(", ").append(r.getAddress().getWard().getDistrict().getProvince().getName());
                    }
                }
            }
            dto.setAddress(addr.toString());
        } else {
            dto.setAddress("Chưa cập nhật địa chỉ");
        }

        // Lấy thông tin chủ trọ từ UserProfile
        if (r.getUser() != null && r.getUser().getProfile() != null) {
            UserProfile profile = r.getUser().getProfile();
            dto.setLandlordName(profile.getFullName() != null ? profile.getFullName() : r.getUser().getUsername());
            dto.setLandlordPhone(profile.getPhoneNumber() != null ? profile.getPhoneNumber() : "Chưa có số ĐT");
            dto.setLandlordEmail(profile.getEmail());
        }

        return dto;
    }

    // Hàm tính toán độ tương đồng của lịch sử xem phòng
    public Map<String, Object> getUserViewHistoryProfile(UUID userId) {
        User user = userJpaRepository.findById(userId).orElse(null);
        if (user == null)
            return null;

        List<UserViewRoom> viewedRooms = userViewRoomRepository
                .findByUserIdAndViewCountGreaterThanEqualOrderByCreatedDateDesc(user.getId(), 3, PageRequest.of(0, 50))
                .getContent();
        if (viewedRooms.isEmpty() || user.getProfile() == null)
            return null;

        UserPreferenceProfile profile = buildProfileFromViews(viewedRooms, user);

        Map<String, Object> result = new HashMap<>();
        result.put("userLat", profile.userLat);
        result.put("userLng", profile.userLng);
        result.put("avgPrice", profile.avgPrice);
        result.put("avgArea", profile.avgArea);
        result.put("avgCapacity", profile.avgCapacity);
        result.put("avgLen", profile.avgLen);
        result.put("avgWid", profile.avgWid);

        // Convert Set<Long> to List<String>
        if (profile.favConvenientIds != null && !profile.favConvenientIds.isEmpty()) {
            Map<Long, String> convenientIdToName = viewedRooms.stream()
                    .flatMap(v -> v.getRoom().getConvenients().stream())
                    .filter(c -> profile.favConvenientIds.contains(c.getId()))
                    .collect(Collectors.toMap(
                            Convenient::getId,
                            Convenient::getName,
                            (existing, replacement) -> existing));

            List<String> detailedConvenients = new ArrayList<>();
            for (Long id : profile.favConvenientIds) {
                if (convenientIdToName.containsKey(id)) {
                    detailedConvenients.add(convenientIdToName.get(id));
                }
            }
            result.put("favConvenientIds", detailedConvenients);
        } else {
            result.put("favConvenientIds", new ArrayList<>());
        }

        return result;
    }

    public Map<String, Object> getCombinedUserProfiles(UUID userId) {
        Map<String, Object> combinedResult = new HashMap<>();
        combinedResult.put("favoriteBasedProfile", getSuggestionsForUser(userId));
        combinedResult.put("viewHistoryBasedProfile", getUserViewHistoryProfile(userId));
        return combinedResult;
    }

    private UserPreferenceProfile buildProfileFromViews(List<UserViewRoom> views, User u) {
        UserPreferenceProfile p = new UserPreferenceProfile();
        p.userLat = u.getProfile().getSearchLatitude() != null ? u.getProfile().getSearchLatitude() : 0;
        p.userLng = u.getProfile().getSearchLongitude() != null ? u.getProfile().getSearchLongitude() : 0;

        p.avgPrice = views.stream().mapToDouble(f -> f.getRoom().getPrice_month()).average().orElse(0);
        p.avgArea = views.stream().mapToDouble(f -> f.getRoom().getArea()).average().orElse(0);

        p.avgCapacity = views.stream()
                .mapToDouble(f -> f.getRoom().getMaxPeople() != null ? f.getRoom().getMaxPeople() : 0).average()
                .orElse(0);

        p.avgLen = views.stream().mapToDouble(f -> f.getRoom().getRoomLength() != null
                ? f.getRoom().getRoomLength()
                : 0)
                .average().orElse(0);

        p.avgWid = views.stream().mapToDouble(f -> f.getRoom().getRoomWidth() != null
                ? f.getRoom().getRoomWidth()
                : 0)
                .average().orElse(0);

        p.favConvenientIds = views.stream().flatMap(f -> f.getRoom().getConvenients().stream()).map(Convenient::getId)
                .collect(Collectors.toSet());
        return p;
    }

    private static class UserPreferenceProfile {
        double userLat, userLng, avgPrice, avgArea, avgCapacity, avgLen, avgWid;
        Set<Long> favConvenientIds;
    }
}