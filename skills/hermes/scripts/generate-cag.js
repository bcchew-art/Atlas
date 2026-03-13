const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Header, Footer, ImageRun, AlignmentType, HeadingLevel, TableOfContents, PageBreak, PageNumber, TabStopType, TabStopPosition, BorderStyle, WidthType, Table, TableRow, TableCell } = require('docx');

const workspace = 'C:/Users/Admin/.openclaw/workspace';
const tenderRoot = 'C:/Users/Admin/.openclaw/tender/CAG';
const outDir = path.join(tenderRoot, 'tender submission');
const logoPath = path.join(workspace, 'skills', 'hermes', 'assets', 'att-logo.png');
const logoData = fs.readFileSync(logoPath);
fs.mkdirSync(outDir, { recursive: true });

const tenderTitle = '2025/00518 Changi Airport Group (S) Pte Ltd';
const projectTitle = 'Implementation and Maintenance of T3 Integrated Information Display System (IIDS) Refresh';
const versionText = 'Version 1.0  |  2026-03-13';

function run(text, opts = {}) {
  return new TextRun({ text, font: 'Book Antiqua', size: 24, ...opts });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [run(text, opts.run || {})], ...opts });
}
function bullet(text, level = 0) {
  return new Paragraph({ text, bullet: { level }, spacing: { after: 60 } });
}
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, style: 'Heading1' });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, style: 'Heading2' });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, style: 'Heading3' });
}
function cover(docName, fileTitle) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1800, after: 400 }, children: [new ImageRun({ data: logoData, type: 'png', transformation: { width: 320, height: 171 } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [run(tenderTitle, { bold: true, size: 30 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [run(projectTitle, { bold: true, size: 34 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 120 }, children: [run(fileTitle, { size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 180, after: 120 }, children: [run(versionText, { color: '666666' })] }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ text: 'Table of Contents', heading: HeadingLevel.HEADING_1, style: 'Heading1' }),
    new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-3' }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}
function header(title) {
  return new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], children: [run(title, { bold: true, allCaps: true }), new TextRun('\t'), new ImageRun({ data: logoData, type: 'png', transformation: { width: 88, height: 47 } })] })] });
}
function footer(leftText) {
  return new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 4 } }, tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], children: [run(leftText), new TextRun('\t'), new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], font: 'Book Antiqua', size: 24 })] })] });
}
function styles() {
  return {
    default: { document: { run: { font: 'Book Antiqua', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Book Antiqua' }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, font: 'Book Antiqua' }, paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Book Antiqua' }, paragraph: { spacing: { before: 140, after: 60 }, outlineLevel: 2 } },
    ],
  };
}
function clauseTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        new TableCell({ children: [p('Requirement Focus', { run: { bold: true } })] }),
        new TableCell({ children: [p('ATT Response', { run: { bold: true } })] }),
      ]}),
      ...rows.map(r => new TableRow({ children: [new TableCell({ children: [p(r[0])] }), new TableCell({ children: [p(r[1])] })] }))
    ]
  });
}

function technicalProposalDoc() {
  const children = [
    ...cover('06 Technical Proposal', 'Section 06 – Technical Proposal'),
    h1('1. Executive Summary'),
    p('ATT Infosoft proposes a refreshed ATT-SCALA Integrated Information Display System for Changi Airport Terminal 3 that is purpose-built for 24x7 airport operations, integrates tightly with CAG’s existing digital and network estate, and is engineered to meet the tender’s key design priorities of resilience, maintainability, cybersecurity, operational visibility and future growth.'),
    p('The proposed solution is based on a modular, multi-tier, no-single-point-of-failure production architecture with a hot-standby server topology, segregated network zones, secure interfaces to FCS, Master Clock and NCLFI over LAN@Changi, and stand-alone operating capability for CATS and SCDS at each check-in island. The design supports current demand at 90 MPPA and provides a governed expansion path to 140 MPPA without further IIDS application software or product development licensing cost, other than additional hardware and operating systems where required.'),
    bullet('24x7 continuous service with hot-standby production architecture and automatic failover logic.'),
    bullet('Dedicated support for flight and non-flight information, multilingual Unicode displays, PA-GMID integration, health monitoring and proactive content snapshot capability.'),
    bullet('Production environment designed without single point of failure; UAT environment provided for controlled testing, training and release readiness.'),
    bullet('Security-by-design aligned to ISO/IEC 27001 operating principles, OWASP good practice, CAG cybersecurity controls, VAPT readiness, central log forwarding and privileged access governance.'),
    bullet('Scalable ATT-SCALA platform with modular licensing posture suitable for long-term airport growth and staged device expansion.'),

    h1('2. Functional Overview'),
    h2('2.1 Proposed Solution Overview'),
    p('The T3 IIDS Refresh will deliver an integrated operational display platform that acquires, validates, distributes and presents airport information to passengers and airport operators in real time. The solution combines ATT implementation capability with the proven Scala digital signage and information display stack, configured specifically for T3’s operational environment.'),
    bullet('ATT-SCALA Content Management and publishing services for central administration, scheduling and governance.'),
    bullet('FIDS application services for operational flight information processing, display logic and rules-based content distribution.'),
    bullet('TIPDS, CATS and SCDS capabilities integrated with the central IIDS while preserving stand-alone continuity for check-in island operations during network or server disruption.'),
    bullet('Monitoring, diagnostics, alerting and operational support modules for applications, endpoints, media players and network-connected devices.'),
    bullet('Administrative toolsets for display layout design, content updates, housekeeping, audit review and system support.'),

    h2('2.2 Strategy and Approach to Implement and Maintain the System'),
    p('ATT will adopt a controlled hybrid delivery method that combines structured systems engineering, airport-grade integration discipline and incremental configuration/testing cycles. This approach is designed to reduce cutover risk while maintaining strong traceability to tender requirements and operational acceptance criteria.'),
    bullet('Phase 1 – Mobilisation and detailed requirement confirmation, including interface workshops, site surveys, rack/power/network confirmation and security planning.'),
    bullet('Phase 2 – Solution design, configuration baseline, hardware/software staging, interface design packs and cybersecurity documentation.'),
    bullet('Phase 3 – Build, integration and factory testing of application, infrastructure, monitoring and logging components.'),
    bullet('Phase 4 – Site implementation, environment setup, interface connectivity tests, user administration setup and migration rehearsals.'),
    bullet('Phase 5 – UAT, operational readiness, cutover, hypercare and transition into warranty/maintenance support.'),
    p('Maintenance will be governed through preventive maintenance, patch and vulnerability management, performance/capacity review, log monitoring, configuration backup, incident/problem management and annual cybersecurity activities such as VAPT support and control validation.'),

    h2('2.3 Design Considerations for Resiliency, Scalability, Security and Network Connectivity'),
    clauseTable([
      ['Resiliency and availability', 'Production is designed around a highly redundant master and hot-standby server configuration, dual network paths to separately sited core switches/routers in the T3 North and South MCERs, component monitoring, backup jobs and defined recovery procedures to support the required 99.5% availability target.'],
      ['No single point of failure', 'Critical production application, database, storage, interface and network paths are separated or duplicated. UAT is intentionally simpler because the specification does not require HA for UAT.'],
      ['Scalability', 'The platform is sized for present 90 MPPA demand with growth allowance to 140 MPPA. Capacity expansion is achieved through additional compute, storage, endpoint and network resources without additional IIDS application software/product development licensing.'],
      ['Security posture', 'The solution uses a defence-in-depth model covering segmentation, hardened servers, RBAC, privileged access governance, endpoint security tooling, secure log forwarding, encryption and auditability.'],
      ['Network connectivity', 'All external integrations are designed over LAN@Changi with documented routing, protocols, firewall openings and VLAN/VRF segregation. Primary, secondary and drawbridge connectivity to FCS/DR are incorporated.']
    ]),

    h2('2.4 Migration Plan'),
    p('Migration will be executed using a low-risk, staged cutover model. The core objective is to refresh the platform without compromising airport operations or display continuity.'),
    bullet('Establish parallel build and validation environments before production cutover.'),
    bullet('Rehearse data, content, display mapping and interface migration in UAT/staging prior to live activation.'),
    bullet('Validate FCS, FCS DR, Master Clock, NCLFI and PA-GMID interfaces using agreed test scripts and rollback checkpoints.'),
    bullet('Cut over by logical service groups and display zones where practical, with hypercare monitoring during the stabilisation window.'),
    bullet('Retain rollback procedures, configuration backups and standby operational workarounds for each migration stage.'),

    h2('2.5 Operational Capacity Planning and Monitoring'),
    p('The solution includes continuous monitoring and operational analytics across the application, infrastructure and network layers. Monitoring data is used not only for fault notification but also for trend-based capacity planning and service improvement.'),
    bullet('Real-time monitoring of server health, process health, device reachability, storage consumption, replication status and service availability.'),
    bullet('Monitoring of display device status, media player status, network link health, bandwidth utilisation and alert/event trends.'),
    bullet('Health dashboards, alarms and reporting to support operations, maintenance and governance review.'),
    bullet('Capacity reviews based on transaction volume, content growth, device growth and seasonal traffic patterns, with expansion recommendations before thresholds are reached.'),

    h2('2.6 Cybersecurity Design and Implementation'),
    p('Cybersecurity is built into the design, implementation and operations model from the outset. ATT will prepare the security design package and security plan required for approval, implement layered controls, and support independent testing at agreed milestones.'),
    bullet('Security-by-design aligned to clause 5.1 expectations, including documented policies, architecture, data flows, access control and logging controls.'),
    bullet('Server and endpoint hardening, security patching, anti-malware/EDR readiness, IDS/IPS integration and privileged access control.'),
    bullet('Central log forwarding to NCLFI/SOC using secure and reliable transmission over LAN@Changi.'),
    bullet('Annual VAPT support and remediation governance throughout the system life cycle.'),
    bullet('Encryption in transit, controlled administration, audit trail protection and security incident response support.'),

    h2('2.7 Support Modules, Administration and Governance Capabilities'),
    bullet('System administration consoles for user, role, content, display, schedule and configuration management.'),
    bullet('Monitoring tools for applications, devices, network connectivity and service health with configurable alert thresholds.'),
    bullet('Operational governance through audit logs, configuration baselines, backup records, incident/problem/change workflows and reporting packs.'),
    bullet('Growth management through capacity dashboards, asset inventory and lifecycle/refresh planning for critical components.'),

    h1('3. Detailed Solutioning'),
    h2('3.1 Software Architecture and Design Philosophy'),
    p('The proposed software architecture is modular, service-oriented and multi-tier. Presentation, application, integration and data management responsibilities are separated to improve maintainability, scaling flexibility and security zoning. The design philosophy is to keep airport operations available even under degraded conditions while enabling controlled evolution of the platform over the contract life.'),
    bullet('Open and modular architecture to support staged enhancement, replacement of endpoint hardware and long-term integration flexibility.'),
    bullet('Portable deployment model suitable for modern Windows Server virtualised environments and standard enterprise networking.'),
    bullet('Mature ATT-SCALA product family with established airport information display pedigree and proven support model.'),

    h2('3.2 Functional Capabilities'),
    bullet('Real-time reception, validation and dissemination of flight and non-flight information.'),
    bullet('Multilingual Unicode rendering for English and foreign language display content determined by CAG.'),
    bullet('Display layout design, synchronised content distribution and dynamic content updates.'),
    bullet('Proactive snapshot and monitoring of current content/raw information shown on display devices.'),
    bullet('PA-GMID integration for operational message generation and corresponding audio output to PA zones.'),
    bullet('Stand-alone CATS and SCDS operations during disconnection scenarios, including adjacent-island backup logic.'),

    h2('3.3 Programming Languages, Tools and Operating Environment'),
    bullet('Programming and application stack: enterprise application services and Scala platform components configured for airport operations.'),
    bullet('Operating environment: modern Microsoft Windows Server virtual machines for core servers, with supported endpoint/workstation operating systems for operational clients and island workstations.'),
    bullet('Standards and interfaces: XML, TCP/IP, HTTPS/TLS, REST/HTTP where applicable, SNMP for monitoring, syslog-compatible forwarding, directory integration and secure administration tooling.'),
    bullet('Software lifecycle governance: source/version control, documented release management, controlled UAT promotion and patch governance.'),

    h2('3.4 Upgrade Path and Future Growth'),
    p('The system is proposed with a clear upgrade path that prioritises backward-compatible configuration change, modular service upgrade and controlled endpoint expansion. The platform can absorb future display and input device growth, higher transaction volumes and additional operational functions without architectural redesign, subject only to the incremental infrastructure required to sustain the target performance envelope.'),

    h1('4. Implementation Schedule'),
    p('A detailed project plan will be submitted separately under the project management section. For technical proposal purposes, ATT proposes the following high-level implementation schedule:'),
    bullet('Weeks 1–4: mobilisation, design workshops, surveys, interface/security planning and submission of design baselines.'),
    bullet('Weeks 5–10: staging of infrastructure, application build, interface configuration, monitoring/logging build and factory testing.'),
    bullet('Weeks 11–16: installation, environment configuration, connectivity tests, migration rehearsal and integrated system tests.'),
    bullet('Weeks 17–20: UAT, training support, operational readiness review, production cutover and hypercare.'),
    bullet('Post go-live: warranty support, preventive maintenance, optimisation and transition into long-term operations and maintenance service.'),

    h1('5. Compliance Highlights Against Key Tender Requirements'),
    clauseTable([
      ['24x7 operation with degraded mode', 'The design maintains essential services under failure conditions, including stand-alone CATS/SCDS operations and automatic interface reconnection logic.'],
      ['Interfaces to FCS, Master Clock, NCLFI and PA', 'The solution includes dedicated interface design, secure routing, logging and operational monitoring for each required external connection.'],
      ['90 MPPA to 140 MPPA growth', 'Capacity is sized with material headroom and modular expansion paths for compute, storage, endpoint devices and network resources.'],
      ['OEM-agnostic display hardware requirement', 'The proposed application architecture remains display-hardware agnostic subject to standard interface and certification constraints, with any dependency transparently declared at final design stage.'],
      ['Future expansion without additional application licensing', 'ATT will position the commercial and technical architecture so that future expansion does not require further IIDS application software/product development licensing, other than additional hardware and operating systems as needed.']
    ]),

    h1('6. Conclusion'),
    p('ATT’s proposal is designed to give CAG a resilient and operationally mature T3 IIDS platform that satisfies the current refresh scope while creating a sustainable base for future expansion. The recommended ATT-SCALA solution directly addresses the tender’s requirements for availability, integration, cybersecurity, maintainability and scalability, and it does so in a form that is practical for airport operations, support and lifecycle governance.'),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 720 }, children: [run('--- END OF THIS SECTION ---', { bold: true, italics: true })] })
  ];

  return new Document({
    styles: styles(),
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: header('06 TECHNICAL PROPOSAL') },
      footers: { default: footer('CAG T3 IIDS Refresh – 06 Technical Proposal') },
      children,
    }]
  });
}

function systemDesignDoc() {
  const children = [
    ...cover('07 System Design and Technical Architecture', 'Section 07 – System Design and Technical Architecture'),
    h1('1. Overview'),
    p('This document describes ATT Infosoft’s proposed system design and technical architecture for the Changi Airport Terminal 3 Integrated Information Display System Refresh. It has been structured to address the requirements of Schedule 5 and the technical clauses in 04C, with particular emphasis on architecture, redundancy, interfaces, security, capacity, maintainability and future expansion.'),

    h1('2. System Design and the Proposed Architecture'),
    h2('2.1 Design Principles'),
    bullet('Operational continuity first: no single point of failure in production and graceful degradation where total continuity is not practical.'),
    bullet('Modular multi-tier design: separation of presentation, application, integration, monitoring and data layers.'),
    bullet('Secure by design: defence-in-depth across network, server, application, identity, logging and operations.'),
    bullet('Airport-operational pragmatism: rapid supportability, clear observability and low-risk migration/cutover.'),
    bullet('Scalable and portable: designed for current requirements and future device/traffic growth without application relicensing.'),

    h2('2.2 Overall Architecture'),
    p('ATT proposes an on-premise, virtualised IIDS architecture deployed within the T3 environment and integrated to LAN@Changi for enterprise and operational interfaces. The production environment uses a highly redundant master and hot-standby configuration. UAT is provided as a separate non-HA environment for testing, training and release validation.'),
    new Paragraph({ spacing: { after: 120 }, children: [run('[Architecture diagram – to be inserted]', { italics: true, color: '7A7A7A' })] }),
    bullet('Production IIDS application services hosted on redundant virtual machines with hot-standby arrangement.'),
    bullet('Operational database hosted on dedicated server resources with backup, restore and integrity controls.'),
    bullet('Shared storage and backup repositories sized to maintain operational data, logs, snapshots and recovery sets.'),
    bullet('Separate UAT environment for configuration validation, interface rehearsal and test execution.'),
    bullet('Endpoint estate including media players, display devices, GMIDs, BMDs, island workstations and monitoring stations.'),

    h2('2.3 Modules, Sub-modules and Programs'),
    bullet('ATT-SCALA Content Management module for templates, layouts, playlists, content publication, scheduling and user administration.'),
    bullet('FIDS application services for flight data ingestion, rules processing, formatting, distribution and display control.'),
    bullet('TIPDS, CATS and SCDS modules for transfer/check-in/service counter use cases, including island stand-alone support.'),
    bullet('PA-GMID integration module for triggering zone audio announcements aligned to operational messages.'),
    bullet('Monitoring and diagnostics module for server, application, network and endpoint health checks and alerting.'),
    bullet('Audit, reporting and housekeeping modules for operational review, asset awareness and controlled administration.'),

    h2('2.4 System Functional Information'),
    p('The proposed IIDS supports real-time exchange of flight and non-flight information, synchronisation with the airport master time source, multilingual display rendering in Unicode, proactive content visibility, and system/device monitoring. The solution is intentionally designed so that the central platform handles enterprise orchestration while distributed field components preserve essential local operations during network or core service disruption.'),

    h1('3. Interfaces and Interconnections'),
    h2('3.1 Interface with Flight Central System (FCS)'),
    p('The T3 IIDS will interface with FCS and FCS DR using the tender-required XML-based exchange model. Primary and secondary connectivity paths are supplemented by the dedicated LAN@Changi drawbridge path to strengthen resilience and support continuity if normal routing paths are impaired.'),
    bullet('Automatic reconnection and session recovery in the event of temporary link or source interruption.'),
    bullet('No unnecessary message loss during communication disruption; queued processing and reconciliation logic applied where appropriate.'),
    bullet('Design includes redundancy in link pathing and monitoring of message flow/health status.'),

    h2('3.2 Interface with Master Clock'),
    p('The system receives time information from the Master Clock over LAN@Changi and synchronises its internal time services accordingly. Endpoint and display timing remain aligned to authoritative airport time, with local continuity logic if the upstream timing feed is temporarily unavailable.'),

    h2('3.3 Interface with NCLFI / SOC'),
    p('System, security and operational logs are forwarded securely via LAN@Changi to CAG’s central logging and security monitoring ecosystem. Log forwarding is designed to be reliable, tamper-aware and supportable, with message protection, buffering/retry logic and operational monitoring.'),

    h2('3.4 Network Architecture and Connectivity'),
    bullet('Connection to LAN@Changi via documented onboarding design, VRF/VLAN segregation and agreed firewall/route policies.'),
    bullet('Redundant server connectivity to separately sited T3 North and South MCER core switches/routers.'),
    bullet('Support for segmentation, multiple VLANs, secure east-west and north-south traffic control, and monitored uplinks.'),
    bullet('SNMP/telemetry-enabled network monitoring for device status, bandwidth, fault, performance and capacity management.'),

    h1('4. Redundancy, Availability and Resiliency'),
    h2('4.1 No Single Point of Failure Design'),
    p('The production design removes single points of failure across the critical service chain as far as practicable: application services, interface paths, network uplinks, server roles, storage protection and operational monitoring. This supports the tender requirement for production resilience and the contractual 99.5% availability target.'),
    bullet('Master and hot-standby server topology.'),
    bullet('Dual network attachment to separately sited core infrastructure.'),
    bullet('Protected database and backup architecture.'),
    bullet('Distributed endpoint design, including island-level continuity for CATS and SCDS.'),
    bullet('Alerting and health diagnostics to enable proactive intervention before service loss escalates.'),

    h2('4.2 Degraded and Stand-alone Operations'),
    p('When FCS communication is disrupted, the IIDS continues in degraded mode using the latest retained operational dataset and local control functions until communication is restored. For check-in operations, each island workstation includes mini-server style capability so that CATS can continue basic manual operations in stand-alone mode, and adjacent islands are arranged to back up one another.'),

    h2('4.3 Backup and Recovery Design'),
    bullet('Scheduled backup of application configuration, content repositories, databases, logs and critical system state.'),
    bullet('Documented restoration procedures with recovery sequence and validation checkpoints.'),
    bullet('Backup retention aligned to operational and cybersecurity requirements, including support for offline/archive handling where needed.'),
    bullet('Recovery design coordinated with resilience planning and incident response processes.'),

    h1('5. Security Architecture'),
    h2('5.1 Security-by-Design Framework'),
    p('ATT will deliver a security design package and operational security plan covering architecture, controls, deployment hardening, monitoring, incident handling and testing. Security controls are embedded across the full stack rather than appended as a standalone measure.'),
    bullet('Governance aligned to clause 5.1 expectations and ISO/IEC 27001-informed control practice.'),
    bullet('Documented security policies, standards, processes, parameter baselines and deployment controls.'),
    bullet('Security checkpoints across design, build, test, cutover and operational handover.'),

    h2('5.2 Authentication, Authorisation and Privileged Access'),
    bullet('Role-based access control with separation of administrative, support and operational roles.'),
    bullet('Integration with enterprise directory services where required, with controlled local fallback/service accounts only where justified.'),
    bullet('Privileged Access Management for critical administrative access, session accountability and controlled credential handling.'),
    bullet('Configurable session timeout, strong password/access policies and joiner/mover/leaver governance.'),

    h2('5.3 Endpoint, Network and Server Protection'),
    bullet('Operating system hardening, patching, anti-malware/EDR and restricted service exposure on servers and workstations.'),
    bullet('IDS/IPS deployment to detect and/or prevent malicious traffic against critical system zones.'),
    bullet('Firewall policy control, disabled unused ports/services, segmentation and administrative access restrictions.'),
    bullet('Security hardening for databases, system services, user profiles and management interfaces.'),

    h2('5.4 Logging, Monitoring, Audit and Cybersecurity Operations'),
    bullet('Forwarding of security/system logs to NCLFI/SOC for central monitoring and detection.'),
    bullet('Comprehensive audit trails for logon/logoff, administrative changes, security events, system maintenance and critical transactions.'),
    bullet('Monitoring and alarm generation for abnormal security events, endpoint alerts, service failures and suspicious activity.'),
    bullet('Support for annual VAPT, cybersecurity audit activities and incident response/recovery procedures.'),

    h2('5.5 Data Protection and Cryptography'),
    bullet('Encryption in transit using current secure protocols and approved cipher configurations.'),
    bullet('Controlled handling of credentials, certificates, keys and service secrets.'),
    bullet('Integrity controls for data changes, configuration modifications and audit log protection.'),

    h1('6. Detailed Design Considerations'),
    h2('6.1 Database Design'),
    p('The operational database stores flight, display, configuration, content reference, audit and system status data in a structure optimised for reliability, referential integrity and supportability. The schema is designed to support configurable and expandable relationships across operational entities and future extension without disruptive redesign.'),

    h2('6.2 Reporting, Monitoring and Administration Design'),
    p('Administrative and monitoring interfaces provide role-based visibility of system status, job execution, device health, network health, content publication state, audit events and housekeeping indicators. This supports both day-to-day operations and management-level governance reporting.'),

    h2('6.3 Hardware, Software and Network Connectivity for Each Environment'),
    clauseTable([
      ['Production environment', 'High-availability application tier, operational database, protected storage/backup, monitored network interfaces and secure connectivity to LAN@Changi, FCS/FCS DR, Master Clock, NCLFI and airport endpoints.'],
      ['UAT environment', 'Separate non-HA environment mirroring core functional components for configuration testing, interface rehearsal, user familiarisation and release validation.'],
      ['Field / endpoint environment', 'Media players, display devices, GMIDs, BMDs, monitoring stations and CATS workstations connected through controlled network segments with local diagnostics and operational continuity logic.']
    ]),

    h2('6.4 Facility-Related Design Considerations'),
    p('Where facility components are required to support system continuity, ATT will incorporate rack layout, power protection, UPS interfacing, environmental considerations and maintainable cabling/topology design consistent with the tender’s electrical and technical requirements.'),
    bullet('Rack and cabinet layouts designed for serviceability, cooling and orderly cable management.'),
    bullet('UPS and related power continuity provisions sized to protect critical IIDS components during transient power events and controlled shutdown scenarios.'),
    bullet('Structured cabling and fibre/copper interconnections documented for support, testing and future expansion.'),

    h1('7. Capacity, Performance and Expansion'),
    h2('7.1 Sizing Basis and Computations'),
    p('The sizing basis uses the tender’s current airport throughput of 90 MPPA and planned expansion to 140 MPPA. This represents approximately 55.6% growth in traffic volume. ATT therefore recommends infrastructure sizing with at least 60% effective headroom across the primary compute, storage, message processing and network design envelope, supplemented by the reserved capacity requirements on network equipment and a modular scale-out path.'),
    bullet('Compute sizing accounts for transaction bursts, concurrent display updates, interface polling/message handling, logging and monitoring overhead.'),
    bullet('Storage sizing accounts for operational databases, content repositories, snapshots, audit logs, retained troubleshooting data and backup sets.'),
    bullet('Network sizing accounts for endpoint telemetry, display/media updates, interface flows, security log forwarding and management traffic.'),

    h2('7.2 Performance and Reliability'),
    p('The proposed architecture is intended to sustain responsive operational updates, deterministic failover behaviour, strong observability and recoverability, and sufficient reserve capacity for peak conditions. The platform will be tuned and validated during factory tests, integrated site tests and UAT against agreed operating scenarios.'),

    h2('7.3 Scalability and Future Expansion'),
    bullet('Future expansion of display and input devices without additional IIDS application software/product development licensing, subject only to incremental infrastructure and operating system needs.'),
    bullet('Explicit identification of practical design limits at detailed design stage, together with vendor undertaking for non-degradation of the in-production system during expansion.'),
    bullet('Modular hardware refresh path for servers, storage, network and endpoint components.'),
    bullet('Display hardware agnosticism maintained as a design principle, with any interface or certification constraints transparently declared.'),

    h1('8. Benefits and Limitations'),
    h2('8.1 Benefits'),
    bullet('High operational resilience with strong continuity features for both central services and check-in island operations.'),
    bullet('Clear alignment to CAG’s interface, security, monitoring and growth requirements.'),
    bullet('Supportable architecture with good operational visibility, governance and lifecycle maintainability.'),
    bullet('Scalable ATT-SCALA foundation with airport-proven functional depth.'),
    h2('8.2 Considerations / Limitations'),
    bullet('Final low-level design values for CPU, memory, storage, switch porting, UPS runtime and interface throughput must be confirmed after detailed survey, final bill of quantities and acceptance of CAG’s onboarding constraints.'),
    bullet('Any third-party interface security control, onboarding prerequisite or network addressing constraint imposed by LAN@Changi or connected systems must be incorporated into the final implementation baseline.'),

    h1('9. Conclusion'),
    p('ATT’s proposed system design provides CAG with a technically coherent, secure and expansion-ready architecture for the T3 IIDS Refresh. It addresses the operational realities of an airport environment, the tender’s explicit requirement for resilience and observability, and the long-term need to scale the platform without repeated product redevelopment or disruptive redesign.'),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 720 }, children: [run('--- END OF THIS SECTION ---', { bold: true, italics: true })] })
  ];

  return new Document({
    styles: styles(),
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: header('07 SYSTEM DESIGN AND TECHNICAL ARCHITECTURE') },
      footers: { default: footer('CAG T3 IIDS Refresh – 07 System Design and Technical Architecture') },
      children,
    }]
  });
}

async function main() {
  const docs = [
    { name: '06 Technical Proposal.docx', doc: technicalProposalDoc() },
    { name: '07 System Design and Technical Architecture.docx', doc: systemDesignDoc() },
  ];
  for (const item of docs) {
    const buffer = await Packer.toBuffer(item.doc);
    fs.writeFileSync(path.join(outDir, item.name), buffer);
  }
  fs.writeFileSync(path.join(outDir, 'hermes-generation-notes.txt'), [
    'Hermes generation notes – CAG T3 IIDS Refresh',
    'Date: 2026-03-13',
    '',
    'Assumptions / gaps:',
    '1. This draft positions the solution as an on-premise ATT-SCALA deployment integrated with LAN@Changi, aligned to the tender clauses and prior ATT-SCALA reference structure.',
    '2. Exact low-level hardware sizing, UPS runtime, switch model selections, storage quantities and detailed BoQ references are not fixed here because the tender package available to Hermes did not include a final confirmed design baseline or pricing schedule values.',
    '3. The documents intentionally avoid copying prior submission wording. Past submission references were used only for document depth and sectioning cues.',
    '4. Architecture image asset was not provided, so the required placeholder was inserted for later replacement with a final approved diagram.',
    '5. Security controls are tailored to the clauses visible in 04C, but final named products for IDS/IPS, EDR and PAM should be aligned with ATT’s commercial/technical bid position before external submission.',
    '6. Schedule numbering in the brief referenced Sections 06 and 07; Appendix K text refers to items 7 and 8. The filenames requested by Atlas were used exactly.',
  ].join('\n'));
}

main().catch(err => { console.error(err); process.exit(1); });