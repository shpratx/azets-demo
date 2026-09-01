package com.azets.alm.common.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Imported by each service so the shared cross-cutting beans - correlation filter, error
 * handler, security posture, OpenAPI document, event publisher - are present without every
 * service repeating the component scan.
 */
@Configuration
@ComponentScan(basePackages = {
        "com.azets.alm.common.web",
        "com.azets.alm.common.error",
        "com.azets.alm.common.security",
        "com.azets.alm.common.event",
        "com.azets.alm.common.config"
})
public class AlmCommonAutoConfiguration {
}
