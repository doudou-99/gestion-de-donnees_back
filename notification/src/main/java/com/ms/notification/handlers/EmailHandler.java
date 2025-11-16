package com.ms.notification.handlers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.ms.notification.entity.enums.TypeChannel;
import com.ms.notification.entity.enums.TypeNotification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class EmailHandler {

    @Autowired
    private JavaMailSender mailSender;

    
    public void sendEmail(String recipient, String subject, String body) {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");        

        try {
            message.setSubject(subject);
            helper.setText(body, true);
            helper.setTo(recipient);
            log.info("msg:"+message);
            mailSender.send(message);
            log.info("Email sent successfully");
        }
        catch (MailException ex) {
            log.error(ex.getMessage());
        } catch (MessagingException e) {
            log.error(e.getMessage());
        }
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
            this.sendEmail(content.get("recipient").toString(), "Share file", msg);
        }
        if (type == TypeNotification.EXPIRED_TOKEN && typeChannel == TypeChannel.EMAIL
                && content.containsKey("recipient")) {
            String msg = "<html><body>" + message
                    + " of user "+ content.get("recipient").toString() + "<p>To confirm that you have read the notification, click <a href='http://localhost:3000/api/v1/notification/read/"
                    + id + "'>here</a></p>"
                    + "</body></html>";
            this.sendEmail(content.get("recipient").toString(), "Expired token", msg);
        }
        if (type == TypeNotification.ACCESSFILE && typeChannel == TypeChannel.EMAIL && content.containsKey("fileName")
                && content.containsKey("fileId") && content.containsKey("recipient")) {
            String msg = "<html><body>" + message + " of file " + content.get("fileName").toString() + " from user "
                    + content.get("recipient").toString() +
                    "<p><a href='http://localhost:3000/api/v1/share/access/" + content.get("fileId")
                    + "'>Click here to  <img src='http://localhost:3000/api/v1/notification/read/" + id
                    + "' width='1px' height='1px' alt=''/></a></p></body></html>";
            this.sendEmail(content.get("recipient").toString(), "Access file", msg);
        }
        if (type == TypeNotification.JOINGROUP && typeChannel == TypeChannel.EMAIL && content.containsKey("groupName")
                && content.containsKey("groupId") && content.containsKey("recipient")) {
            String msg = "<html><body>" + message + " of  group " + content.get("groupName").toString() + " by user "
                    + content.get("recipient").toString() +
                    "<p>To confirm that you have read the notification, click <a href='http://localhost:3000/api/v1/notification/read/"
                    + id + "'>here</a></p>";
            this.sendEmail(content.get("recipient").toString(), "Request to join group", msg);
        }
    }
}
