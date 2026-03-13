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
const tenderTitle = 'CAG T3 IIDS Refresh';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({ text, font: 'Book Antiqua', size: 24, ...opts });
}
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
function bodyText(text, extra = {}) {
  return p(text, { ...extra, run: { font: 'Book Antiqua', size: 24, ...(extra.run || {}) } });
}
function h1(text) {
  return p(text, { heading: HeadingLevel.HEADING_1, run: { bold: true, size: 32 }, spacing: { before: 300, after: 160 } });
}
function h2(text) {
  return p(text, { heading: HeadingLevel.HEADING_2, run: { bold: true, size: 28 }, spacing: { before: 200, after: 100 } });
}
function h3(text) {
  return p(text, { heading: HeadingLevel.HEADING_3, run: { bold: true, size: 24 }, spacing: { before: 160, after: 80 } });
}
function bullet(text, level = 0) {
  return new Paragraph({ text, bullet: { level }, spacing: { after: 80 } });
}
function cell(text, widthPct, bold = false) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold, font: 'Book Antiqua', size: 22 })] })],
  });
}
function tbl(rows) {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}
function endSection() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 720, after: 120 },
    children: [run('--- END OF THIS SECTION ---', { bold: true, italics: true })]
  });
}

function baseDoc(title, sections) {
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
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
              }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { color: '808080', space: 1, style: BorderStyle.SINGLE, size: 6 } },
              spacing: { before: 120, after: 80 },
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'Page ', font: 'Book Antiqua', size: 24 }),
                PageNumber.CURRENT,
                new TextRun({ text: ' of ', font: 'Book Antiqua', size: 24 }),
                PageNumber.TOTAL_PAGES
              ]
            })
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
        endSection(),
      ],
    }],
  });
}

// ============================================================
// DEFAULT TABLES
// Used when JSON content references table type markers.
// ============================================================
function defaultGanttTable() {
  return tbl([
    new TableRow({ children: [cell('Workstream / Phase', 28, true), cell('M1',6,true), cell('M2',6,true), cell('M3',6,true), cell('M4',6,true), cell('M5',6,true), cell('M6',6,true), cell('M7',6,true), cell('M8',6,true), cell('M9',6,true), cell('M10',6,true), cell('M11',6,true), cell('M12',6,true)] }),
    new TableRow({ children: [cell('Kick-off / requirements validation (ATT + CAG)',28), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('System design / design reviews (ATT + CAG)',28), cell('■■',6), cell('■■',6), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('Build / configuration / installation (ATT / OEM)',28), cell('',6), cell('',6), cell('■■',6), cell('■■',6), cell('■■',6), cell('■■',6), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('Test preparation / environment readiness (ATT + CAG)',28), cell('',6), cell('',6), cell('',6), cell('■',6), cell('■■',6), cell('■■',6), cell('■',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('SIT (ATT-led, CAG witnessed)',28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■■',6), cell('■■',6), cell('',6), cell('',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('UAT (CAG-led, ATT support)',28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■■',6), cell('■',6), cell('',6), cell('',6)] }),
    new TableRow({ children: [cell('Migration rehearsal / cutover (ATT + CAG)',28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■■',6), cell('■■',6), cell('',6)] }),
    new TableRow({ children: [cell('Go-live / hypercare / completion',28), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('',6), cell('■',6), cell('■■',6)] }),
  ]);
}
function defaultCommunicationTable() {
  return tbl([
    new TableRow({ children: [cell('Communication',24,true), cell('Audience',24,true), cell('Frequency',14,true), cell('Owner',16,true), cell('Format / Purpose',22,true)] }),
    new TableRow({ children: [cell('Project status meeting',24), cell('CAG PM, ATT PM, core leads',24), cell('Weekly / fortnightly',14), cell('ATT PM',16), cell('Progress review, actions, blockers, decisions',22)] }),
    new TableRow({ children: [cell('Monthly consolidated report',24), cell('CAG PM / committees',24), cell('Monthly',14), cell('ATT PM',16), cell('Overall status, milestones, issues, CRs, risks',22)] }),
    new TableRow({ children: [cell('Technical review workshop',24), cell('Technical stakeholders / OEMs',24), cell('Bi-weekly or as needed',14), cell('Technical Lead',16), cell('Design, interface, environment, test readiness',22)] }),
    new TableRow({ children: [cell('Risk register update',24), cell('CAG PM and ATT leads',24), cell('Monthly / ad hoc',14), cell('ATT PM',16), cell('Risk review, treatment, escalation',22)] }),
    new TableRow({ children: [cell('Incident / critical issue alert',24), cell('CAG PM, sponsor, affected leads',24), cell('As needed',14), cell('ATT PM',16), cell('Time-sensitive incident escalation and containment',22)] }),
    new TableRow({ children: [cell('Change control review',24), cell('Authorised CAG and ATT approvers',24), cell('As needed',14), cell('ATT PM',16), cell('Impact assessment and approval of CRs',22)] }),
  ]);
}
function defaultRiskRegisterTable() {
  return tbl([
    new TableRow({ children: [cell('Risk ID',8,true), cell('Risk Description',28,true), cell('Probability',10,true), cell('Impact',10,true), cell('Rating',10,true), cell('Mitigation',24,true), cell('Owner',10,true)] }),
    new TableRow({ children: [cell('R001',8), cell('Requirements refinement or scope growth during design/build',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Strict CR control, baselined requirements, weekly clarification sessions',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R002',8), cell('Integration issues with airport systems, interfaces or third-party dependencies',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Early interface validation, mock integration, dedicated SIT defect window',24), cell('Tech Lead',10)] }),
    new TableRow({ children: [cell('R003',8), cell('Live operations constraints delay site access, installation or cutover',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Early work coordination, permit planning, night-shift / phased execution preparation',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R004',8), cell('Cybersecurity findings from VAPT or hardening reviews affect schedule',28), cell('Medium',10), cell('High',10), cell('High',10), cell('Security-by-design reviews, pre-VAPT checks, remediation reserve',24), cell('Security Lead',10)] }),
    new TableRow({ children: [cell('R005',8), cell('UAT delays due to stakeholder availability or unresolved operational scenarios',28), cell('Medium',10), cell('Medium',10), cell('Medium',10), cell('Early UAT planning, scenario walkthroughs, daily triage and support',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R006',8), cell('Key personnel unavailability or turnover during critical phases',28), cell('Low',10), cell('High',10), cell('Medium',10), cell('Named deputies, knowledge base, overlap handover, approval-led replacement',24), cell('ATT PM',10)] }),
    new TableRow({ children: [cell('R007',8), cell('Migration or cutover defects disrupt continuity of passenger information display services',28), cell('Low',10), cell('High',10), cell('Medium',10), cell('Rehearsal, rollback plan, go-live checklist, hypercare coverage',24), cell('Migration Lead',10)] }),
  ]);
}
function defaultTeamMembersTable() {
  return tbl([
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
  ]);
}
function defaultRolesTable() {
  return tbl([
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
  ]);
}

// ============================================================
// CONTENT RENDERER
// Maps JSON items from section-content.json to docx elements.
//
// Supported types:
//   h1, h2, h3             — headings
//   p                      — body paragraph
//   bullet                 — bullet point (optional level 0-2)
//   placeholder            — italic grey note
//   table_gantt            — 12-month Gantt schedule table
//   table_communication    — communication plan matrix
//   table_risk_register    — risk register table
//   table_team_members     — proposed team members table
//   table_roles            — roles and responsibilities table
// ============================================================
function renderContent(items) {
  return items.flatMap(item => {
    switch (item.type) {
      case 'h1': return h1(item.text);
      case 'h2': return h2(item.text);
      case 'h3': return h3(item.text);
      case 'p': return bodyText(item.text);
      case 'bullet': return bullet(item.text, item.level || 0);
      case 'placeholder':
        return new Paragraph({ spacing: { after: 120 }, children: [run(item.text || '[To be inserted]', { italics: true, color: '7A7A7A' })] });
      case 'table_gantt': return defaultGanttTable();
      case 'table_communication': return defaultCommunicationTable();
      case 'table_risk_register': return defaultRiskRegisterTable();
      case 'table_team_members': return defaultTeamMembersTable();
      case 'table_roles': return defaultRolesTable();
      default:
        return bodyText(item.text || '');
    }
  });
}

// ============================================================
// LOAD section-content.json — REQUIRED
// Chronos must write this file before running generate-cag.js.
// See chronos/SKILL.md → Step 3: Content Generation.
// ============================================================
function loadContent() {
  const contentPath = path.join(__dirname, 'section-content.json');
  if (!fs.existsSync(contentPath)) {
    throw new Error(
      'MISSING: scripts/section-content.json\n' +
      'Chronos must write this file with substantive section content before running generate-cag.js.\n' +
      'See chronos/SKILL.md → Step 3: Content Generation for the required JSON format and word count targets.'
    );
  }
  let content;
  try {
    content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  } catch (e) {
    throw new Error('section-content.json is not valid JSON. Fix the syntax and rerun.\nError: ' + e.message);
  }
  if (!content.doc08 || !content.doc09 || !content.doc10) {
    throw new Error('section-content.json must have "doc08", "doc09", and "doc10" arrays. See SKILL.md.');
  }
  return content;
}

// ============================================================
// MAIN
// ============================================================
async function saveDoc(filename, title, sections) {
  const doc = baseDoc(title, sections);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log('Generated: ' + filename + ' (' + buffer.length + ' bytes)');
}

(async () => {
  const content = loadContent();
  await saveDoc('08 Project Plan - CAG T3 IIDS Refresh.docx', '08 Project Plan', renderContent(content.doc08));
  await saveDoc('09 Project Governance and Management - CAG T3 IIDS Refresh.docx', '09 Project Governance and Management', renderContent(content.doc09));
  await saveDoc('10 Team Organisation and Competencies - CAG T3 IIDS Refresh.docx', '10 Team Organisation and Competencies', renderContent(content.doc10));
  if (content.notes) {
    fs.writeFileSync(path.join(outDir, 'Chronos Notes - Assumptions and Gaps.txt'), content.notes);
    console.log('Written: Chronos Notes - Assumptions and Gaps.txt');
  }
  console.log('Chronos generation complete. Output: ' + outDir);
})().catch(e => {
  console.error('\n[ERROR] ' + e.message);
  process.exit(1);
});
