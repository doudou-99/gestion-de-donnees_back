package com.ms.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
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

    @CachePut(value = "notificationsCache", key = "#request")
    public NotificationDto createNotification(CreateNotificationRequest request) {
        TypeNotification type = TypeNotification.valueOf(request.getType());

        Notification notification = new Notification(request.getRecipientId(),
                TypeRecipient.valueOf(request.getRecipientType()), type, TypeChannel.valueOf(request.getTypeChannel()),
                request.getMetadata());
        Template template = this.templateService.getTemplateByType(type);
        log.info(template.toString());
        notification.setTemplateId(template.getId());
        Notification notif = this.repository.save(notification);
        sendNotification(notification.getType(), notif.getTypeChannel(), notif.getId(), request.getMetadata(),
                request.getMessage());
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

    public void sendNotification(TypeNotification type, TypeChannel typeChannel, String id, Map<String, Object> content,
            String message) {

        if (type == TypeNotification.SHAREFILE && typeChannel == TypeChannel.EMAIL && content.containsKey("fileName")
                && content.containsKey("fileId") && content.containsKey("recipient")
                && content.containsKey("sender")) {
            String msg = "<html><body>" + message + " of file " + content.get("fileName").toString() + " from user "
                    + content.get("recipient").toString() +
                    "<p><a href='http://localhost:3000/api/v1/share/" + content.get("fileId")
                    + "'>Click here to share <img src='http://localhost:3000/api/v1/notification/read/" + id
                    + "' width='1px' height='1px' alt=''/></a></p></body></html>";
            handler.sendEmail(content.get("recipient").toString(), "Share file", msg);
        }
        if (type == TypeNotification.EXPIRED_TOKEN && typeChannel == TypeChannel.EMAIL
                && content.containsKey("recipient")) {
            String msg = "<html><body>" + message
                    + " of user "+ content.get("recipient").toString() + "<p>To confirm that you have read the notification, click <a href='http://localhost:3000/api/v1/notification/read/"
                    + id + "'>here</a></p>"
                    + "</body></html>";
            handler.sendEmail(content.get("recipient").toString(), "Expired token", msg);
        }
        if (type == TypeNotification.ACCESSFILE && typeChannel == TypeChannel.EMAIL && content.containsKey("fileName")
                && content.containsKey("fileId") && content.containsKey("recipient")) {
            String msg = "<html><body>" + message + " of file " + content.get("fileName").toString() + " from user "
                    + content.get("recipient").toString() +
                    "<p><a href='http://localhost:3000/api/v1/share/access/" + content.get("fileId")
                    + "'>Click here to  <img src='http://localhost:3000/api/v1/notification/read/" + id
                    + "' width='1px' height='1px' alt=''/></a></p></body></html>";
            handler.sendEmail(content.get("recipient").toString(), "Access file", msg);
        }
        if (type == TypeNotification.JOINGROUP && typeChannel == TypeChannel.EMAIL && content.containsKey("groupName")
                && content.containsKey("groupId") && content.containsKey("recipient")) {
            String msg = "<html><body>" + message + " of  group " + content.get("groupName").toString() + " by user "
                    + content.get("recipient").toString() +
                    "<p>To confirm that you have read the notification, click <a href='http://localhost:3000/api/v1/notification/read/"
                    + id + "'>here</a></p>";
            handler.sendEmail(content.get("recipient").toString(), "Request to join group", msg);
        }
    }

    public NotificationDto mapToDTO(Notification notification) {
        NotificationDto notificationDto = new NotificationDto(notification.getRecipientId(),
                notification.getRecipientType(),
                notification.getType(), notification.getTypeChannel(), notification.getTemplateId(),
                notification.isRead(), notification.getMetadata());
        return notificationDto;
    }
}