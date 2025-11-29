package com.ants.ktc.ants_ktc.services;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FCMService {

    public String sendNotification(String token, String title, String body, Map<String, String> data) {
        try {
            // Tạo thông báo hiển thị (Title/Body)
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            // Tạo message chuẩn FCM
            Message.Builder messageBuilder = Message.builder()
                    .setToken(token)
                    .setNotification(notification);

            // Nếu có dữ liệu kèm theo (ví dụ: chuyển trang khi bấm vào)
            if (data != null) {
                messageBuilder.putAllData(data);
            }

            // Gửi đi
            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            System.out.println("Sent message successfully: " + response);
            return response;

        } catch (Exception e) {
            System.err.println("Error sending FCM message: " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
