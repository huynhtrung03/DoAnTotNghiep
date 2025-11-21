# Tài liệu chi tiết về đoạn mã `notificationContent` trong Header.tsx

## Tổng quan
Đoạn mã `notificationContent` là một component JSX trong React, được sử dụng để render giao diện danh sách thông báo (notifications) cho landlord trong ứng dụng Next.js. Nó thuộc về file `src/app/landlord/components/Header.tsx` và được hiển thị trong một Popover khi người dùng click vào icon chuông.

## Cấu trúc đoạn mã
Đoạn mã bao gồm:
- **Header của popover**: Tiêu đề "Notification" và liên kết "Mark all as read".
- **Danh sách thông báo**: Sử dụng component `List` từ Ant Design để hiển thị các thông báo với phân trang.
- **Trạng thái loading**: Hiển thị khi đang tải thêm thông báo.
- **Liên kết "Load more"**: Cho phép tải thêm thông báo nếu có nhiều hơn 5 item.

## Các APIs và thư viện sử dụng

### 1. Ant Design (antd)
- **`Typography.Title`**: Hiển thị tiêu đề với level 5.
- **`Typography.Link`**: Tạo liên kết có thể click (onClick).
- **`List`**: Component chính để render danh sách.
  - `dataSource`: Nhận mảng `displayedNotifications`.
  - `renderItem`: Hàm render từng item trong danh sách.
  - `List.Item` và `List.Item.Meta`: Cấu trúc item với title và description.

### 2. dayjs
- **`dayjs(item.createdAt.toDate()).fromNow()`**: Format thời gian tương đối (ví dụ: "2 hours ago").
- Plugin `relativeTime` được extend trong component.

### 3. Firebase Firestore (gián tiếp qua state)
- Dữ liệu đến từ collection "notifications" qua realtime listener `onSnapshot`.
- Các hàm như `markAllAsRead` và `handleNotificationClick` sử dụng `updateDoc` để cập nhật `isRead`.

### 4. React Hooks
- **`useState`**: Quản lý state như `displayedNotifications`, `isLoadingMore`.
- **`useEffect`**: Lắng nghe realtime từ Firestore.

## Nguồn dữ liệu

### Dữ liệu chính
- **Firebase Firestore**: Collection "notifications".
  - Query: `where("receiverId", "==", landlordId)` và `orderBy("createdAt", "desc")`.
  - `landlordId` lấy từ NextAuth session (`session?.user?.id`).
  - Dữ liệu được map thành mảng `notifications` với type `Notification`.

### State cục bộ
- **`notifications`**: Mảng đầy đủ thông báo từ Firestore.
- **`displayedNotifications`**: Phiên bản phân trang (mặc định 5 item đầu).
- **`isLoadingMore`**: Boolean cho trạng thái loading.
- **`notificationsPerPage`**: Hằng số 5.
- **`unreadCount`**: Số thông báo chưa đọc, tính từ `notifications.filter((n) => !n.isRead).length`.

### Các hàm xử lý
- **`markAllAsRead`**: Duyệt qua thông báo chưa đọc và gọi `updateDoc` để set `isRead: true`.
- **`handleNotificationClick`**: Cập nhật `isRead` và điều hướng dựa trên `type` (ví dụ: `/landlord/rentals` cho "booking_success").
- **`loadMoreNotifications`**: Phân trang client-side, slice mảng `notifications`.
- **`handleNotificationScroll`**: Tự động load more khi scroll gần cuối.

## Cách hoạt động

### Luồng dữ liệu
1. **Khởi tạo**: `useEffect` lắng nghe Firestore → Populate `notifications` → Slice thành `displayedNotifications`.
2. **Realtime update**: Khi Firestore thay đổi, state được refresh và hiển thị popup nếu là notification mới.
3. **Tương tác**: Click item → Cập nhật `isRead` và navigate. Click "Mark all as read" → Cập nhật tất cả.
4. **Pagination**: Load more là client-side, không gọi API thêm.

### Các loại notification
- `"booking_success"`: Rental Booking
- `"request_success"`: Rental Request
- `"resident_success"`: Rental resident
- `"payment_success"`: Bill Payment

### Tạo notification
Thông báo được tạo từ `NotificationService.ts` qua các hàm như `createBookingNotification`, `createRequestNotification`, v.v., sử dụng `addDoc` để thêm vào Firestore.

## Lưu ý kỹ thuật
- **Realtime**: Sử dụng `onSnapshot` để cập nhật tức thời.
- **Pagination**: Client-side với `slice`, không tối ưu cho dữ liệu lớn.
- **Error handling**: Có try-catch trong các hàm async.
- **Theme**: Hỗ trợ dark mode qua Tailwind CSS classes.
- **Accessibility**: Sử dụng `key` cho List.Item và event handlers.

## Ví dụ code snippet
```tsx
const notificationContent = (
  <div className="w-80">
    <div className="flex justify-between items-center p-3 border-b">
      <Typography.Title level={5} className="!m-0">
        Notification
      </Typography.Title>
      <Typography.Link onClick={markAllAsRead}>
        Mark all as read
      </Typography.Link>
    </div>
    <div className="max-h-80 overflow-y-auto" onScroll={handleNotificationScroll}>
      <List
        dataSource={displayedNotifications}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              !item.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
            onClick={() => handleNotificationClick(item.id, item.type, item.contractId)}
          >
            <List.Item.Meta
              title={
                <div className="flex justify-between items-start">
                  <span className={`${!item.isRead ? "font-semibold" : ""}`}>
                    {item.type === "booking_success" && "Rental Booking"}
                    {item.type === "request_success" && "Rental Request"}
                    {item.type === "resident_success" && "Rental resident"}
                    {item.type === "payment_success" && "Bill Payment"}
                  </span>
                  {!item.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                  )}
                </div>
              }
              description={
                <div>
                  <div className="text-gray-600 dark:text-gray-300 mb-1">
                    {item.message}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.createdAt?.toDate ? dayjs(item.createdAt.toDate()).fromNow() : ""}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      {isLoadingMore && (
        <div className="text-center p-3">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500">Loading more...</span>
        </div>
      )}
    </div>
    {displayedNotifications.length < notifications.length && !isLoadingMore && (
      <div className="text-center p-3 border-t">
        <Typography.Link onClick={loadMoreNotifications}>
          Load more notifications ({notifications.length - displayedNotifications.length} remaining)
        </Typography.Link>
      </div>
    )}
    {displayedNotifications.length >= notifications.length && notifications.length > notificationsPerPage && (
      <div className="text-center p-3 border-t">
        <span className="text-sm text-gray-500">All notifications loaded</span>
      </div>
    )}
  </div>
);
```

## Kết luận
Đoạn mã này là phần UI quan trọng cho hệ thống thông báo realtime, kết hợp Ant Design, Firebase, và React hooks. Nếu cần chỉnh sửa hoặc mở rộng (ví dụ: thêm filter, search), hãy tham khảo tài liệu Ant Design và Firebase.