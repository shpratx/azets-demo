package com.azets.alm.ai.api;

import com.azets.alm.ai.api.dto.AiDtos.AiSuggestionSet;
import com.azets.alm.ai.api.dto.AiDtos.Candidate;
import com.azets.alm.ai.api.dto.AiDtos.ModelDescriptor;
import com.azets.alm.ai.api.dto.AiDtos.SuggestRequest;
import com.azets.alm.ai.api.dto.AiDtos.SuggestResponse;
import com.azets.alm.ai.service.ModelRegistry;
import com.azets.alm.ai.service.SemanticScorer;
import com.azets.alm.common.security.Rbac;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Implements api-specs/ai-service.yaml. */
@RestController
@RequestMapping("/ai/v1")
@Tag(name = "Inference")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    private final SemanticScorer scorer;
    private final ModelRegistry registry;

    public AiController(SemanticScorer scorer, ModelRegistry registry) {
        this.scorer = scorer;
        this.registry = registry;
    }

    @PostMapping("/suggest:batch")
    @PreAuthorize(Rbac.CAN_READ)
    @Operation(summary = "Generate semantic suggestions for a batch",
            description = "Batched by design. Callers must treat failure here as non-fatal - mapping "
                    + "degrades to rules plus similarity rather than failing (AP-6.5).")
    public SuggestResponse suggestBatch(@Valid @RequestBody SuggestRequest request) {
        int topK = request.topK() == null ? 3 : request.topK();

        List<AiSuggestionSet> results = request.accounts().stream()
                .map(account -> {
                    List<Candidate> candidates =
                            scorer.score(account, request.masterCandidates(), topK);
                    return new AiSuggestionSet(account.id(), candidates);
                })
                .toList();

        // LLD 11: log counts and ids only - never legacy account names, which are Confidential.
        log.info("ai_batch_scored accounts={} masters={} ledgerVersion={} model={}",
                request.accounts().size(), request.masterCandidates().size(),
                request.ledgerVersion(), registry.activeVersion());

        return new SuggestResponse(registry.activeVersion(), results);
    }

    @GetMapping("/models")
    @PreAuthorize(Rbac.CAN_READ)
    public List<ModelDescriptor> models() {
        return registry.all();
    }

    @GetMapping("/models/active")
    @PreAuthorize(Rbac.CAN_READ)
    public ModelDescriptor activeModel() {
        return registry.active();
    }
}
