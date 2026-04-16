package com.ms.notification.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest implements Serializable{
    @NotNull(message = "The recipient's id is mandatory")
    private int recipientId;

    @NotBlank(message = "The recipient's type is mandatory")
    private String recipientType;

    @NotBlank(message = "The type is mandatory")
    private String type;

    @NotBlank(message = "The message is mandatory")
    private String message;

    @NotBlank(message = "The channel's type is mandatory")
    private String typeChannel;

    @NotEmpty(message = "The metadata is mandatory")
    private Map<String, Object> metadata;

    @Override
    public String toString() {
        return "CreateNotificationRequest [recipientId=" + recipientId + ", recipientType=" + recipientType + ", type="
                + type + ", message=" + message + ", typeChannel=" + typeChannel + ", metadata=" + metadata + "]";
    }
}
