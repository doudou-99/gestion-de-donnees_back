package com.ms.notification.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.Scheduled;

import com.ms.notification.service.NotificationService;

@EnableAsync
@Configuration
public class ScheduleExpiredNotifications {
    @Autowired
    private NotificationService notificationService;

    @Async
    @Scheduled(cron = "* */15 * * * *", zone = "Europe/Paris")
    public void expiredNotifications() throws InterruptedException {
        notificationService.deleteAllExpiredNotif();
    }
}
