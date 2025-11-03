package com.ms.notification.handlers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

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
}
