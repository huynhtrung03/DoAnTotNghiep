package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "device_tokens")
@Getter
@Setter
@ToString(exclude = "user")
@EqualsAndHashCode(callSuper = true)
public class DeviceToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "device_type")
    private String deviceType; // ANDROID, IOS

    @Column(name = "is_active")
    private boolean isActive = true;

}
