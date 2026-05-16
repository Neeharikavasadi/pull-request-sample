package com.example.RetailOrderingWebsite.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${spring.mail.username:}") String fromEmail) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.fromEmail = fromEmail;
    }

    public void sendOrderConfirmation(String userEmail, Long orderId, String details) {
        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            System.out.println("\n=================================================");
            System.out.println("📧 SIMULATED EMAIL CONFIRMATION");
            System.out.println("To: " + userEmail);
            System.out.println("Subject: Order Confirmation #" + orderId);
            System.out.println("-------------------------------------------------");
            System.out.println(details);
            System.out.println("=================================================\n");
            return;
        }

        if (userEmail == null || !userEmail.contains("@")) {
            logger.warn("Skipping email for order {} because user email is invalid: {}", orderId, userEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(userEmail);
            message.setSubject("Order Confirmation #" + orderId);
            message.setText(details);
            mailSender.send(message);
        } catch (Exception ex) {
            logger.error("Failed to send order confirmation for order {}", orderId, ex);
        }
    }
}
