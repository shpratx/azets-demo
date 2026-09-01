# Epic Breakdown — Automated Ledger Mapping Tool

| Field | Value |
|---|---|
| **Product** | Automated Ledger Mapping Tool |
| **Delivery model** | Foundation → MVP → Incremental → Advanced |
| **Epics** | 21 across 4 waves |
| **Features** | 105 |
| **Source** | `planning/epics.json` — this document is generated from it |

> Generated from `epics.json`. If the two disagree, the JSON is authoritative: it is the file the planning agents read. Regenerate rather than editing this document by hand.

---

## Wave summary

| Wave | Type | Epics | Features | Purpose |
|---|---|--:|--:|---|
| **W0** | Foundation | 5 | 25 | Reusable architectural baseline. No feature work begins outside it (AP-8.1). |
| **W1** | MVP | 8 | 40 | The first end-to-end journey: upload a legacy ledger, map it, review it, sync it, prove it. |
| **W2** | Incremental | 4 | 20 | Scale and supportability once the core journey is proven. |
| **W3** | Advanced | 4 | 20 | Intelligence and multi-tenancy on top of a working, audited platform. |
| | **Total** | **21** | **105** | |

## Epic index

| ID | Epic | Wave | Type | Features | Requirements |
|---|---|---|---|--:|---|
| `F0.1` | [Platform Engineering Foundation](#f01-platform-engineering-foundation) | W0 | Foundation | 5 | — |
| `F0.2` | [Identity and Access Platform](#f02-identity-and-access-platform) | W0 | Foundation | 5 | — |
| `F0.3` | [Master Ledger Reference Management](#f03-master-ledger-reference-management) | W0 | Foundation | 5 | — |
| `F0.4` | [Mapping Rules Engine Foundation](#f04-mapping-rules-engine-foundation) | W0 | Foundation | 5 | — |
| `F0.5` | [AI and Machine Learning Foundation](#f05-ai-and-machine-learning-foundation) | W0 | Foundation | 5 | — |
| `F1.1` | [Legacy Account Intake](#f11-legacy-account-intake) | W1 | MVP | 5 | `FR1` |
| `F1.2` | [Account Structure Processing](#f12-account-structure-processing) | W1 | MVP | 5 | — |
| `F1.3` | [Automated Mapping Engine](#f13-automated-mapping-engine) | W1 | MVP | 5 | `FR2` |
| `F1.4` | [Ambiguity and Exception Management](#f14-ambiguity-and-exception-management) | W1 | MVP | 5 | `FR3` |
| `F1.5` | [Manual Mapping Workbench](#f15-manual-mapping-workbench) | W1 | MVP | 5 | `FR3` |
| `F1.6` | [Cozone Integration](#f16-cozone-integration) | W1 | MVP | 5 | `FR5` |
| `F1.7` | [Audit Reporting](#f17-audit-reporting) | W1 | MVP | 5 | `FR4` |
| `F1.8` | [Notification Framework](#f18-notification-framework) | W1 | MVP | 5 | `FR6` |
| `F2.1` | [Mapping History and Audit Portal](#f21-mapping-history-and-audit-portal) | W2 | Incremental | 5 | `FR7` |
| `F2.2` | [Bulk Mapping Operations](#f22-bulk-mapping-operations) | W2 | Incremental | 5 | `FR8` |
| `F2.3` | [Contextual Help and Support](#f23-contextual-help-and-support) | W2 | Incremental | 5 | `FR9` |
| `F2.4` | [Operational Analytics and Dashboard](#f24-operational-analytics-and-dashboard) | W2 | Incremental | 5 | — |
| `F3.1` | [Predictive Mapping Analytics](#f31-predictive-mapping-analytics) | W3 | Advanced | 5 | `FR10` |
| `F3.2` | [Custom Mapping Rule Framework](#f32-custom-mapping-rule-framework) | W3 | Advanced | 5 | `FR11` |
| `F3.3` | [AI Continuous Learning](#f33-ai-continuous-learning) | W3 | Advanced | 5 | — |
| `F3.4` | [SaaS Tenant Management](#f34-saas-tenant-management) | W3 | Advanced | 5 | — |

---

## W0 — Foundation

*Reusable architectural baseline. No feature work begins outside it (AP-8.1).*

**5 epics · 25 features**

### F0.1 · Platform Engineering Foundation

**Objective.** Establish cloud-native platform, environments, deployment automation, observability and operational readiness.

Wave `W0` · Type `Foundation` · 5 features

| # | Feature |
|---|---|
| `F0.1.1` | Infrastructure as Code |
| `F0.1.2` | Environment Provisioning |
| `F0.1.3` | CI/CD Platform |
| `F0.1.4` | Observability Foundation |
| `F0.1.5` | Resilience Foundation |

### F0.2 · Identity and Access Platform

**Objective.** Implement enterprise-grade authentication, authorization and audit controls.

Wave `W0` · Type `Foundation` · 5 features

| # | Feature |
|---|---|
| `F0.2.1` | User Authentication |
| `F0.2.2` | Role Based Access Control |
| `F0.2.3` | Session and Token Management |
| `F0.2.4` | Fine-Grained Permissions |
| `F0.2.5` | Access Audit Logging |

### F0.3 · Master Ledger Reference Management

**Objective.** Establish authoritative Azets master ledger management capability.

Wave `W0` · Type `Foundation` · 5 features

| # | Feature |
|---|---|
| `F0.3.1` | Master Ledger Import |
| `F0.3.2` | Ledger Maintenance UI |
| `F0.3.3` | Ledger Versioning |
| `F0.3.4` | Ledger Classification |
| `F0.3.5` | Ledger Audit Tracking |

### F0.4 · Mapping Rules Engine Foundation

**Objective.** Create configurable deterministic mapping engine.

Wave `W0` · Type `Foundation` · 5 features

| # | Feature |
|---|---|
| `F0.4.1` | Rule Management |
| `F0.4.2` | Rule Repository |
| `F0.4.3` | Rule Evaluation Service |
| `F0.4.4` | Rule Versioning |
| `F0.4.5` | Rule Simulation |

### F0.5 · AI and Machine Learning Foundation

**Objective.** Create AI training and recommendation infrastructure.

Wave `W0` · Type `Foundation` · 5 features

| # | Feature |
|---|---|
| `F0.5.1` | Historical Mapping Data Model |
| `F0.5.2` | Training Dataset Pipeline |
| `F0.5.3` | Feature Extraction Framework |
| `F0.5.4` | Model Registry |
| `F0.5.5` | Explainability Framework |

---

## W1 — MVP

*The first end-to-end journey: upload a legacy ledger, map it, review it, sync it, prove it.*

**8 epics · 40 features**

### F1.1 · Legacy Account Intake

**Objective.** Accept and validate incoming account structures.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR1`

| # | Feature |
|---|---|
| `F1.1.1` | CSV Upload |
| `F1.1.2` | XLSX Upload |
| `F1.1.3` | XML Upload |
| `F1.1.4` | Schema Validation |
| `F1.1.5` | File Error Reporting |

### F1.2 · Account Structure Processing

**Objective.** Normalize legacy account structures before mapping.

Wave `W1` · Type `MVP` · 5 features

| # | Feature |
|---|---|
| `F1.2.1` | File Parsing |
| `F1.2.2` | Data Normalization |
| `F1.2.3` | Duplicate Detection |
| `F1.2.4` | Missing Code Detection |
| `F1.2.5` | Data Quality Scoring |

### F1.3 · Automated Mapping Engine

**Objective.** Generate rule-based and AI-driven mapping recommendations.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR2`

| # | Feature |
|---|---|
| `F1.3.1` | Rule-Based Mapping |
| `F1.3.2` | AI Mapping Suggestions |
| `F1.3.3` | Similarity Scoring |
| `F1.3.4` | Confidence Scoring |
| `F1.3.5` | Recommendation Ranking |

### F1.4 · Ambiguity and Exception Management

**Objective.** Identify and route uncertain mappings for review.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR3`

| # | Feature |
|---|---|
| `F1.4.1` | Ambiguity Detection |
| `F1.4.2` | Review Queue |
| `F1.4.3` | Exception Dashboard |
| `F1.4.4` | Needs Review Workflow |
| `F1.4.5` | Assignment Management |

### F1.5 · Manual Mapping Workbench

**Objective.** Provide human-in-the-loop review and override capabilities.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR3`

| # | Feature |
|---|---|
| `F1.5.1` | Mapping Review Screen |
| `F1.5.2` | Manual Mapping Selection |
| `F1.5.3` | Search Master Ledger |
| `F1.5.4` | Override Approval |
| `F1.5.5` | Override Audit Capture |

### F1.6 · Cozone Integration

**Objective.** Synchronize approved mappings into Cozone.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR5`

| # | Feature |
|---|---|
| `F1.6.1` | Cozone API Adapter |
| `F1.6.2` | Mapping Export Service |
| `F1.6.3` | Synchronization Monitoring |
| `F1.6.4` | Retry Framework |
| `F1.6.5` | Failure Handling |

### F1.7 · Audit Reporting

**Objective.** Generate audit-ready compliance reports.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR4`

| # | Feature |
|---|---|
| `F1.7.1` | Mapping Decision Capture |
| `F1.7.2` | Override Audit Capture |
| `F1.7.3` | Audit Event Timeline |
| `F1.7.4` | PDF Report Generation |
| `F1.7.5` | CSV Report Generation |

### F1.8 · Notification Framework

**Objective.** Inform users about errors, failures and required actions.

Wave `W1` · Type `MVP` · 5 features · Requirements `FR6`

| # | Feature |
|---|---|
| `F1.8.1` | Mapping Error Notifications |
| `F1.8.2` | Validation Error Notifications |
| `F1.8.3` | Integration Failure Notifications |
| `F1.8.4` | In-App Notifications |
| `F1.8.5` | Email Notifications |

---

## W2 — Incremental

*Scale and supportability once the core journey is proven.*

**4 epics · 20 features**

### F2.1 · Mapping History and Audit Portal

**Objective.** Provide historical traceability and audit access.

Wave `W2` · Type `Incremental` · 5 features · Requirements `FR7`

| # | Feature |
|---|---|
| `F2.1.1` | Session History |
| `F2.1.2` | Historical Search |
| `F2.1.3` | Report Retrieval |
| `F2.1.4` | Investigation View |
| `F2.1.5` | Change Timeline |

### F2.2 · Bulk Mapping Operations

**Objective.** Support multiple-firm processing at scale.

Wave `W2` · Type `Incremental` · 5 features · Requirements `FR8`

| # | Feature |
|---|---|
| `F2.2.1` | Multi-Firm Upload |
| `F2.2.2` | Batch Processing |
| `F2.2.3` | Batch Monitoring |
| `F2.2.4` | Batch Retry |
| `F2.2.5` | Parallel Execution |

### F2.3 · Contextual Help and Support

**Objective.** Provide embedded support capability.

Wave `W2` · Type `Incremental` · 5 features · Requirements `FR9`

| # | Feature |
|---|---|
| `F2.3.1` | Guided Uploads |
| `F2.3.2` | Mapping Help Assistant |
| `F2.3.3` | Troubleshooting Catalog |
| `F2.3.4` | Support Requests |
| `F2.3.5` | Knowledge Base |

### F2.4 · Operational Analytics and Dashboard

**Objective.** Track platform health, adoption and KPIs.

Wave `W2` · Type `Incremental` · 5 features

| # | Feature |
|---|---|
| `F2.4.1` | Processing Metrics |
| `F2.4.2` | Error Analytics |
| `F2.4.3` | Adoption Analytics |
| `F2.4.4` | SLA Monitoring |
| `F2.4.5` | KPI Dashboard |

---

## W3 — Advanced

*Intelligence and multi-tenancy on top of a working, audited platform.*

**4 epics · 20 features**

### F3.1 · Predictive Mapping Analytics

**Objective.** Predict mapping quality and integration outcomes.

Wave `W3` · Type `Advanced` · 5 features · Requirements `FR10`

| # | Feature |
|---|---|
| `F3.1.1` | Confidence Forecasting |
| `F3.1.2` | Accuracy Prediction |
| `F3.1.3` | Risk Identification |
| `F3.1.4` | Mapping Readiness Score |
| `F3.1.5` | Recommendation Quality Metrics |

### F3.2 · Custom Mapping Rule Framework

**Objective.** Allow configurable rule customization by partner firms.

Wave `W3` · Type `Advanced` · 5 features · Requirements `FR11`

| # | Feature |
|---|---|
| `F3.2.1` | Partner Rule Definitions |
| `F3.2.2` | Rule Templates |
| `F3.2.3` | Visual Rule Builder |
| `F3.2.4` | Rule Testing Sandbox |
| `F3.2.5` | Rule Promotion Workflow |

### F3.3 · AI Continuous Learning

**Objective.** Improve mapping quality through feedback loops.

Wave `W3` · Type `Advanced` · 5 features

| # | Feature |
|---|---|
| `F3.3.1` | Feedback Capture |
| `F3.3.2` | Override Learning |
| `F3.3.3` | Model Retraining |
| `F3.3.4` | Recommendation Optimization |
| `F3.3.5` | Drift Detection |

### F3.4 · SaaS Tenant Management

**Objective.** Enable multi-tenant commercialization of the platform.

Wave `W3` · Type `Advanced` · 5 features

| # | Feature |
|---|---|
| `F3.4.1` | Tenant Provisioning |
| `F3.4.2` | Subscription Management |
| `F3.4.3` | Usage Metering |
| `F3.4.4` | Tenant Isolation |
| `F3.4.5` | Commercial Reporting |

---

## Requirement traceability

Reverse index: which epics deliver each numbered requirement. Requirements without an epic are unimplemented; epics without a requirement are enabling or platform work.

| Requirement | Delivered by |
|---|---|
| `FR1` | `F1.1` |
| `FR2` | `F1.3` |
| `FR3` | `F1.4`, `F1.5` |
| `FR4` | `F1.7` |
| `FR5` | `F1.6` |
| `FR6` | `F1.8` |
| `FR7` | `F2.1` |
| `FR8` | `F2.2` |
| `FR9` | `F2.3` |
| `FR10` | `F3.1` |
| `FR11` | `F3.2` |

**11 requirements** map to epics. **9 epics carry no requirement reference** — `F0.1`, `F0.2`, `F0.3`, `F0.4`, `F0.5`, `F1.2`, `F2.4`, `F3.3`, `F3.4` — these are foundation, platform or enabling epics rather than gaps.

---

## Full feature list

All 105 features in delivery order.

| Feature | Name | Epic | Wave |
|---|---|---|---|
| `F0.1.1` | Infrastructure as Code | `F0.1` Platform Engineering Foundation | W0 |
| `F0.1.2` | Environment Provisioning | `F0.1` Platform Engineering Foundation | W0 |
| `F0.1.3` | CI/CD Platform | `F0.1` Platform Engineering Foundation | W0 |
| `F0.1.4` | Observability Foundation | `F0.1` Platform Engineering Foundation | W0 |
| `F0.1.5` | Resilience Foundation | `F0.1` Platform Engineering Foundation | W0 |
| `F0.2.1` | User Authentication | `F0.2` Identity and Access Platform | W0 |
| `F0.2.2` | Role Based Access Control | `F0.2` Identity and Access Platform | W0 |
| `F0.2.3` | Session and Token Management | `F0.2` Identity and Access Platform | W0 |
| `F0.2.4` | Fine-Grained Permissions | `F0.2` Identity and Access Platform | W0 |
| `F0.2.5` | Access Audit Logging | `F0.2` Identity and Access Platform | W0 |
| `F0.3.1` | Master Ledger Import | `F0.3` Master Ledger Reference Management | W0 |
| `F0.3.2` | Ledger Maintenance UI | `F0.3` Master Ledger Reference Management | W0 |
| `F0.3.3` | Ledger Versioning | `F0.3` Master Ledger Reference Management | W0 |
| `F0.3.4` | Ledger Classification | `F0.3` Master Ledger Reference Management | W0 |
| `F0.3.5` | Ledger Audit Tracking | `F0.3` Master Ledger Reference Management | W0 |
| `F0.4.1` | Rule Management | `F0.4` Mapping Rules Engine Foundation | W0 |
| `F0.4.2` | Rule Repository | `F0.4` Mapping Rules Engine Foundation | W0 |
| `F0.4.3` | Rule Evaluation Service | `F0.4` Mapping Rules Engine Foundation | W0 |
| `F0.4.4` | Rule Versioning | `F0.4` Mapping Rules Engine Foundation | W0 |
| `F0.4.5` | Rule Simulation | `F0.4` Mapping Rules Engine Foundation | W0 |
| `F0.5.1` | Historical Mapping Data Model | `F0.5` AI and Machine Learning Foundation | W0 |
| `F0.5.2` | Training Dataset Pipeline | `F0.5` AI and Machine Learning Foundation | W0 |
| `F0.5.3` | Feature Extraction Framework | `F0.5` AI and Machine Learning Foundation | W0 |
| `F0.5.4` | Model Registry | `F0.5` AI and Machine Learning Foundation | W0 |
| `F0.5.5` | Explainability Framework | `F0.5` AI and Machine Learning Foundation | W0 |
| `F1.1.1` | CSV Upload | `F1.1` Legacy Account Intake | W1 |
| `F1.1.2` | XLSX Upload | `F1.1` Legacy Account Intake | W1 |
| `F1.1.3` | XML Upload | `F1.1` Legacy Account Intake | W1 |
| `F1.1.4` | Schema Validation | `F1.1` Legacy Account Intake | W1 |
| `F1.1.5` | File Error Reporting | `F1.1` Legacy Account Intake | W1 |
| `F1.2.1` | File Parsing | `F1.2` Account Structure Processing | W1 |
| `F1.2.2` | Data Normalization | `F1.2` Account Structure Processing | W1 |
| `F1.2.3` | Duplicate Detection | `F1.2` Account Structure Processing | W1 |
| `F1.2.4` | Missing Code Detection | `F1.2` Account Structure Processing | W1 |
| `F1.2.5` | Data Quality Scoring | `F1.2` Account Structure Processing | W1 |
| `F1.3.1` | Rule-Based Mapping | `F1.3` Automated Mapping Engine | W1 |
| `F1.3.2` | AI Mapping Suggestions | `F1.3` Automated Mapping Engine | W1 |
| `F1.3.3` | Similarity Scoring | `F1.3` Automated Mapping Engine | W1 |
| `F1.3.4` | Confidence Scoring | `F1.3` Automated Mapping Engine | W1 |
| `F1.3.5` | Recommendation Ranking | `F1.3` Automated Mapping Engine | W1 |
| `F1.4.1` | Ambiguity Detection | `F1.4` Ambiguity and Exception Management | W1 |
| `F1.4.2` | Review Queue | `F1.4` Ambiguity and Exception Management | W1 |
| `F1.4.3` | Exception Dashboard | `F1.4` Ambiguity and Exception Management | W1 |
| `F1.4.4` | Needs Review Workflow | `F1.4` Ambiguity and Exception Management | W1 |
| `F1.4.5` | Assignment Management | `F1.4` Ambiguity and Exception Management | W1 |
| `F1.5.1` | Mapping Review Screen | `F1.5` Manual Mapping Workbench | W1 |
| `F1.5.2` | Manual Mapping Selection | `F1.5` Manual Mapping Workbench | W1 |
| `F1.5.3` | Search Master Ledger | `F1.5` Manual Mapping Workbench | W1 |
| `F1.5.4` | Override Approval | `F1.5` Manual Mapping Workbench | W1 |
| `F1.5.5` | Override Audit Capture | `F1.5` Manual Mapping Workbench | W1 |
| `F1.6.1` | Cozone API Adapter | `F1.6` Cozone Integration | W1 |
| `F1.6.2` | Mapping Export Service | `F1.6` Cozone Integration | W1 |
| `F1.6.3` | Synchronization Monitoring | `F1.6` Cozone Integration | W1 |
| `F1.6.4` | Retry Framework | `F1.6` Cozone Integration | W1 |
| `F1.6.5` | Failure Handling | `F1.6` Cozone Integration | W1 |
| `F1.7.1` | Mapping Decision Capture | `F1.7` Audit Reporting | W1 |
| `F1.7.2` | Override Audit Capture | `F1.7` Audit Reporting | W1 |
| `F1.7.3` | Audit Event Timeline | `F1.7` Audit Reporting | W1 |
| `F1.7.4` | PDF Report Generation | `F1.7` Audit Reporting | W1 |
| `F1.7.5` | CSV Report Generation | `F1.7` Audit Reporting | W1 |
| `F1.8.1` | Mapping Error Notifications | `F1.8` Notification Framework | W1 |
| `F1.8.2` | Validation Error Notifications | `F1.8` Notification Framework | W1 |
| `F1.8.3` | Integration Failure Notifications | `F1.8` Notification Framework | W1 |
| `F1.8.4` | In-App Notifications | `F1.8` Notification Framework | W1 |
| `F1.8.5` | Email Notifications | `F1.8` Notification Framework | W1 |
| `F2.1.1` | Session History | `F2.1` Mapping History and Audit Portal | W2 |
| `F2.1.2` | Historical Search | `F2.1` Mapping History and Audit Portal | W2 |
| `F2.1.3` | Report Retrieval | `F2.1` Mapping History and Audit Portal | W2 |
| `F2.1.4` | Investigation View | `F2.1` Mapping History and Audit Portal | W2 |
| `F2.1.5` | Change Timeline | `F2.1` Mapping History and Audit Portal | W2 |
| `F2.2.1` | Multi-Firm Upload | `F2.2` Bulk Mapping Operations | W2 |
| `F2.2.2` | Batch Processing | `F2.2` Bulk Mapping Operations | W2 |
| `F2.2.3` | Batch Monitoring | `F2.2` Bulk Mapping Operations | W2 |
| `F2.2.4` | Batch Retry | `F2.2` Bulk Mapping Operations | W2 |
| `F2.2.5` | Parallel Execution | `F2.2` Bulk Mapping Operations | W2 |
| `F2.3.1` | Guided Uploads | `F2.3` Contextual Help and Support | W2 |
| `F2.3.2` | Mapping Help Assistant | `F2.3` Contextual Help and Support | W2 |
| `F2.3.3` | Troubleshooting Catalog | `F2.3` Contextual Help and Support | W2 |
| `F2.3.4` | Support Requests | `F2.3` Contextual Help and Support | W2 |
| `F2.3.5` | Knowledge Base | `F2.3` Contextual Help and Support | W2 |
| `F2.4.1` | Processing Metrics | `F2.4` Operational Analytics and Dashboard | W2 |
| `F2.4.2` | Error Analytics | `F2.4` Operational Analytics and Dashboard | W2 |
| `F2.4.3` | Adoption Analytics | `F2.4` Operational Analytics and Dashboard | W2 |
| `F2.4.4` | SLA Monitoring | `F2.4` Operational Analytics and Dashboard | W2 |
| `F2.4.5` | KPI Dashboard | `F2.4` Operational Analytics and Dashboard | W2 |
| `F3.1.1` | Confidence Forecasting | `F3.1` Predictive Mapping Analytics | W3 |
| `F3.1.2` | Accuracy Prediction | `F3.1` Predictive Mapping Analytics | W3 |
| `F3.1.3` | Risk Identification | `F3.1` Predictive Mapping Analytics | W3 |
| `F3.1.4` | Mapping Readiness Score | `F3.1` Predictive Mapping Analytics | W3 |
| `F3.1.5` | Recommendation Quality Metrics | `F3.1` Predictive Mapping Analytics | W3 |
| `F3.2.1` | Partner Rule Definitions | `F3.2` Custom Mapping Rule Framework | W3 |
| `F3.2.2` | Rule Templates | `F3.2` Custom Mapping Rule Framework | W3 |
| `F3.2.3` | Visual Rule Builder | `F3.2` Custom Mapping Rule Framework | W3 |
| `F3.2.4` | Rule Testing Sandbox | `F3.2` Custom Mapping Rule Framework | W3 |
| `F3.2.5` | Rule Promotion Workflow | `F3.2` Custom Mapping Rule Framework | W3 |
| `F3.3.1` | Feedback Capture | `F3.3` AI Continuous Learning | W3 |
| `F3.3.2` | Override Learning | `F3.3` AI Continuous Learning | W3 |
| `F3.3.3` | Model Retraining | `F3.3` AI Continuous Learning | W3 |
| `F3.3.4` | Recommendation Optimization | `F3.3` AI Continuous Learning | W3 |
| `F3.3.5` | Drift Detection | `F3.3` AI Continuous Learning | W3 |
| `F3.4.1` | Tenant Provisioning | `F3.4` SaaS Tenant Management | W3 |
| `F3.4.2` | Subscription Management | `F3.4` SaaS Tenant Management | W3 |
| `F3.4.3` | Usage Metering | `F3.4` SaaS Tenant Management | W3 |
| `F3.4.4` | Tenant Isolation | `F3.4` SaaS Tenant Management | W3 |
| `F3.4.5` | Commercial Reporting | `F3.4` SaaS Tenant Management | W3 |

