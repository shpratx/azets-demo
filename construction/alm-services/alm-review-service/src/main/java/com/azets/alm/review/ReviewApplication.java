package com.azets.alm.review;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Exception queue, override workflow and segregation-of-duties approval (F1.4, F1.5). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.review", "com.azets.alm.common"})
public class ReviewApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReviewApplication.class, args);
    }
}
