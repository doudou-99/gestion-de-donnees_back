package com.ms.notification.dto;

import com.ms.notification.entity.enums.TypeNotification;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTemplateDto {
    @NotBlank(message = "The type is mandatory")
    private TypeNotification type;

    @NotBlank(message = "The message is mandatory")
    private String message;

    
}
