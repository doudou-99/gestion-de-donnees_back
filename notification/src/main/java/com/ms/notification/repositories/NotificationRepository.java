package com.ms.notification.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ms.notification.entity.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String>{
    List<Notification> findAllByRecipientId(int recipientId);
    List<Notification> findAllByReadAndRecipientId(boolean read, int recipientId);
    void deleteAllByExpiresAtGreaterThanEqual(LocalDateTime dateTime);
}
