package com.ms.notification.handlers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.ms.notification.entity.Notification;


@Component
public class WebhookHandler {

    @Value("${api.base-url}")
    private String url;
    private RestTemplate restTemplate;

    public void send(Notification notification) {
        restTemplate.postForEntity(url+"/api/v1/notification", notification, Notification.class);
    }

}
