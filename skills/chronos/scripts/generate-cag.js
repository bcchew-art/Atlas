const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, PageNumber,
  Footer, Header, ImageRun, TableOfContents, PageBreak, TabStopType, TabStopPosition,
} = require('docx');

const outDir = 'C:/Users/Admin/.openclaw/tender/CAG/tender submission';
const logoPath = 'C:/Users/Admin/.openclaw/workspace/skills/hermes/assets/att-logo.png';
fs.mkdirSync(outDir, { recursive: true });
const logo = fs.readFileSync(logoPath);

function p(text, opts = {}) {
  const runs = [];
  if (Array.isArray(text)) {
    text.forEach(t => runs.push(typeof t === 'string' ? new TextRun(t) : new TextRun(t)));
  } else {
    runs.push(new TextRun({ text, font: 'Book Antiqua', size: 24, ...opts.run }));
  }
  return new Paragraph({
    children: runs,
    spacing: opts.spacing || { after: 160 },
    heading: opts.heading,
    alignment: opts.alignment,
    style: opts.style,
    pageBreakBefore: opts.pageBreakBefore,
  });
}

function bodyText(text, extra={}) { return p(text, { ...extra, run: { font: 'Book Antiqua', size: 24, ...(extra.run||{}) } }); }
function h1(text) { return p(text, { heading: HeadingLevel.HEADING_1, run: { bold: true, size: 32, allCaps: false } }); }
function h2(text) { return p(text, { heading: HeadingLevel.HEADING_2, run: { bold: true, size: 28 } }); }
function h3(text) { return p(text, { heading: HeadingLevel.HEADING_3, run: { bold: true, size: 24 } }); }
function bullet(text, level=0) {
  return new Paragraph({ text, bullet: { level }, spacing: { after: 80 } });
}
function cell(text, widthPct, bold=false) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold, font: 'Book Antiqua', size: 22 })] })],
  });
}
function table(rows) {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function baseDoc(title, tenderTitle, sections) {
  return new Document({
    styles: {
      default: { document: { run: { font: 'Book Antiqua', size: 24 }, paragraph: { spacing: { after: 120 } } } },
      paragraphStyles: [
        { id: 'Normal', name: 'Normal', run: { font: 'Book Antiqua', size: 24 } },
      ],
    },
    numbering: { config: [] },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          size: { width: 11906, height: 16838 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [new TableRow({ children: [
                new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, borders: {}, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: title.toUpperCase(), bold: true, font: 'Book Antiqua', size: 24, allCaps: true })] })] }),
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders: {}, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ data: logo, transformation: { width: 90, height: 38 } })] })] }),
              ]})],
              borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({ border: { top: { color: '808080', space: 1, style: BorderStyle.SINGLE, size: 6 } }, spacing: { before: 120, after: 80 } }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Page ', font: 'Book Antiqua', size: 24 }), PageNumber.CURRENT, new TextRun({ text: ' of ', font: 'Book Antiqua', size: 24 }), PageNumber.TOTAL_PAGES] })
          ]
        })
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new ImageRun({ data: logo, transformation: { width: 220, height: 93 } })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: tenderTitle, bold: true, font: 'Book Antiqua', size: 32 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: title, bold: true, font: 'Book Antiqua', size: 28 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Version 1.0', font: 'Book Antiqua', size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: '13 March 2026', font: 'Book Antiqua', size: 24 })] }),
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Table of Contents', bold: true, font: 'Book Antiqua', size: 32 })] }),
        new TableOfContents(' ', { hyperlink: true, headingStyleRange: '1-3' }),
        new Paragraph({ children: [new PageBreak()] }),
        ...sections,
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: '--- END OF THIS SECTION ---', bold: true, italics: true, font: 'Book Antiqua', size: 24 })] }),
      ],
    }],
  });
}

const tenderTitle = 'CAG T3 IIDS Refresh';

const projectPlanSections = [
  h1('1. Project Overview'),
  bodyText('ATT Infosoft proposes a controlled hybrid delivery approach for the CAG T3 IIDS Refresh, combining stage-gated governance with iterative design-and-build cycles to accelerate delivery while preserving operational safety and traceability. The proposed plan covers the full project lifecycle required by Appendix K Clause 8.4 and 04A Clause 3.1, namely the 12-month implementation period, 12-month Defects Liability Period (DLP), and the optional operations and maintenance term.'),
  bullet('Client: Changi Airport Group (CAG).'),
  bullet('Project: Refresh of the Terminal 3 Integrated Information Display System (IIDS) with associated infrastructure, interfaces, testing, migration, warranty and maintainability provisions.'),
  bullet('Implementation duration: 12 months from award, in accordance with 04A Clause 3.1.3.'),
  bullet('DLP / System Warranty: 12 months from System Completion Date, in accordance with 04A Clause 3.1.4.'),
  bullet('Operations & Maintenance: 36 months option plus further 36 months option at CAG\'s election.'),
  h1('2. Delivery Methodology and Phase Plan'),
  bodyText('The delivery model is structured to ensure that design, installation, testing, migration and go-live activities are aligned to airport operational constraints, stakeholder approvals, and live-site safety requirements. Each phase has formal entry and exit criteria, milestone sign-off and documented deliverables.'),
  h2('2.1 Phase 1 - Project Kick-off and Requirements Validation (Month 1)'),
  bullet('Mobilise project governance, communication channels and project controls within two weeks after award.'),
  bullet('Validate business, functional, technical, cybersecurity, site and interface requirements against 04A and 04C.'),
  bullet('Confirm detailed project schedule, work breakdown structure, dependencies and reporting baseline.'),
  bullet('Deliverables: Project Management Plan, detailed schedule baseline, mobilisation plan, stakeholder register, RAID log, initial document register.'),
  h2('2.2 Phase 2 - System Design and Integration Planning (Months 1-3)'),
  bullet('Produce system requirements, system design and integration specifications.'),
  bullet('Conduct design reviews covering application, infrastructure, cybersecurity, interfaces, migration and test strategy.'),
  bullet('Plan coexistence with the live operating T3 environment and sequence works with CAG and incumbent/appointed parties.'),
  bullet('Deliverables: HLD/LLD package, interface design pack, environment plan, test planning inputs, migration strategy.'),
  h2('2.3 Phase 3 - Build, Procurement, Installation and Configuration (Months 3-7)'),
  bullet('Procure, stage, configure and install hardware/software, including production and UAT environments.'),
  bullet('Perform iterative development, configuration, internal verification, peer review and traceable unit testing.'),
  bullet('Coordinate site access, work permits, OEM inputs and third-party dependencies.'),
  bullet('Deliverables: configured application/infrastructure components, configuration baselines, unit test evidence, installation records.'),
  h2('2.4 Phase 4 - Integrated Testing (Months 7-9)'),
  bullet('Execute FAT/SAT as applicable, then System Integration Test (SIT) in accordance with the Project Test Plan and approved entry criteria.'),
  bullet('Track defects in a controlled log, apply severity-based resolution, and obtain evidence-based exit approval.'),
  bullet('Deliverables: approved test scripts, execution records, defect register, SIT report, readiness assessment for UAT.'),
  h2('2.5 Phase 5 - User Acceptance Test (Months 9-10)'),
  bullet('Conduct UAT at CAG premises, with daily progress reporting, issue triage and business-user support.'),
  bullet('Freeze production candidate baseline after satisfactory UAT closure and agreed residual issue treatment.'),
  bullet('Deliverables: UAT evidence, defect disposition log, release note, deployment readiness confirmation.'),
  h2('2.6 Phase 6 - Migration, Cutover and Production Go-Live (Months 10-12)'),
  bullet('Execute approved migration and cutover plan with rollback controls, go-live checklist and hypercare arrangements.'),
  bullet('Ensure continuity of airport display operations during transition from existing T3 IIDS to refreshed platform.'),
  bullet('Deliverables: migration rehearsal evidence, cutover checklist, go-live report, system completion dossier.'),
  h2('2.7 Phase 7 - Defects Liability Period / System Warranty (Months 13-24)'),
  bullet('Provide warranty support for 12 months after system completion.'),
  bullet('Rectify defects, monitor service performance, maintain knowledge base and prepare the maintenance transition pack.'),
  h2('2.8 Phase 8 - Optional Operations and Maintenance (Post-DLP)'),
  bullet('Provide comprehensive maintenance under SLA if options are exercised by CAG.'),
  bullet('Support preventive maintenance, patching, monitoring, incident response, reporting and lifecycle sustainment.'),
  h1('3. Implementation Schedule and Gantt Summary'),
  bodyText('The schedule below complies with Appendix K Clauses 8.5 to 8.8 and 04A Clause 3.1. Activities involving CAG participation are explicitly identified. The critical path runs through requirements validation, design approval, environment readiness, SIT completion, UAT sign-off, migration readiness and go-live approval.'),
  table([
    new TableRow({ children: [cell('Workstream / Phase', 28, true), cell('M1', 6, true), cell('M2', 6, true), cell('M3', 6, true), cell('M4', 6, true), cell('M5', 6, true), cell('M6', 6, true), cell('M7', 6, true), cell('M8', 6, true), cell('M9', 6, true), cell('M10', 6, true), cell('M11', 6, true), cell('M12', 6, true)] }),
    new TableRow({ children: [cell('Kick-off / requirements validation (ATT + CAG)', 28), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('System design / design reviews (ATT + CAG)', 28), cell('■■',6), cell('■■',6), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('Build / configuration / installation (ATT / OEM)', 28), cell('',6), cell('',6), cell('■■',6), cell('■■',6), cell('■■',6), cell('■■',6), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('Test preparation / environment readiness (ATT + CAG)', 28), cell('',6), cell('',6), cell('',6), cell('■',6), cell('■■',6), cell('■■',6), cell('■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('SIT (ATT-led, CAG witnessed)', 28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■■',6), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('UAT (CAG-led, ATT support)', 28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■■',6), cell('■',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('Migration rehearsal / cutover (ATT + CAG)', 28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■■',6), cell('■■',6), cell('',6)] }),
    new TableRow({ children: [cell('Go-live / hypercare / completion', 28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■',6), cell('■■',6)] }),
  ]),
  bodyText('Key milestones: Project Kick-off (M1), Design Sign-off (M3), Build Complete (M7), SIT Start (M7), UAT Start (M9), Go-Live (M12), DLP End (M24). Final graphical Gantt may be inserted by the project team if required for submission polish.'),
  h1('4. Quality Assurance Plan'),
  bullet('Requirements traceability from tender requirements through design, build, test and acceptance evidence.'),
  bullet('Mandatory peer review for design deliverables, source code, configuration baselines and test artefacts.'),
  bullet('Quality gates at design approval, build readiness, SIT entry/exit, UAT entry/exit and go-live readiness.'),
  bullet('Defect management using a controlled issue tracker with severity, owner, due date, workaround, root cause and closure evidence.'),
  bullet('Audit trail retention for approvals, test results, release versions, CRs, deployment records and sign-off.'),
  bullet('CAG-facing progress and quality reporting integrated into weekly / fortnightly reviews and monthly reports.'),
  h1('5. Change Management Plan'),
  bodyText('All change requests will be managed through a structured process consistent with 04A Clause 8.8. Changes may be raised by CAG, ATT, OEMs or other authorised stakeholders but are only implemented after impact assessment, approval and schedule/control updates.'),
  bullet('Initiation and logging of CR with business/technical rationale.'),
  bullet('Impact assessment covering scope, cost, schedule, operations, cybersecurity, testing and migration implications.'),
  bullet('Review by the Change Control Board comprising ATT Project Manager, Technical Lead, relevant CAG representatives and other specialists as needed.'),
  bullet('Approved CRs incorporated into baseline plans, release scope, traceability matrix and test coverage.'),
  bullet('Rejected or deferred CRs retained in the change log with decision rationale.'),
];

const governanceSections = [
  h1('1. Project Management Plan and Governance Framework'),
  bodyText('ATT Infosoft will govern the CAG T3 IIDS Refresh through a layered structure that provides strategic oversight, delivery control and operational coordination. The model is designed for an operationally critical airport system where schedule discipline, stakeholder visibility and controlled decision-making are essential.'),
  bullet('Executive Steering Committee: strategic oversight, escalation authority, commercial and policy decisions.'),
  bullet('Project Management Committee: day-to-day management, schedule control, dependency resolution, risk and issue governance.'),
  bullet('Service Delivery / Technical Working Team: design, implementation, test, migration and readiness execution.'),
  bullet('Project tools: Microsoft Project for scheduling, JIRA or equivalent for defects/issues/CRs, shared document repository for approvals and minutes.'),
  bullet('Cadence: weekly or fortnightly progress reviews with CAG, monthly consolidated progress reporting, ad hoc escalation meetings within 48 hours for critical issues.'),
  h2('1.1 Monitoring and Control'),
  bullet('Baseline schedule maintained and updated at least every two weeks as required by 04A Clause 8.4.6.'),
  bullet('Milestone-based reporting on scope, schedule, quality, risk, CRs, action items and decisions.'),
  bullet('Formal sign-off at each project milestone before downstream execution.'),
  h1('2. Relationship and Stakeholder Management'),
  bodyText('The project requires active management of CAG business stakeholders, airport operations, IT teams, cybersecurity stakeholders, OEMs and any appointed vendors or maintenance agents. ATT will maintain a stakeholder register, responsibility matrix and engagement calendar to ensure timely consultation and alignment.'),
  bullet('Primary relationship ownership sits with the ATT Project Manager as the single point of contact to CAG.'),
  bullet('Technical alignment is maintained through design and test workshops with CAG and relevant third parties.'),
  bullet('Supplier and sub-contractor governance is managed through service obligations, interface control, readiness checkpoints and consolidated reporting by ATT.'),
  h1('3. Knowledge Management'),
  bullet('Central controlled repository for plans, designs, minutes, decisions, test evidence, change records and operational procedures.'),
  bullet('Version control and document history maintained throughout the contract period.'),
  bullet('Structured knowledge transfer from project team to support and O&M personnel before go-live and before DLP/maintenance transitions.'),
  h1('4. Supplier Management'),
  bullet('ATT retains end-to-end accountability for all sub-contractors and OEM contributors.'),
  bullet('Interface points, delivery obligations, lead times and escalation paths are defined during mobilisation and reviewed during progress meetings.'),
  bullet('No direct fragmentation of accountability to CAG; ATT remains the prime coordinating party.'),
  h1('5. Project Communication Plan'),
  table([
    new TableRow({ children: [cell('Communication', 24, true), cell('Audience', 24, true), cell('Frequency', 14, true), cell('Owner', 16, true), cell('Format / Purpose', 22, true)] }),
    new TableRow({ children: [cell('Project status meeting',24), cell('CAG PM, ATT PM, core leads',24), cell('Weekly / fortnightly',14), cell('ATT PM',16), cell('Progress review, actions, blockers, decisions',22)] }),
    new TableRow({ children: [cell('Monthly consolidated report',24), cell('CAG PM / committees',24), cell('Monthly',14), cell('ATT PM',16), cell('Overall status, milestones, issues, CRs, risks',22)] }),
    new TableRow({ children: [cell('Technical review workshop',24), cell('Technical stakeholders / OEMs',24), cell('Bi-weekly or as needed',14), cell('Technical Lead',16), cell('Design, interface, environment, test readiness',22)] }),
    new TableRow({ children: [cell('Risk register update',24), cell('CAG PM and ATT leads',24), cell('Monthly / ad hoc',14), cell('ATT PM',16), cell('Risk review, treatment, escalation',22)] }),
    new TableRow({ children: [cell('Incident / critical issue alert',24), cell('CAG PM, sponsor, affected leads',24), cell('As needed',14), cell('ATT PM',16), cell('Time-sensitive incident escalation and containment',22)] }),
    new TableRow({ children: [cell('Change control review',24), cell('Authorised CAG and ATT approvers',24), cell('As needed',14), cell('ATT PM',16), cell('Impact assessment and approval of CRs',22)] }),
  ]),
  h1('6. Risk Management'),
  bodyText('Risk management is embedded across planning, design, site works, test, migration and early life support. Risks are identified through tender requirement analysis, design workshops, site assessments, dependency review and lessons learned from prior operationally critical implementations.'),
  table([
    new TableRow({ children: [cell('Risk ID',8,true), cell('Risk Description',28,true), cell('Probability',10,true), cell('Impact',10,true), cell('Rating',10,true), cell('Mitigation',24,true), cell('Owner',10,true)] }),
    new TableRow({ children: [cell('R001',8), cell('Requirements refinement or scope growth during design/build',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Strict CR control, baselined requirements, weekly clarification sessions',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R002',8), cell('Integration issues with airport systems, interfaces or third-party dependencies',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Early interface validation, mock integration, dedicated SIT defect window',24), cell('Tech Lead',10)] }),
    new TableRow({ children: [cell('R003',8), cell('Live operations constraints delay site access, installation or cutover',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Early work coordination, permit planning, night-shift / phased execution preparation',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R004',8), cell('Cybersecurity findings from VAPT or hardening reviews affect schedule',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Security-by-design reviews, pre-VAPT checks, remediation reserve',24), cell('Security Lead',10)] }),
    new TableRow({ children: [cell('R005',8), cell('UAT delays due to stakeholder availability or unresolved operational scenarios',28), cell('Medium',10), cell('Medium',10), cell('Medium',10), cell('Early UAT planning, scenario walkthroughs, daily triage and support',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R006',8), cell('Key personnel unavailability or turnover during critical phases',28), cell('Low',10), cell('High',10), cell('Medium',10), cell('Named deputies, knowledge base, overlap handover, approval-led replacement',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R007',8), cell('Migration or cutover defects disrupt continuity of passenger information display services',28), cell('Low',10), cell('High',10), cell('Medium',10), cell('Rehearsal, rollback plan, go-live checklist, hypercare coverage',24), cell('Migration Lead',10)] }),
  ]),
  h1('7. Contingency Plan and Business Continuity'),
  bullet('Schedule slippage trigger: critical path variance exceeding two weeks, or repeated milestone risk warnings.'),
  bullet('Immediate response: escalation meeting within 48 hours, root-cause review, recovery plan and revised baseline within five working days.'),
  bullet('Recovery options: targeted resource augmentation, resequencing of non-critical activities, extended working windows subject to CAG approval, intensified defect triage.'),
  bullet('Corporate BCP applicability: ATT can continue PM, engineering coordination, documentation control and service desk operations through remote-capable arrangements during pandemic or site disruption scenarios, while preserving secure communications and named points of contact.'),
  h1('8. Project Exit Plan'),
  bullet('Prepare a controlled handover plan for transfer to CAG and/or oncoming vendor at contract completion or transition event.'),
  bullet('Provide as-built technical documents, administration guides, operations procedures, configurations, release history, support records and open-item register.'),
  bullet('Conduct walkthrough sessions and knowledge transfer for support and technical teams.'),
  bullet('Support orderly transition with agreed overlap, access review, data and documentation handover, and closure of project governance artefacts.'),
  h1('9. Project Constraints and Limitations'),
  bullet('Delivery is dependent on timely CAG reviews, approvals, site access, permit processing and stakeholder availability.'),
  bullet('Airport operational constraints may limit implementation windows and require phased or off-peak execution.'),
  bullet('Third-party system readiness and incumbent coordination may affect interface and migration sequencing.'),
  bullet('Any named personnel and sub-contractor arrangements remain subject to CAG acceptance and final commercial confirmation.'),
];

const teamSections = [
  h1('1. Project Organisation Structure'),
  bodyText('The proposed organisation is structured to support both the implementation phase and the downstream DLP / O&M obligations. It aligns to Appendix K Clause 10.1 and the team structure expectations in 04A Clause 11.2.12.'),
  h2('1.1 Text Organisation Chart'),
  bodyText('Executive Steering Committee\n- CAG Executive Sponsor\n- ATT Executive Sponsor\n\nProject Management Committee\n- CAG Project Manager\n- ATT Project Manager\n\nDelivery and Assurance Team\n- Solution Architect\n- Technical Lead\n- Application Integration Lead\n- Infrastructure / Network & System Engineers\n- Cyber Security Consultant\n- QA / Test Lead\n- Migration & Deployment Lead\n- Documentation / Training Support\n\nService Support Structure (DLP / O&M)\n- Service Delivery Manager\n- L2 Technical Support Engineers\n- System / Infrastructure Support\n- Security / Patch Support\n- On-call escalation support'),
  h1('2. Proposed Members of Executive Steering, Project Management and Service Delivery Committees'),
  bodyText('Named personnel will be confirmed at award and submitted for CAG acceptance. For tender submission purposes, ATT presents the required role structure and responsibilities, with all named assignments marked TBC pending final deployment confirmation.'),
  table([
    new TableRow({ children: [cell('Committee / Function',22,true), cell('Role',24,true), cell('Name',18,true), cell('Employment',16,true), cell('% Time',10,true), cell('Remarks',10,true)] }),
    new TableRow({ children: [cell('Executive Steering',22), cell('Executive Sponsor',24), cell('TBC at award',18), cell('Permanent',16), cell('10%',10), cell('Governance / escalation',10)] }),
    new TableRow({ children: [cell('Project Management',22), cell('Project Manager',24), cell('TBC at award',18), cell('Permanent',16), cell('100%',10), cell('Full-time as required by 04A 12.2.1',10)] }),
    new TableRow({ children: [cell('Service Delivery',22), cell('Solution Architect',24), cell('TBC at award',18), cell('Permanent',16), cell('100%',10), cell('Design authority',10)] }),
    new TableRow({ children: [cell('Service Delivery',22), cell('Technical Lead',24), cell('TBC at award',18), cell('Permanent',16), cell('100%',10), cell('Implementation lead',10)] }),
    new TableRow({ children: [cell('Service Delivery',22), cell('Application Integration Lead',24), cell('TBC at award',18), cell('Permanent',16), cell('100%',10), cell('Interfaces / integration',10)] }),
    new TableRow({ children: [cell('Service Delivery',22), cell('QA / Test Lead',24), cell('TBC at award',18), cell('Permanent',16), cell('100%',10), cell('SIT / UAT support',10)] }),
    new TableRow({ children: [cell('Service Delivery',22), cell('Cyber Security Consultant',24), cell('TBC at award',18), cell('Permanent or specialist contract',16), cell('50%',10), cell('Security assurance / VAPT coordination',10)] }),
    new TableRow({ children: [cell('Service Delivery',22), cell('Network and System Engineer(s)',24), cell('TBC at award',18), cell('Permanent',16), cell('100%',10), cell('Infrastructure build / site works',10)] }),
    new TableRow({ children: [cell('Support / O&M',22), cell('Service Delivery Manager / Support Lead',24), cell('TBC at award',18), cell('Permanent',16), cell('100% post go-live',10), cell('DLP and O&M governance',10)] }),
  ]),
  h1('3. Roles and Responsibilities'),
  table([
    new TableRow({ children: [cell('Role',18,true), cell('Responsibility',46,true), cell('Full / Part Time',18,true), cell('% Time',18,true)] }),
    new TableRow({ children: [cell('Executive Sponsor',18), cell('Contract accountability, executive escalation, strategic governance',46), cell('Part-time',18), cell('10%',18)] }),
    new TableRow({ children: [cell('Project Manager',18), cell('Single point of contact to CAG; overall management, schedule, risk, issue, reporting, change and resource control',46), cell('Full-time',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Solution Architect',18), cell('Architecture, design governance, standards compliance, design sign-off support',46), cell('Full-time',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Technical Lead',18), cell('Technical direction, implementation oversight, integration coordination, defect resolution leadership',46), cell('Full-time',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Application Integration Lead',18), cell('Interface design, integration planning, dependency management and SIT support',46), cell('Full-time',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Network / System Engineer',18), cell('Infrastructure setup, installation, configuration, deployment and support readiness',46), cell('Full-time',18), cell('100%',18)] }),
    new TableRow({ children: [cell('QA / Test Lead',18), cell('Test planning, SIT execution control, UAT support, defect governance and evidence management',46), cell('Full-time',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Cyber Security Consultant',18), cell('Security review, hardening assurance, VAPT coordination, remediation oversight',46), cell('Part-time',18), cell('50%',18)] }),
    new TableRow({ children: [cell('Migration / Deployment Lead',18), cell('Migration rehearsals, cutover planning, rollback, go-live readiness and hypercare coordination',46), cell('Full-time during migration window',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Service Delivery Manager',18), cell('DLP / O&M service reporting, SLA governance, incident and maintenance oversight',46), cell('Full-time post go-live',18), cell('100%',18)] }),
    new TableRow({ children: [cell('Training / Documentation Support',18), cell('Knowledge transfer materials, user/admin guides, support handover documentation',46), cell('Part-time',18), cell('50%',18)] }),
  ]),
  h1('4. Team Sizing Methodology and Justification'),
  bodyText('ATT sized the proposed team using a delivery-capacity model that considers project duration, operational criticality, number of workstreams, airport site execution constraints, integration complexity, cybersecurity obligations, and the need to run concurrent design, build, test and migration activities. The team mix deliberately combines project management, architecture, implementation, testing, security and service readiness capability to avoid single-threaded dependencies.'),
  bullet('12-month implementation period requires overlap between design, build, site preparation, testing and migration planning.'),
  bullet('Operationally critical airport environment requires stronger governance, contingency planning and stakeholder management than a conventional enterprise application deployment.'),
  bullet('Interfaces, infrastructure and cybersecurity scope justify dedicated architecture, technical and security roles rather than a purely developer-centric team.'),
  bullet('UAT, migration and go-live stages require intensified QA, deployment and business coordination capacity.'),
  bullet('DLP / O&M obligations require a support structure distinct from the implementation core team.'),
  h1('5. Management Plan for Key Project Team Member Changes'),
  bodyText('ATT will manage key personnel continuity in accordance with 04A Clauses 11.2.4 to 11.2.10. Continuity of staffing is treated as a governance requirement, not merely an HR matter.'),
  bullet('Named key personnel will be retained throughout the contract unless replacement is unavoidable and accepted by CAG.'),
  bullet('Any replacement will be proposed with equivalent or better qualifications and relevant experience, together with documented handover and overlap.'),
  bullet('Replacement timing will meet the required fourteen (14) working day replacement window and handover expectation stated in 04A Clause 11.2.10, while ATT will also provide advance written notice where practicable.'),
  bullet('Outgoing personnel access to environments, documentation and privileged accounts will be reviewed and removed promptly.'),
  bullet('Project knowledge is preserved through controlled documentation, deputy coverage and cross-training for critical roles.'),
  h1('6. Schedule 6 Curriculum Vitae Format'),
  bodyText('Actual CV data was not provided to Chronos for this drafting run. The following prescribed format is included as submission-ready placeholders to be completed with confirmed personnel particulars before final tender issue. No experience has been fabricated.'),
  h2('6.1 CV Template - To Be Completed for Each Team Member'),
  bodyText('General Information\nName: [TO BE COMPLETED]    Age: [TO BE COMPLETED]\nCurrent Position: [TO BE COMPLETED]    Nationality: [TO BE COMPLETED]\nRole & Responsibility for this engagement: [TO BE COMPLETED]\n\nEducation Qualification (Highest Level)\nName of Institution / Year: [TO BE COMPLETED]\n\nName of Professional Qualification & Award\nIT professional certification / Project Management / QA / CMMI related & year obtained: [TO BE COMPLETED]\n\nWorking Experience\nYears of IT working experience: [TO BE COMPLETED]\nYears of working in Singapore (Applicable for non-Singaporeans only): [TO BE COMPLETED]\n\nArea of specialisation (Please list & describe)\n[TO BE COMPLETED]\n\nTechnology Expertise (Please list & describe)\n[TO BE COMPLETED]\n\nHighlights of Experience and Track Record\nPlease provide references & describe responsibilities: [TO BE COMPLETED]'),
  h2('6.2 Minimum CV Pack Required'),
  bullet('Project Manager'),
  bullet('Solution Architect'),
  bullet('Technical Lead'),
  bullet('Application Integration Lead'),
  bullet('QA / Test Lead'),
  bullet('Cyber Security Consultant'),
  bullet('Network / System Engineer or equivalent implementation lead(s)'),
  bullet('Service Delivery Manager / Support Lead for DLP and O&M'),
];

async function saveDoc(filename, title, sections) {
  const doc = baseDoc(title, tenderTitle, sections);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, filename), buffer);
}

(async () => {
  await saveDoc('08 Project Plan - CAG T3 IIDS Refresh.docx', '08 Project Plan', projectPlanSections);
  await saveDoc('09 Project Governance and Management - CAG T3 IIDS Refresh.docx', '09 Project Governance and Management', governanceSections);
  await saveDoc('10 Team Organisation and Competencies - CAG T3 IIDS Refresh.docx', '10 Team Organisation and Competencies', teamSections);
  fs.writeFileSync(path.join(outDir, 'Chronos Notes - Assumptions and Gaps.txt'), [
    'Chronos drafting notes for CAG T3 IIDS Refresh',
    '',
    '1. Appendix K Sections 9 and 10 were drafted in full, and Section 8 project-plan material was also prepared because the task explicitly requested implementation schedule / project plan coverage.',
    '2. No confirmed named ATT personnel or real CV content was provided. All team-member names therefore remain TBC and Schedule 6 CVs are included as prescribed-format placeholders only.',
    '3. Past submission references were not reused for content. They were treated as format cues only, consistent with instructions.',
    '4. The schedule is a tender-stage baseline aligned to the 12-month implementation / 12-month DLP requirements in 04A. It should be refined with actual award date, resource loading and dependency confirmations before final submission.',
    '5. Final polish opportunity: insert a richer graphical Gantt and any approved organisation chart artwork if Gabriel wants a more visual submission pack.',
  ].join('\r\n'));
  console.log('Generated Chronos documents in', outDir);
})();
