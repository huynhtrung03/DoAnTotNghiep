package com.ants.ktc.ants_ktc.dtos.notification;

import lombok.Data;

import java.util.UUID;

@Data
public class RegisterTokenRequest {
    private UUID userId;
    private String token;
    private String deviceType; // ANDROID, IOS
}
