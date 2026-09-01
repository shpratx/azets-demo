package com.azets.alm.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Semantic suggestion, similarity scoring and explanation generation (F0.5). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.ai", "com.azets.alm.common"})
public class AiApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiApplication.class, args);
    }
}
