package com.ms.notification.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ms.notification.entity.enums.TypeChannel;
import com.ms.notification.entity.enums.TypeNotification;
import com.ms.notification.entity.enums.TypeRecipient;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification implements Serializable{
    @MongoId
    private String id;
    private int recipientId;
    private TypeRecipient recipientType;
    private TypeNotification type;
    private TypeChannel typeChannel;
    private String templateId;
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    @Indexed
    private boolean read = false;
    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();
    @LastModifiedDate
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime expiresAt;

    public Notification(int recipientId, TypeRecipient recipientType, TypeNotification type, TypeChannel typeChannel, Map<String, Object> metadata) {
        this.recipientId = recipientId;
        this.recipientType = recipientType;
        this.type = type;
        this.typeChannel = typeChannel;
        this.metadata = metadata;
        this.expiresAt = LocalDateTime.now().plusMonths(1);
    }

    
}
