package com.azets.alm.ai.service;

import com.azets.alm.ai.api.dto.AiDtos.ModelDescriptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * F0.5.4. The registry exists so that every persisted AI suggestion can record the modelVersion
 * that produced it (LLD 1.4) - without that, an audit cannot answer "what would this have
 * suggested at the time", and a model regression is undetectable after the fact.
 */
@Component
public class ModelRegistry {

    @Value("${alm.ai.model-version:lexical-v1.0.0}")
    private String activeVersion;

    @Value("${alm.ai.model-strategy:lexical-composite}")
    private String strategy;

    public String activeVersion() {
        return activeVersion;
    }

    public ModelDescriptor active() {
        return new ModelDescriptor(activeVersion, null, true, strategy,
                Map.of("confidenceCeiling", 92.0));
    }

    public List<ModelDescriptor> all() {
        return List.of(active());
    }

    public Instant trainedAt() {
        return null;
    }
}
