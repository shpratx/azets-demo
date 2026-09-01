# Architectural Principles — Merchant Payments & Settlement Platform (MPSP)
**Document 5 of the BOM artifact set · Cross-cutting constraint layer (feeds Beat-1 constraints & Phase-2B Foundation Architecture)**
Owner: Architecture (with Product + Risk/Compliance) · Status: Draft v1.0 · Date: 31 Aug 2026

> **Why this document exists.** These principles are stated up front so that later design decisions can be *checked against them*, rather than principles being implied retroactively by whatever got built. If a design choice later in the programme conflicts with one of these, that is worth raising: either the principle needs an explicit, recorded exception (via ADR), or the design needs to change. This mirrors our house architecture-principles practice. <cite>turn8search190</cite>
>
> **Where it sits in the BOM.** Architecture is not one artifact at one moment — it is three layers produced at three points (Addendum E). This document expresses **Layer-1-derived, initiative-level principles** that constrain decomposition (Beat 1) and are instantiated by the Phase-2B Foundation/Solution Architecture (Beat 2, DA0/DA1). No Work Unit is emitted before the architecture it aligns to exists. <cite>turn8search191</cite><cite>turn8search193</cite>

---

## 1. How to use these principles
- Each principle has an **ID**, a **statement**, **what it means for MPSP**, and a **rationale**.
- Principles are **normative** ("must"/"should"). Deviations require an **approved ADR exception**, consistent with our enterprise rule that physical designs must conform to — never silently redefine — the logical architecture. <cite>turn8search198</cite>
- They are grouped into ten aspects: **Domain & Structure, API & Integration, Data & Ledger, Financial Integrity, Security & Compliance, Authentication & Authorisation, Infrastructure & Platform, Resilience & Availability, Observability & Operations, Delivery & Change**.

---

## 2. Foundational (meta) principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-00** | **Principles-first, checkable** | Every significant design decision is validated against this document; conflicts are raised, not absorbed | Prevents retroactive, accidental architecture <cite>turn8search190</cite> |
| **AP-0.1** | **Technology-agnostic logical design** | Target architecture defined at conceptual/logical level; vendor/product choices are physical and swappable; violations need an approved exception | Portability, negotiation leverage, no premature lock-in <cite>turn8search198</cite> |
| **AP-0.2** | **Inherit the enterprise baseline** | MPSP inherits Layer-1 standards (security baseline, approved patterns, identity, cloud placement) from day one, even as greenfield | Greenfield ≠ no parent enterprise <cite>turn8search191</cite> |
| **AP-0.3** | **Incremental over big-bang** | Delivered via foundation cycles + feature cycles + release waves; no big-bang cutover | Reduces blast radius; proven internally <cite>turn8search198</cite> |

---

## 3. Domain & structural principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-1.1** | **Domain & business-capability alignment (DDD)** | Services are bounded by business capability (payment, ledger, settlement, fee, reconciliation, dispute, onboarding, reporting), not by technical layer or legacy boundary | Clear ownership; low coupling <cite>turn8search190</cite> |
| **AP-1.2** | **Service autonomy** | Each service owns its data and is independently deployable; no shared mutable database between services | Independent scaling & release <cite>turn8search190</cite> |
| **AP-1.3** | **Separation of concerns** | API, application, domain, and infrastructure layers stay distinct within each service | Testability; contained change <cite>turn8search190</cite> |
| **AP-1.4** | **Stateless services** | No in-memory session state; any instance can serve any request (state lives in stores/event log) | Horizontal scaling <cite>turn8search190</cite> |
| **AP-1.5** | **Simplicity — justify every service** | A new service is justified by a genuine bounded context, not by "microservices are the standard"; avoid unnecessary fragmentation | Over-fragmentation raises cost <cite>turn8search190</cite> |
| **AP-1.6** | **C4 as the description standard** | Architecture is expressed as C4 L0 (context) / L1 (container); foundation defines this skeleton, feature HLDs are deltas — never descend below container in the baseline | Consistent, layered description <cite>turn8search193</cite> |

---

## 4. API & integration principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-2.1** | **API-first** | Contracts (OpenAPI/event schemas) are designed and reviewed *before* implementation | Parallel work; stable interfaces <cite>turn8search190</cite> |
| **AP-2.2** | **Unified acceptance entry point** | One acceptance API centralises payments, refunds, anti-fraud, tokenisation across channels (SEP pattern) | Reduces integration complexity <cite>turn5search113</cite> |
| **AP-2.3** | **Backward compatibility** | Breaking changes require a new major version; consumers are never silently broken | Ecosystem stability <cite>turn8search190</cite> |
| **AP-2.4** | **Event-driven core** | State transitions propagate as events (e.g., `payment.authorized`, `settlement.settled`); services integrate asynchronously where possible | Decoupling; scalability <cite>turn8search190</cite> |
| **AP-2.5** | **Adapter pattern for externals** | Schemes, acquirers, banks, sanctions, FX, KYB sit behind adapters; core is isolated from external protocol churn | Contain external volatility <cite>turn7search175</cite> |
| **AP-2.6** | **Gateway responsibilities are explicit** | The API gateway owns authN/Z, schema validation, and rate limiting — not business logic | Clear boundary; security at edge <cite>turn7search181</cite> |

---

## 5. Data & ledger principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-3.1** | **Append-only, double-entry ledger** | Every financial movement is a balanced, immutable ledger entry; corrections are compensating entries, never edits | Auditability; financial truth <cite>turn7search181</cite> |
| **AP-3.2** | **Event-sourced state transitions** | The transaction state machine is driven by an ordered event log; current state is derivable/replayable | Traceability; recovery <cite>turn7search181</cite> |
| **AP-3.3** | **Data as a product** | Each domain owns its data with explicit quality, SLAs, and lifecycle; reporting reads via CQRS, not by reaching into service stores | Clean ownership; decoupled analytics <cite>turn8search198</cite> |
| **AP-3.4** | **Data-sensitivity classification** | Every entity/field carries a sensitivity tag; anything touching PAN/CVV/PIN is "restricted" and auto-triggers security controls | Drives encryption/audit depth <cite>turn7search182</cite> |
| **AP-3.5** | **Retention & residency by policy** | Financial/audit data retained per regulation (e.g., 5–7 yrs) then archived/anonymised; data stays in the contractually agreed region | GDPR/regulatory compliance <cite>turn7search182</cite> |

---

## 6. Financial-integrity principles (payments-specific, non-negotiable)

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-4.1** | **Idempotency everywhere** | Every unsafe/retryable operation carries an idempotency key; duplicate keys return the original result | No accidental double-processing <cite>turn8search190</cite><cite>turn7search181</cite> |
| **AP-4.2** | **Exactly-once settlement posting** | Settlement finalisation posts to the ledger exactly once, even under retries/timeouts (outbox + dedup) | No double debit / lost funds <cite>turn7search181</cite> |
| **AP-4.3** | **Deferred settlement is a first-class state** | On timeout/deferred rail responses, transaction stays "settlement-pending"; never re-debit; finalise on settled event | Correctness under async rails <cite>turn7search181</cite> |
| **AP-4.4** | **Compliance decision before authorization** | KYC/AML/risk decision precedes any hold/authorization; failures reject before financial effect | Regulatory + integrity <cite>turn7search181</cite> |
| **AP-4.5** | **Dual control & segregation of duties** | Financial calculations/config changes require dual-control validation; SoD enforced (SOX-aligned) | Fraud/error prevention <cite>turn7search178</cite> |
| **AP-4.6** | **Audit trail on every transition** | Every state transition and financial event is persisted immutably with actor, timestamp, and reason | Auditability; disputes; SOX <cite>turn7search181</cite> |

---

## 7. Security & compliance principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-5.1** | **Security by design, not bolt-on** | Threat modelling, authN/Z, and secrets management are part of initial design of every service | Cheaper, stronger security <cite>turn8search190</cite> |
| **AP-5.2** | **Minimum PCI scope via edge tokenisation** | PAN tokenised at the edge; card data never persists downstream; keeps most services out of PCI SAQ-D scope | Cost + risk reduction <cite>turn7search153</cite><cite>turn7search178</cite> |
| **AP-5.3** | **Encrypt everywhere** | TLS 1.3 in transit; AES-256 at rest; separate keys for SAD vs PAN; CVV/PIN never stored | Enterprise crypto baseline <cite>turn8search180</cite><cite>turn7search178</cite> |
| **AP-5.4** | **Strong auth & least privilege** | OAuth2/OIDC (or SAML) for access; RBAC across the 6 personas; least-privilege by default | Access control <cite>turn8search187</cite> |
| **AP-5.5** | **SCA & exemption-aware by design** | Customer-initiated EEA/UK flows enforce PSD2 SCA (2 factors) with an exemption engine (TRA/low-value/whitelist/MIT) | Compliant + high conversion <cite>turn7search178</cite> |
| **AP-5.6** | **Compliance criteria are explicit & regulation-referenced** | Security/compliance acceptance criteria are kept separate/visible and cite the article (PSD2 Art.97, GDPR Art.6/7/17, AMLD, PCI Req.3, DORA Art.11, SOX §404) | Auditable traceability <cite>turn7search178</cite><cite>turn7search182</cite> |
| **AP-5.7** | **Guardrails validate outputs** | A cross-cutting guardrail layer checks against GDPR/PSD2/PCI/data-residency and escalates/blocks on failure | Continuous, enforced compliance <cite>turn7search183</cite> |

---

## 7A. Authentication & authorisation principles

Identity is split across three planes — **authentication (who you are), authorisation (what you may do), and resource-level scope (which data/operation)** — and no single plane substitutes for another. This mirrors the house model where an enterprise IdP handles authN, an access-management layer handles RBAC/authZ, and OAuth2 scopes govern resource access. <cite>turn9search208</cite>

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-9.1** | **Centralised identity via enterprise IdP** | Authentication is delegated to the enterprise IdP (e.g., Entra ID/OIDC); MPSP never builds its own credential store or acts as an authorization server | Single source of identity truth <cite>turn9search208</cite><cite>turn9search203</cite> |
| **AP-9.2** | **OIDC for user authN, OAuth2 for delegated authZ** | UI initiates OIDC login; backend performs token exchange and owns the session; provider-agnostic via a factory so multiple IdPs are supported | Portable, provider-independent auth <cite>turn9search212</cite> |
| **AP-9.3** | **JWT as the token standard, short-lived** | Access tokens are JWTs (RS256, IdP-signed), validated at the gateway via the IdP's JWKS endpoint (signature, expiry, issuer, audience); tokens short-lived (≤1h) with refresh | Stateless, verifiable, low blast radius <cite>turn9search214</cite> |
| **AP-9.4** | **No shared service accounts — delegated identity (OBO)** | Service-to-backend calls use On-Behalf-Of token exchange (RFC 8693) carrying the *user's* identity; if a service is compromised, the attacker only has that user's scope — never a static over-privileged key | Least privilege; no static API keys <cite>turn9search214</cite><cite>turn9search210</cite> |
| **AP-9.5** | **Layered authorisation: RBAC + context-aware checks** | Coarse RBAC for the 6 personas, refined by context (operation + resource + parameters such as merchant ID / amount / date range) so a Disputes Analyst can't act outside their remit; resource servers enforce their own scopes | Fine-grained, least-privilege access <cite>turn9search214</cite> |
| **AP-9.6** | **Service identity, not shared credentials** | Every workload has its own identity (workload/pod identity); no shared credentials or manual secret handling — closing the "shared credentials / improper secrets management" anti-pattern | Enforceable least privilege <cite>turn9search216</cite> |
| **AP-9.7** | **Mutual TLS for service-to-service** | Inter-service traffic is mutually authenticated and encrypted (mTLS via service mesh); the API gateway reads/validates tokens pre-call but does not hold business authZ | Zero-trust internal calls <cite>turn9search201</cite> |
| **AP-9.8** | **Centralised secrets & token brokerage** | OAuth client secrets/refresh tokens live only in a managed secrets store (e.g., Vault/Secrets Manager); a single token-broker abstraction centralises acquisition, scopes, audit, and revocation — no secrets in env vars, prompts, or code | Auditable, revocable credentials <cite>turn9search203</cite><cite>turn9search216</cite> |
| **AP-9.9** | **SCA linkage at the authorisation boundary** | Customer-payment authorisation integrates PSD2 SCA (two independent factors) and the exemption engine at the same boundary that authorises the transaction | Compliant + low-friction (ties to AP-5.5) <cite>turn7search178</cite> |
| **AP-9.10** | **Immutable auth audit** | Every authentication event and privileged action is logged immutably with subject, client ID, resource, and timestamp | Forensics; SOX/DORA evidence <cite>turn9search214</cite> |

---

## 7B. Infrastructure & platform principles

Platform is treated as a **product with a shared-responsibility model**: the platform team builds and operates reusable, standards-aligned capabilities that feature teams consume — instantiated in the Phase-2B foundation build (CI/CD, auth, observability, DB scaffold). <cite>turn9search199</cite><cite>turn8search191</cite>

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-10.1** | **Cloud-native, container-first** | Designed for Kubernetes from the start (not adapted later); all components deploy as containers with health checks, HPA autoscaling, liveness/readiness probes, graceful shutdown | Scalability & portability <cite>turn8search190</cite><cite>turn9search216</cite> |
| **AP-10.2** | **Cloud-agnostic where feasible; managed services preferred** | No hard dependency on one hyperscaler's proprietary services; prefer managed services (DB, cache, streaming, storage) over self-managed unless justified | Avoid lock-in; reduce ops burden <cite>turn9search202</cite><cite>turn9search199</cite> |
| **AP-10.3** | **Everything as Infrastructure-as-Code** | All infra (compute, network, IAM, secrets) is defined via IaC (e.g., Terraform/Helm) with GitOps for reproducible, auditable, reviewable deployments — no manual console changes | Reproducibility; auditability <cite>turn9search198</cite><cite>turn9search216</cite> |
| **AP-10.4** | **Standardise the stack; new tech earns its place** | Adopt the approved enterprise stack/technology radar; any off-radar technology needs an RFC and architecture sign-off; no EOL/unmaintained dependencies; versions pinned | Lean, maintainable estate <cite>turn9search199</cite> |
| **AP-10.5** | **Network isolation & zero public exposure** | Workloads run in private subnets with no public IPs; access via VPN/PrivateLink/Direct Connect; segmentation via security groups + network policies; WAF + DDoS protection at the edge | Reduce attack surface <cite>turn9search200</cite><cite>turn9search202</cite> |
| **AP-10.6** | **Multi-AZ by default; PCI zone isolation** | Deploy across multiple availability zones; the PCI/tokenisation scope runs in a segmented, isolated zone separate from non-card workloads | Resilience + minimum PCI scope <cite>turn9search200</cite><cite>turn7search153</cite> |
| **AP-10.7** | **Managed key & secrets services (KMS)** | Encryption keys in a managed KMS with lifecycle/rotation; secrets in a managed secrets store — never in images, code, or env vars | Crypto & credential hygiene <cite>turn9search198</cite><cite>turn9search216</cite> |
| **AP-10.8** | **Environment parity & isolation** | Dev/test/staging/prod are isolated and reproducible; behaviour differs by configuration, not code branches; non-prod uses tokenised/synthetic data (never live PAN) | Safe, predictable promotion <cite>turn8search190</cite><cite>turn7search178</cite> |
| **AP-10.9** | **Supply-chain & container security** | CI/CD security scanning, image signing, vulnerability management; containers run as non-root with read-only filesystems and dropped capabilities | Secure-by-default runtime <cite>turn9search216</cite> |
| **AP-10.10** | **Tenancy & data residency by design** | Merchant data logically isolated (row-level security aligned to RBAC where shared); workloads and data pinned to the contractually agreed region | Isolation + regulatory residency <cite>turn9search211</cite><cite>turn7search182</cite> |

---

## 8. Resilience & availability principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-6.1** | **Resilience by design** | Timeouts, retries (bounded), and circuit breakers are part of the initial design of every external call | Graceful failure <cite>turn8search190</cite> |
| **AP-6.2** | **Compensation over corruption** | Downstream posting failures trigger compensation / manual-repair workflows — never silent partial state | Financial correctness <cite>turn7search181</cite> |
| **AP-6.3** | **24/7/365 with DORA-grade DR** | Acceptance/authorization path is always-on; quarterly DR tests; RTO/RPO met (target RTO 60 min / RPO 5 min, TBD) | Operational resilience <cite>turn7search178</cite><cite>turn8search183</cite> |
| **AP-6.4** | **Design for scale from day one** | Cloud-native, container-first, horizontal auto-scaling (e.g., within minutes at 2× peak) | High-volume acquiring class <cite>turn8search190</cite><cite>turn8search183</cite> |
| **AP-6.5** | **Graceful degradation** | Non-critical paths degrade without erroring; empty/absent inputs (e.g., missing CMDB) degrade gracefully | Robustness <cite>turn7search181</cite> |

---

## 9. Observability & operations principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-7.1** | **Observability by design** | Every service instrumented from day one (traces, metrics, logs) — not retrofitted after an incident | Faster detection/debug <cite>turn8search190</cite><cite>turn8search185</cite> |
| **AP-7.2** | **End-to-end traceability** | Every transaction is traceable across its full state journey and across service hops | Disputes, audits, RCA <cite>turn8search185</cite> |
| **AP-7.3** | **Config over customization** | Environment differences are configuration, not code branches | Portability; fewer defects <cite>turn8search190</cite> |
| **AP-7.4** | **Runbooks, alerting, RBAC-aware ops** | Thresholds, notification channels, and role-based alerting defined before go-live | Supportable operations <cite>turn8search185</cite> |
| **AP-7.5** | **FinOps awareness** | Cost/usage tracked continuously; avoid over-provisioning; unit economics visible | Sustainable run cost <cite>turn8search185</cite> |

---

## 10. Delivery & change principles

| ID | Principle | What it means for MPSP | Rationale |
|----|-----------|------------------------|-----------|
| **AP-8.1** | **Foundation before construction** | Layer-2 foundation (CI/CD, auth, design system, DB scaffold, observability) is DA0/DA1-approved and deployed before the first feature cycle | No task before its architecture <cite>turn8search191</cite><cite>turn8search193</cite> |
| **AP-8.2** | **Decompose to coarsest verifiable unit** | Work Units are sized by context (one agent session, independently verifiable), not by effort; avoid over-decomposition | House decomposition standard <cite>turn8search191</cite> |
| **AP-8.3** | **HLD-delta rule** | Every feature HLD is a *delta* against the named foundation baseline, not a from-scratch design | Consistency; less rework <cite>turn8search193</cite> |
| **AP-8.4** | **Governed exceptions (ADR)** | Any deviation from these principles or approved patterns is captured and approved via ADR at DA0/DA1 | Auditable decisions <cite>turn8search184</cite> |
| **AP-8.5** | **Human-in-the-loop at decision gates** | Architecture option selection, DA0/DA1 review, and design-exception handling remain explicit human gates | Accountability <cite>turn8search184</cite> |

---

## 11. Principle-to-NFR mapping (for the HLD NFR sections)
These principles operationalise the enterprise NFR categories (resilience, performance, scalability, security, data protection, compliance, observability, maintainability, DR/BC, auditability) that every HLD must address. <cite>turn8search183</cite>

| NFR category | Governing principles |
|--------------|----------------------|
| Resilience & Availability | AP-6.1, AP-6.3, AP-6.5 |
| Performance | AP-1.4, AP-2.4, AP-6.4 |
| Scalability | AP-1.2, AP-1.4, AP-6.4 |
| Security | AP-5.1–AP-5.4, AP-9.1–AP-9.10, AP-10.5–AP-10.9 |
| Identity & Access | AP-9.1–AP-9.10 |
| Data Protection & Privacy | AP-3.4, AP-3.5, AP-5.2, AP-5.3, AP-10.7, AP-10.10 |
| Compliance & Regulatory | AP-4.4, AP-5.5–AP-5.7, AP-9.9, AP-10.10 |
| Monitoring & Observability | AP-7.1, AP-7.2, AP-7.4 |
| Maintainability | AP-1.3, AP-2.1, AP-7.3, AP-10.3, AP-10.4 |
| Infrastructure & Platform | AP-10.1–AP-10.10 |
| DR & Business Continuity | AP-6.3, AP-10.6 |
| Auditability | AP-3.1, AP-4.6, AP-8.4, AP-9.10 |
| Financial Integrity (payments-specific) | AP-4.1–AP-4.6 |

---

## 12. Governance & exceptions
- **Owner:** Architecture function maintains this document; it is a standing input to Beat-1 constraints and the Phase-2B Foundation Architecture.
- **Enforcement:** validated at DA0/DA1; feature HLDs are checked against these principles as deltas. <cite>turn8search193</cite>
- **Exceptions:** raised as ADRs, reviewed at the architecture governance gate, with residual risk explicitly accepted and recorded — never silent. <cite>turn8search198</cite><cite>turn8search184</cite>

---
*Next: these principles constrain the Phase-1 `impact-assessment.md` and Beat-1 `dependency-graph.json`, and are instantiated by the Phase-2B `foundation-architecture.md` (pattern selection, C4 L0/L1 skeleton, ADR log, cross-cutting concerns).*
