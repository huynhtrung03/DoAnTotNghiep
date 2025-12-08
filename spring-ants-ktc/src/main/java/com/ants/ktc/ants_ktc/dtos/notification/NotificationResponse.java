package com.ants.ktc.ants_ktc.dtos.notification;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO cho response của notification API
 */
@Data
@AllArgsConstructor
public class NotificationResponse {
    private boolean success;
    private String message;
}
