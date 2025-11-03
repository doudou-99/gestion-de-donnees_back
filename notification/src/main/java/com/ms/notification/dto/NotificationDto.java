package com.ms.notification.dto;

import java.io.Serializable;
import java.util.Map;

import com.ms.notification.entity.enums.TypeChannel;
import com.ms.notification.entity.enums.TypeNotification;
import com.ms.notification.entity.enums.TypeRecipient;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto implements Serializable{
    private int recipientId;
    private TypeRecipient recipientType;
    private TypeNotification type;
    private TypeChannel typeChannel;
    private String templateId;
    private boolean read;
    private Map<String, Object> metadata;
}
