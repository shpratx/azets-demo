package com.azets.alm.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The served contract. Hand-authored specs in api-specs/ are the reviewed source of truth
 * (AP-2.1); this runtime document is generated from the code so that drift between the two
 * is visible in CI rather than discovered by a consumer.
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:alm-service}")
    private String applicationName;

    @Value("${alm.api.version:1.0.0}")
    private String apiVersion;

    @Bean
    public OpenAPI almOpenApi() {
        final String scheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("ALM " + applicationName)
                        .version(apiVersion)
                        .description("Automated Ledger Mapping Tool. Implements design/ALM_HLD.md "
                                + "and design/ALM_LLD.md. Errors follow the single envelope of LLD 9.")
                        .license(new License().name("Azets Internal")))
                .components(new Components().addSecuritySchemes(scheme,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Short-lived RS256 JWT issued by the enterprise IdP (AP-9.3).")))
                .addSecurityItem(new SecurityRequirement().addList(scheme));
    }
}
