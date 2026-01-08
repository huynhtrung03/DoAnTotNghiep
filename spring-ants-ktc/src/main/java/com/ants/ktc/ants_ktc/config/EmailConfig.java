package com.ants.ktc.ants_ktc.config;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@Configuration
public class EmailConfig {
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");

        // --- Sử dụng Port 465 (SSL) để tránh bị chặn 587 ---
        mailSender.setPort(465);
        mailSender.setUsername(EnvLoader.get("MAIL_USERNAME"));
        mailSender.setPassword(EnvLoader.get("MAIL_PASSWORD"));

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtps"); // Sử dụng smtps cho SSL
        props.put("mail.smtps.auth", "true");
        props.put("mail.smtps.starttls.enable", "true");
        props.put("mail.smtps.timeout", "5000"); // Timeout 5s

        // Config quan trọng cho Port 465
        props.put("mail.smtps.ssl.enable", "true");
        props.put("mail.smtps.ssl.trust", "smtp.gmail.com");

        props.put("mail.debug", "true");

        return mailSender;
    }
}