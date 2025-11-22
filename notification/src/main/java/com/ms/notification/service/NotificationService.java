package com.ms.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.ms.notification.dto.CreateNotificationRequest;
import com.ms.notification.dto.NotificationDto;
import com.ms.notification.entity.Notification;
import com.ms.notification.entity.Template;
import com.ms.notification.entity.enums.TypeChannel;
import com.ms.notification.entity.enums.TypeNotification;
import com.ms.notification.entity.enums.TypeRecipient;
import com.ms.notification.exceptions.NotificationNotFoundException;
import com.ms.notification.handlers.EmailHandler;
import com.ms.notification.handlers.PushHandler;
import com.ms.notification.handlers.WebhookHandler;
import com.ms.notification.repositories.NotificationRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    @Autowired
    private TemplateService templateService;

    @Autowired
    EmailHandler handler;

    @Autowired
    PushHandler pushHandler;

    @Autowired
    WebhookHandler webhookHandler;

    @Autowired
    SimpMessagingTemplate messagingTemplate;

    @CachePut(value = "notificationsCache", key = "#request")
    public NotificationDto createNotification(CreateNotificationRequest request) {
        TypeNotification type = TypeNotification.valueOf(request.getType());
        TypeChannel channel = TypeChannel.valueOf(request.getTypeChannel());

        Notification notification = new Notification(request.getRecipientId(),
                TypeRecipient.valueOf(request.getRecipientType()), type, channel,
                request.getMetadata());
        Template template = this.templateService.getTemplateByType(type);
        log.info(template.toString());
        notification.setTemplateId(template.getId());
        Notification notif = this.repository.save(notification);
        if (channel == TypeChannel.EMAIL) {
            handler.sendNotification(notification.getType(), notif.getTypeChannel(), notif.getId(), request.getMetadata(),
            request.getMessage());
        }
        if (channel == TypeChannel.PUSH) {
            String token = (String) request.getMetadata().get("device-token");
            String title = (String) notif.getMetadata().get("title");
            pushHandler.send(token, title, request.getMessage());
        }
        if (channel == TypeChannel.WEBHOOK) {
            webhookHandler.send(notif);
        }
        messagingTemplate.convertAndSend("/topic/" + notif.getRecipientId(), notif);
        log.debug("Notification created successfully");
        return mapToDTO(notification);
    }

    @Cacheable(value = "notificationsCache", key = "#id")
    public NotificationDto getNotification(String id) {
        Optional<Notification> optional = repository.findById(id);
        if (!optional.isPresent()) {
            log.error("Notification not found");
            throw new NotificationNotFoundException();
        } else {
            log.debug("Display of notification: {}", optional.get());
            return mapToDTO(optional.get());
        }
    }

    @CachePut(value = "notificationsCache", key = "#id")
    public NotificationDto isReadNotification(String id) {
        Optional<Notification> optional = repository.findById(id);
        if (!optional.isPresent()) {
            log.error("Notification not found");
            throw new NotificationNotFoundException();
        } else {
            log.debug("Update of notification: {}", optional.get());
            optional.get().setRead(true);
            repository.save(optional.get());
            log.debug("Update of notification: {}", optional.get());
            return mapToDTO(optional.get());
        }
    }

    @Cacheable(value = "notificationsCache", unless = "#result == null || #result.isEmpty()")
    public List<NotificationDto> getNotifications() {
        List<Notification> notifications = this.repository.findAll();
        log.debug("Notifications: {}", notifications);
        return notifications.stream().map(notification -> this.mapToDTO(notification)).collect(Collectors.toList());
    }

    @Cacheable(value = "notificationsUserCache", unless = "#result == null || #result.isEmpty()")
    public List<NotificationDto> getNotificationsUser(int idUser) {
        List<Notification> notifications = this.repository.findAllByRecipientId(idUser);
        log.debug("Notifications: {}", notifications);
        return notifications.stream().map(notification -> this.mapToDTO(notification)).collect(Collectors.toList());
    }

    @Cacheable(value = "notificationsReadCache", unless = "#result == null || #result.isEmpty()")
    public List<NotificationDto> getNotificationsRead(int idUser) {
        List<Notification> notifications = this.repository.findAllByReadAndRecipientId(true, idUser);
        log.debug("Notifications read: {}", notifications);
        return notifications.stream().map(notification -> this.mapToDTO(notification)).collect(Collectors.toList());
    }

    @Cacheable(value = "notificationsNotReadCache", unless = "#result == null || #result.isEmpty()")
    public List<NotificationDto> getNotificationsNotRead(int idUser) {
        List<Notification> notifications = this.repository.findAllByReadAndRecipientId(false, idUser);
        log.debug("Notifications not read: {}", notifications);
        return notifications.stream().map(notification -> this.mapToDTO(notification)).collect(Collectors.toList());
    }

    @CacheEvict(value = "notificationsCache", key = "#id")
    public void deleteNotification(String id) {
        Optional<Notification> optional = repository.findById(id);
        if (!optional.isPresent()) {
            log.error("Notification not found");
            throw new NotificationNotFoundException();
        } else {
            log.debug("Notification deleted");
            this.repository.deleteById(id);
        }
    }
    
    public void deleteAllExpiredNotif() {
        this.repository.deleteAllByExpiresAtGreaterThanEqual(LocalDateTime.now());
    }

    public NotificationDto mapToDTO(Notification notification) {
        NotificationDto notificationDto = new NotificationDto(notification.getRecipientId(),
                notification.getRecipientType(),
                notification.getType(), notification.getTypeChannel(), notification.getTemplateId(),
                notification.isRead(), notification.getMetadata());
        return notificationDto;
    }
}