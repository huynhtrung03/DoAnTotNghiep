package com.ants.ktc.ants_ktc.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.UserViewRoom;

@Repository
public interface UserViewRoomRepository extends JpaRepository<UserViewRoom, UUID> {
    boolean existsByUserIdAndRoomId(UUID userId, UUID roomId);

    java.util.Optional<UserViewRoom> findByUserIdAndRoomId(UUID userId, UUID roomId);

    Page<UserViewRoom> findByUserIdOrderByCreatedDateDesc(UUID userId, Pageable pageable);
    // lấy thông tin lượt xem của user theo ngày

    Page<UserViewRoom> findByUserIdAndViewCountGreaterThanEqualOrderByCreatedDateDesc(UUID userId, int minViewCount,
            Pageable pageable);
}
