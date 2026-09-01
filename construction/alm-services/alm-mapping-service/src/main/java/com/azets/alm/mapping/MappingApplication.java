package com.azets.alm.mapping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Three-strategy resolution, confidence arbitration and decision persistence (F1.3). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.mapping", "com.azets.alm.common"})
public class MappingApplication {
    public static void main(String[] args) {
        SpringApplication.run(MappingApplication.class, args);
    }
}
