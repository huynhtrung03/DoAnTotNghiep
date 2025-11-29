package com.ants.ktc.ants_ktc.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path}")
    private String firebaseConfigPath;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // Kiểm tra xem Firebase đã được khởi tạo chưa để tránh lỗi khi reload code
        if (FirebaseApp.getApps().isEmpty()) {
            // Đọc file từ resources
            // Dùng ClassPathResource để Spring tự tìm file trong classpath (src/main/resources)
            String path = firebaseConfigPath.replace("classpath:", "");
            ClassPathResource resource = new ClassPathResource(path);
            
            InputStream serviceAccount = resource.getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            return FirebaseApp.initializeApp(options);
        }
        
        return FirebaseApp.getInstance();
    }
}