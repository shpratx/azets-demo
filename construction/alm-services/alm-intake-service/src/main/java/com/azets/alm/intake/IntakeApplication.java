package com.azets.alm.intake;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Upload receipt, parsing, normalisation, validation and quality scoring (F1.1, F1.2). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.intake", "com.azets.alm.common"})
public class IntakeApplication {
    public static void main(String[] args) {
        SpringApplication.run(IntakeApplication.class, args);
    }
}
