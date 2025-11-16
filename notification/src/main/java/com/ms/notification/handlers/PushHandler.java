package com.ms.notification.handlers;

import org.springframework.stereotype.Component;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;

@Component
public class PushHandler {
    private FirebaseMessaging messaging;

    public void send(String deviceToken, String title, String message) {
        try {
            Message msg = Message.builder()
                .setToken(deviceToken)
                .putData("title", title)
                .putData("message", message)
                .build();
            messaging.send(msg);

        } catch (Exception e) {
            throw new RuntimeException(); 
        }    
    }

}
