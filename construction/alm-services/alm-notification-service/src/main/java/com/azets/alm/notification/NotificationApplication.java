package com.azets.alm.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Bus-driven in-app and email fan-out (F1.8). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.notification", "com.azets.alm.common"})
public class NotificationApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationApplication.class, args);
    }
}
