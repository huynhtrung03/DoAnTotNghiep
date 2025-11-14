# API Profile Information - Documentation

## 📋 Tổng quan

Document này liệt kê tất cả các API endpoint liên quan đến **Profile Information** của user trong hệ thống.
**Base URL**: `/api/profile`

**Controller**: `ProfileController.java`  
**Service**: `ProfileService.java`

---

## 🔐 Authentication

Tất cả các API đều yêu cầu JWT token trong header (trừ khi được đánh dấu là public).

```
Authorization: Bearer <access_token>
```

---

## 📡 API Endpoints

### 1. **Get User Name by ID**

**Endpoint**: `GET /api/profile/getname/{id}`

**Mô tả**: Lấy tên và avatar của user theo userId

**Parameters**:
- `id` (path) - UUID của user

**Response Success** (200 OK):
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "fullName": "Nguyễn Văn A",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg"
}
```

**Response Error** (404 Not Found):
```json
{
  "message": "User not found"
}
```

**Use Cases**:
- Hiển thị tên user trong danh sách
- Hiển thị avatar trong comment/chat
- Load thông tin cơ bản user

---

### 2. **Update Profile**

**Endpoint**: `PATCH /api/profile/update`

**Mô tả**: Cập nhật thông tin profile của user, bao gồm avatar, thông tin cá nhân, địa chỉ, và thông tin ngân hàng

**Content-Type**: `multipart/form-data`

**Request Body**:
```
avatar: File (optional) - Ảnh avatar mới
profile: JSON string - Thông tin profile
```

**Profile JSON Structure**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phoneNumber": "0123456789",
  "bankName": "Vietcombank",
  "binCode": "970436",
  "bankNumber": "1234567890",
  "accoutHolderName": "NGUYEN VAN A",
  "address": {
    "street": "123 Đường ABC",
    "wardId": 12345
  }
}
```

**Response Success** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phoneNumber": "0123456789",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "bankName": "Vietcombank",
  "binCode": "970436",
  "bankNumber": "1234567890",
  "accoutHolderName": "NGUYEN VAN A",
  "address": {
    "id": "addr-uuid",
    "street": "123 Đường ABC",
    "ward": {
      "id": 12345,
      "name": "Phường 1",
      "district": {
        "id": 123,
        "name": "Quận 1",
        "province": {
          "id": 1,
          "name": "Thành phố Hồ Chí Minh"
        }
      }
    }
  }
}
```

**Validation Rules**:
- Email phải unique (không trùng với user khác)
- Phone number phải unique (không trùng với user khác)
- Avatar phải là file hình ảnh hợp lệ
- WardId phải tồn tại trong database

**Special Features**:
- Upload avatar lên Cloudinary
- Tự động geocode địa chỉ để lấy tọa độ (lat/lng) bằng LocationIQ API
- Validate email và phone number trùng lặp

**Error Responses**:

**400 Bad Request** - Validation error:
```json
{
  "message": "Email already exists"
}
```

**400 Bad Request** - Phone number exists:
```json
{
  "message": "Phone number already exists"
}
```

**404 Not Found** - Profile not found:
```json
{
  "message": "Profile not found"
}
```

**404 Not Found** - Ward not found:
```json
{
  "message": "Ward Not Found"
}
```

**Use Cases**:
- User cập nhật thông tin cá nhân
- User thay đổi avatar
- User cập nhật địa chỉ liên hệ
- User thêm/cập nhật thông tin ngân hàng để nhận thanh toán

---

### 3. **Get Profile by ID**

**Endpoint**: `GET /api/profile/{id}`

**Mô tả**: Lấy toàn bộ thông tin profile của user theo profileId

**Parameters**:
- `id` (path) - UUID của profile

**Response Success** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phoneNumber": "0123456789",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "bankName": "Vietcombank",
  "binCode": "970436",
  "bankNumber": "1234567890",
  "accoutHolderName": "NGUYEN VAN A",
  "address": {
    "id": "addr-uuid",
    "street": "123 Đường ABC",
    "ward": {
      "id": 12345,
      "name": "Phường 1",
      "district": {
        "id": 123,
        "name": "Quận 1",
        "province": {
          "id": 1,
          "name": "Thành phố Hồ Chí Minh"
        }
      }
    }
  }
}
```

**Response Error** (400 Bad Request):
```json
{
  "message": "Profile not found"
}
```

**Use Cases**:
- Load profile khi user đăng nhập
- Hiển thị profile trong trang settings
- Lấy thông tin để điền form cập nhật

---

### 4. **Update User Preferences (Search Location)**

**Endpoint**: `POST /api/profile/{userId}/preferences`

**Mô tả**: Cập nhật địa chỉ tìm kiếm ưa thích của user. Hệ thống sẽ tự động geocode địa chỉ để lấy tọa độ, phục vụ cho việc gợi ý phòng trọ gần user.

**Parameters**:
- `userId` (path) - UUID của user

**Request Body**:
```json
{
  "searchAddress": "Quận 1, Thành phố Hồ Chí Minh"
}
```

**Response Success** (200 OK):
```json
{
  "message": "User preferences updated successfully"
}
```

**Response Error** (400 Bad Request):
```json
{
  "message": "Error updating preferences: User not found"
}
```

**Internal Processing**:
1. Lưu `searchAddress` vào database
2. Gọi LocationIQ API để geocode địa chỉ
3. Lưu `searchLatitude` và `searchLongitude` vào database
4. Nếu geocode thất bại, vẫn lưu địa chỉ nhưng tọa độ = null

**Special Features**:
- Tự động geocoding bằng LocationIQ API
- Graceful degradation khi API key invalid
- Chỉ geocode khi địa chỉ thay đổi (optimization)

**Use Cases**:
- User set địa chỉ đang ở để tìm phòng gần đó
- Hệ thống dùng tọa độ này để gợi ý phòng theo khoảng cách
- Filter phòng theo vùng địa lý

---

### 5. **Get User Preferences**

**Endpoint**: `GET /api/profile/{userId}/preferences`

**Mô tả**: Lấy địa chỉ tìm kiếm ưa thích của user

**Parameters**:
- `userId` (path) - UUID của user

**Response Success** (200 OK):
```json
{
  "searchAddress": "Quận 1, Thành phố Hồ Chí Minh"
}
```

**Response Error** (400 Bad Request):
```json
{
  "searchAddress": "Error fetching preferences: Profile not found"
}
```

**Use Cases**:
- Load search address khi user mở trang tìm kiếm
- Hiển thị địa chỉ hiện tại trong settings
- Pre-fill search form

---

### 6. **Check Bank Account**

**Endpoint**: `GET /api/profile/ishavebank/{userId}`

**Mô tả**: Kiểm tra xem user đã có thông tin ngân hàng chưa

**Parameters**:
- `userId` (path) - UUID của user

**Response Success** (200 OK):
```json
true
```

hoặc

```json
false
```

**Use Cases**:
- Kiểm tra trước khi cho phép user đăng phòng VIP (cần thanh toán)
- Kiểm tra trước khi user rút tiền
- Yêu cầu user cập nhật bank info nếu chưa có

---

### 7. **Set Email Notifications**

**Endpoint**: `PATCH /api/profile/{userId}/email-notifications`

**Mô tả**: Bật/tắt tính năng nhận thông báo qua email

**Parameters**:
- `userId` (path) - UUID của user

**Request Body**:
```json
{
  "enabled": true
}
```

**Response Success** (200 OK):
```json
{
  "message": "Email notification preference updated successfully"
}
```

**Response Error** (400 Bad Request):

Missing field:
```json
{
  "message": "Missing 'enabled' field in request body"
}
```

Update error:
```json
{
  "message": "Error updating email notification preference: Profile not found"
}
```

**Use Cases**:
- User tắt email notifications trong settings
- User bật lại notifications
- Privacy/preference management

---

### 8. **Get Email Notifications Status**

**Endpoint**: `GET /api/profile/email-notifications?userId={userId}`

**Mô tả**: Lấy trạng thái nhận email notification của user

**Query Parameters**:
- `userId` (query) - UUID của user

**Response Success** (200 OK):
```json
true
```

hoặc

```json
false
```

**Use Cases**:
- Load notification settings
- Hiển thị toggle trong UI
- Kiểm tra trước khi gửi email

---

## 🗂️ Data Models

### UserProfile Entity

```java
@Entity
public class UserProfile {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String bankName;
    private String binCode;
    private String bankNumber;
    private String accoutHolderName;
    private Address address;
    
    // Search preferences
    private String searchAddress;
    private Double searchLatitude;
    private Double searchLongitude;
    
    // Settings
    private boolean emailNotifications;
    
    // Relations
    private User user;
}
```

### Address Entity

```java
@Entity
public class Address {
    private UUID id;
    private String street;
    private Double lat;
    private Double lng;
    private Ward ward;
}
```

### Ward/District/Province

```java
@Entity
public class Ward {
    private Integer id;
    private String name;
    private District district;
}

@Entity
public class District {
    private Integer id;
    private String name;
    private Province province;
}

@Entity
public class Province {
    private Integer id;
    private String name;
}
```

---

## 🔧 Services Used

### ProfileService

**Main Features**:
1. **Profile Management**: CRUD operations for user profiles
2. **Avatar Upload**: Upload ảnh lên Cloudinary
3. **Address Geocoding**: Convert địa chỉ thành tọa độ (LocationIQ API)
4. **Distance Calculation**: Tính khoảng cách giữa user và room
5. **Location Scoring**: Tính điểm tương đồng địa chỉ
6. **Bank Account Validation**: Kiểm tra thông tin ngân hàng

**Helper Methods**:

```java
// Convert Address entity to DTO
private AddressResponseDto addressConvert(Address address)

// Remove prefix from address text
private String removePrefix(String text, String prefix)

// Calculate Haversine distance between 2 coordinates
private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)

// Calculate address similarity score (text matching)
public int calculateAddressSimilarityScore(String userSearchAddress, String roomAddressString)

// Calculate location score (combines distance + text matching)
public int calculateLocationScore(UserProfile userProfile, String roomAddressString)

// Calculate distance from user to room
public double calculateDistanceToRoom(Double userLatitude, Double userLongitude, String roomAddressString)

// Calculate real distance using Directions API
public double calculateRealDistanceToRoom(Double userLatitude, Double userLongitude, String roomAddressString)
```

### External Services

1. **CloudinaryService**: Upload và quản lý ảnh
2. **LocationIQService**: Geocoding và distance calculation
3. **MailService**: Gửi email notifications

---

## 🎯 Use Cases & Business Logic

### 1. User Profile Update Flow

```
User submits profile update
    ↓
Validate email uniqueness (nếu thay đổi)
    ↓
Validate phone uniqueness (nếu thay đổi)
    ↓
Upload avatar to Cloudinary (nếu có file mới)
    ↓
Update address ward (nếu thay đổi)
    ↓
Geocode address using LocationIQ
    ↓
Save profile to database
    ↓
Return updated profile DTO
```

### 2. Search Address Update Flow

```
User sets search address
    ↓
Save searchAddress to profile
    ↓
Check if address changed
    ↓
If changed → Geocode using LocationIQ
    ↓
Save searchLatitude & searchLongitude
    ↓
If geocoding fails → Set coordinates to null
    ↓
Return success
```

### 3. Room Recommendation Flow (Uses Profile Data)

```
Get user profile with searchLatitude/searchLongitude
    ↓
For each room in database:
    ↓
Calculate distance from user to room
    ↓
Calculate location score (0-100)
    ↓
Sort rooms by score (descending)
    ↓
Return top N rooms
```

**Location Score Algorithm**:
- Distance ≤ 1km → Score 100
- Distance ≤ 5km → Score 80
- Distance ≤ 10km → Score 60
- Distance ≤ 20km → Score 40
- Distance ≤ 50km → Score 20
- Distance > 50km → Score 10
- No coordinates → Fallback to text matching

---

## 🚨 Error Handling

### Common Errors

| Error | Status Code | Message | Cause |
|-------|-------------|---------|-------|
| Profile Not Found | 400 | "Profile not found" | Invalid profile ID |
| Email Exists | 400 | "Email already exists" | Email đã được user khác sử dụng |
| Phone Exists | 400 | "Phone number already exists" | Phone đã được user khác sử dụng |
| Ward Not Found | 404 | "Ward Not Found" | Invalid wardId |
| Upload Failed | 500 | "Failed to upload avatar: ..." | Cloudinary upload error |
| Geocoding Failed | (No error) | Coordinates set to null | LocationIQ API error |
| User Not Found | 400 | "User not found: {userId}" | Invalid userId |

### Validation Errors

Request body validation sử dụng Jakarta Validation:

```java
Set<ConstraintViolation<ProfileUpdateRequestDto>> violations = validator.validate(dto);
if (!violations.isEmpty()) {
    String errorMsg = violations.stream()
        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
        .reduce((a, b) -> a + ", " + b)
        .orElse("Validation error");
    throw new IllegalArgumentException(errorMsg);
}
```

---

## 🔐 Security Considerations

1. **Authentication Required**: Tất cả endpoints đều cần JWT token
2. **Authorization**: User chỉ có thể cập nhật profile của chính mình
3. **Validation**: Email và phone number phải unique
4. **File Upload Security**: 
   - Validate file type (only images)
   - Upload to Cloudinary (secure storage)
   - No direct file system access
5. **SQL Injection Protection**: Sử dụng JPA (parameterized queries)

---

## 📊 Performance Optimization

1. **Geocoding Optimization**: Chỉ geocode khi địa chỉ thay đổi
2. **Caching**: Có thể cache profile data (TODO: implement Redis)
3. **Lazy Loading**: Address relationships loaded on demand
4. **Graceful Degradation**: Nếu LocationIQ API fail, vẫn lưu address
5. **Distance Calculation**: 
   - Prefer Haversine (fast) over Directions API
   - Fallback to text matching nếu không có coordinates

---

## 🧪 Testing

### Manual Testing với Postman

**1. Update Profile**:
```
PATCH http://localhost:8080/api/profile/update
Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
Body:
  avatar: <file>
  profile: {
    "id": "user-uuid",
    "fullName": "Test User",
    "email": "test@example.com",
    ...
  }
```

**2. Set Search Address**:
```
POST http://localhost:8080/api/profile/{userId}/preferences
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
  {
    "searchAddress": "Quận 1, TP.HCM"
  }
```

**3. Check Bank Account**:
```
GET http://localhost:8080/api/profile/ishavebank/{userId}
Headers:
  Authorization: Bearer {token}
```

---

## 📝 Notes

### LocationIQ API Integration

- **API Key**: Lưu trong environment variable `LOCATIONIQ_API_KEY`
- **Rate Limit**: Free tier có giới hạn requests/day
- **Graceful Handling**: Nếu API fail, vẫn lưu address nhưng coordinates = null
- **Error Codes**: 401 (Invalid key), 403 (Forbidden), 404 (Not found)

### Cloudinary Integration

- **Upload Folder**: Avatar được lưu trong folder riêng
- **URL Format**: `https://res.cloudinary.com/{cloud_name}/image/upload/...`
- **Old Avatar**: Không tự động xóa (TODO: implement cleanup)

### Database Relationships

```
User (1) ←→ (1) UserProfile
UserProfile (1) ←→ (0..1) Address
Address (N) ←→ (1) Ward
Ward (N) ←→ (1) District
District (N) ←→ (1) Province
```

---

## 🔮 Future Enhancements

- [ ] Add profile picture crop/resize
- [ ] Implement profile visibility settings (public/private)
- [ ] Add social media links
- [ ] Support multiple addresses
- [ ] Implement Redis caching for profiles
- [ ] Add profile completion percentage
- [ ] Email verification workflow
- [ ] Phone verification (OTP)
- [ ] Auto-delete old avatars from Cloudinary
- [ ] Support for multiple banks
- [ ] QR code for bank account
- [ ] Profile view analytics

---

**Last Updated**: November 12, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
