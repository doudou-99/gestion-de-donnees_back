package com.ms.notification.listeners;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ms.notification.dto.CreateNotificationRequest;
import com.ms.notification.dto.NotificationDto;
import com.ms.notification.service.NotificationService;

import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import io.nats.client.Message;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationsListener {

    @Autowired
    Connection natsConnection;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    NotificationService notificationService;

    @PostConstruct
    public void setupListeners() {
        Dispatcher dispatcher = natsConnection.createDispatcher();
        
        dispatcher.subscribe("notification.create", msg -> {
            this.handleCreateNotification(msg);
        });
        dispatcher.subscribe("notification.getById", msg -> {
            this.handleGetNotification(msg);
        });
        dispatcher.subscribe("notification.getAll", msg -> {
            this.handleGetAllNotifications(msg);
        });
        dispatcher.subscribe("notification.getAllByUser", msg -> {
            this.handleGetAllNotificationsUser(msg);
        });
        dispatcher.subscribe("notification.getAllRead", msg -> {
            this.handleGetAllNotificationsRead(msg);
        });
        dispatcher.subscribe("notification.getAllNotRead", msg -> {
            this.handleGetAllNotificationsNotRead(msg);
        });
        dispatcher.subscribe("notification.read", msg -> {
            this.handleIsReadNotification(msg);
        });
        dispatcher.subscribe("notification.delete", msg -> {
            this.handleDeleteNotification(msg);
        });
        dispatcher.subscribe("notification.expiredNotifications", msg -> {
            this.handleDeleteExpiredNotifications(msg);
        });
        
        log.info("NATS listeners initialized for notification service");
    }

    private void handleCreateNotification(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        log.info(payload);
        log.info(msg.toString());
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                CreateNotificationRequest request = objectMapper.treeToValue(dataNode, CreateNotificationRequest.class);
                log.info(request.toString());
                NotificationDto notificationDto = notificationService.createNotification(request);
                String responseJson = objectMapper.writeValueAsString(notificationDto);
                log.info("Sending response for 'notification.create': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.create': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleGetNotification(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                Map<String, Object> idMap = objectMapper.convertValue(dataNode, new TypeReference<Map<String, Object>>() {});
                String id = idMap.get("id").toString();
                log.info(id);
                NotificationDto notificationDto = notificationService.getNotification(id);
                String responseJson = objectMapper.writeValueAsString(notificationDto);
                log.info("Sending response for 'notification.getById': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.getById': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleGetAllNotifications(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        log.info("Received NATS message on subject 'notifications.getAll': {}", payload);
        try {
            List<NotificationDto> notificationDto = notificationService.getNotifications();
            String responseJson = objectMapper.writeValueAsString(notificationDto);
            log.info("Sending response for 'notification.getAll': success");
            if (msg.getReplyTo() != null) {
                natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.getAll': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleGetAllNotificationsUser(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        log.info("Received NATS message on subject 'notifications.getAllByUser': {}", payload);
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                Map<String, Object> idMap = objectMapper.convertValue(dataNode, new TypeReference<Map<String, Object>>() {});
                int id = Integer.parseInt(idMap.get("id").toString());
                List<NotificationDto> notificationDto = notificationService.getNotificationsUser(id);
                String responseJson = objectMapper.writeValueAsString(notificationDto);
                log.info("Sending response for 'notification.getAllByUser': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.getAllByUser': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleGetAllNotificationsRead(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        log.info("Received NATS message on subject 'notifications.getAllRead': {}", payload);
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                Map<String, Object> idMap = objectMapper.convertValue(dataNode, new TypeReference<Map<String, Object>>() {});
                int id = Integer.parseInt(idMap.get("id").toString());
                List<NotificationDto> notificationDto = notificationService.getNotificationsRead(id);
                String responseJson = objectMapper.writeValueAsString(notificationDto);
                log.info("Sending response for 'notification.getAllRead': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.getAllRead': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleGetAllNotificationsNotRead(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        log.info("Received NATS message on subject 'notifications.getAllNotRead': {}", payload);
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                Map<String, Object> idMap = objectMapper.convertValue(dataNode, new TypeReference<Map<String, Object>>() {});
                int id = Integer.parseInt(idMap.get("id").toString());
                List<NotificationDto> notificationDto = notificationService.getNotificationsNotRead(id);
                String responseJson = objectMapper.writeValueAsString(notificationDto);
                log.info("Sending response for 'notification.getAllNotRead': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.getAllNotRead': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleIsReadNotification(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                Map<String, Object> idMap = objectMapper.convertValue(dataNode, new TypeReference<Map<String, Object>>() {});
                String id = idMap.get("id").toString();             
                NotificationDto notificationDto = notificationService.isReadNotification(id);
                String responseJson = objectMapper.writeValueAsString(notificationDto);
                log.info("Sending response for 'notification.read': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.read': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleDeleteNotification(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        try {
            JsonNode messageEnvelope = objectMapper.readTree(payload);
            if (messageEnvelope.has("data")) {
                JsonNode dataNode = messageEnvelope.get("data");
                log.info("Extracted data: {}", dataNode.toString());
                Map<String, Object> idMap = objectMapper.convertValue(dataNode, new TypeReference<Map<String, Object>>() {});
                String id = idMap.get("id").toString();       
                notificationService.deleteNotification(id);
                String responseJson = objectMapper.writeValueAsString(null);
                log.info("Sending response for 'notification.delete': success");
                if (msg.getReplyTo() != null) {
                    natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.delete': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }

    private void handleDeleteExpiredNotifications(Message msg) {
        String payload = new String(msg.getData(), StandardCharsets.UTF_8);
        log.info("Received NATS message on subject 'notifications.expiredNotifications': {}", payload);
        try {
            notificationService.deleteAllExpiredNotif();
            String responseJson = objectMapper.writeValueAsString(null);
            log.info("Sending response for 'notification.expiredNotifications': success");
            if (msg.getReplyTo() != null) {
                natsConnection.publish(msg.getReplyTo(), responseJson.getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            log.error("Error processing 'notification.expiredNotifications': ", e);
            if (msg.getReplyTo() != null) {
                try {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", e.getMessage());
                    errorResponse.put("status", "error");
                    String errorJson = objectMapper.writeValueAsString(errorResponse);
                    natsConnection.publish(msg.getReplyTo(), errorJson.getBytes(StandardCharsets.UTF_8));
                } catch (Exception ex) {
                    log.error("Error sending error response", ex);
                }
            }
        }
    }
}
