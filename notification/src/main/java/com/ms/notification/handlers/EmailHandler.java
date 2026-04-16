package com.ms.notification.handlers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${api.base-url}")
    private String url;

    @Value("${email}")
    private String sender;
    
    public void sendEmail(String recipient, String subject, String div) {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");        

        try {
            helper.setFrom(sender);
            message.setSubject(subject);
            helper.setText(div, true);
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

    public void sendNotification(TypeNotification type, TypeChannel typeChannel, String id, Map<String, Object> content) {

        if (type == TypeNotification.SHAREFILE && typeChannel == TypeChannel.EMAIL && content.containsKey("fileName")
                && content.containsKey("fileId") && content.containsKey("recipient") && content.containsKey("message")) {
            String msg = "<html>" + content.get("message") + " <img src='"+url+"/notification/read/" + id
                    + "' width='1px' height='1px' alt=''/></p></html>";
            this.sendEmail(content.get("recipient").toString(), "Share file", msg);
            log.info("Share mail sent");
        }
        if (type == TypeNotification.ACCESSFILE && typeChannel == TypeChannel.EMAIL && content.containsKey("fileName")
                && content.containsKey("fileId") && content.containsKey("recipient") && content.containsKey("message")) {
            String msg = "<html><div>" + content.get("message") +
                    "<p><a href='"+url+"/share/access/" + content.get("fileId")
                    + "'>Click here to  <img src='"+url+"/notification/read/" + id
                    + "' width='1px' height='1px' alt=''/></a></p></div></html>";
            this.sendEmail(content.get("recipient").toString(), "Access file", msg);
            log.info("Access file email sent");
        }
        if (type == TypeNotification.JOINGROUP && typeChannel == TypeChannel.EMAIL && content.containsKey("groupName")
                && content.containsKey("groupId") && content.containsKey("recipient") && content.containsKey("message")) {
            String msg = "<html><div>" + content.get("message") +
                    "<p>To confirm that you have read the notification, click <a href='"+url+"/notification/read/"
                    + id + "'>here</a></p>";
            this.sendEmail(content.get("recipient").toString(), "Request to join group", msg);
            log.info("Join email sent");
        } 
        if (type == TypeNotification.CONFIRM_ACCOUNT && typeChannel == TypeChannel.EMAIL && content.containsKey("recipient") && content.containsKey("message")) {
            this.sendEmail(content.get("recipient").toString(), "Confirm account", content.get("message").toString());
            log.info("Confirm email sent");
        }
    }
}
