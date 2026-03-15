# Standard ATT PMP Risk Register

Starting template for all ATT tender PMP risk registers.
Customise per project — add project-specific risks, adjust ratings for context.

## Risk Rating Matrix

| Probability \ Impact | Low | Medium | High |
|---|---|---|---|
| High | Medium | High | Critical |
| Medium | Low | Medium | High |
| Low | Low | Low | Medium |

## Standard Risk Register

| Risk ID | Description | Probability | Impact | Rating | Mitigation | Contingency | Owner |
|---|---|---|---|---|---|---|---|
| R001 | Requirements change / scope creep during development | Medium | High | High | Formal change control process; requirements baseline at design sign-off; weekly requirements review | Reassess timeline and resources at each change request; defer non-critical items to Phase 2 | ATT PM |
| R002 | Key personnel departure (Project Manager, Technical Lead) | Low | High | Medium | Cross-training; knowledge documentation; succession plan identified pre-project | Immediate replacement from ATT talent pool; 30-day client notification | ATT PM |
| R003 | Third-party system integration issues | Medium | High | High | Early interface prototyping; dedicated integration sprint; API agreement with third-party by design freeze | Extended integration sprint; escalation to client for third-party coordination | Tech Lead |
| R004 | Data migration complexity — data quality issues | Medium | High | High | Pre-migration data audit; data cleansing plan; parallel run period | Extended parallel run; rollback plan; ATT DBA support extended | Tech Lead |
| R005 | Client UAT delays (resourcing, competing priorities) | Medium | Medium | Medium | Pre-UAT preparation support; pre-scheduled UAT windows; dedicated ATT UAT support | Revised UAT schedule; additional ATT support resources deployed | ATT PM |
| R006 | Hardware delivery delays | Low | Medium | Low | Early procurement (>3 months lead time); identify backup hardware suppliers | Use virtualised/cloud environment for UAT if hardware delayed | ATT PM |
| R007 | Security vulnerability discovered post-deployment | Low | High | Medium | Annual VAPT; pre-go-live penetration test; OWASP-compliant development; code review gates | Emergency patch within 24h for critical; workaround documented; client notified within 4h | Tech Lead |
| R008 | Inadequate test environment setup | Low | Medium | Low | Environment setup as first deliverable (Week 2); dedicated environment checklist | Use production-equivalent VM for testing if dedicated environment fails | Tech Lead |
| R009 | Communication breakdown with client stakeholders | Low | Medium | Low | Weekly status reports; named client PM as single point of contact; escalation path documented | Steering Committee escalation; ATT executive sponsor direct contact | ATT PM |
| R010 | Pandemic / force majeure impacting on-site delivery | Low | High | Medium | Remote delivery capability; VPN access to test environment; cloud-hosted UAT | Switch to fully remote delivery mode; adjust schedule per client BCP | ATT PM |

## Project-Specific Risks to Consider

Depending on the tender, also evaluate:
- Network/connectivity risks (if system requires on-premise deployment)
- Regulatory/compliance risks (if new data protection requirements mid-project)
- Vendor dependency risks (if system uses third-party licensed components)
- End-user adoption risks (if system involves major process change for end users)
- Concurrent project risks (if client is running other major IT projects simultaneously)
