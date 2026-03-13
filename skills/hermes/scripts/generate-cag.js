const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, ImageRun,
  AlignmentType, HeadingLevel, TableOfContents, PageBreak, PageNumber,
  TabStopType, TabStopPosition, BorderStyle, WidthType, Table, TableRow, TableCell
} = require('docx');

const workspace = 'C:/Users/Admin/.openclaw/workspace';
const tenderRoot = 'C:/Users/Admin/.openclaw/tender/CAG';
const outDir = path.join(tenderRoot, 'tender submission');
const logoPath = path.join(workspace, 'skills', 'hermes', 'assets', 'att-logo.png');
const logoData = fs.readFileSync(logoPath);
fs.mkdirSync(outDir, { recursive: true });

const tenderTitle = '2025/00518 Changi Airport Group (S) Pte Ltd';
const projectTitle = 'Implementation and Maintenance of T3 Integrated Information Display System (IIDS) Refresh';
const versionText = 'Version 1.0  |  2026-03-13';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({ text, font: 'Book Antiqua', size: 24, ...opts });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 160 }, children: [run(text, opts.run || {})], ...opts });
}
function bullet(text, level = 0) {
  return new Paragraph({ text, bullet: { level }, spacing: { after: 80 } });
}
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, style: 'Heading1', spacing: { before: 300, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, style: 'Heading2', spacing: { before: 200, after: 100 } });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, style: 'Heading3', spacing: { before: 160, after: 80 } });
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
  return new Header({
    children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        run(title, { bold: true, allCaps: true }),
        new TextRun('\t'),
        new ImageRun({ data: logoData, type: 'png', transformation: { width: 88, height: 47 } })
      ]
    })]
  });
}
function footer(leftText) {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        run(leftText),
        new TextRun('\t'),
        new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], font: 'Book Antiqua', size: 24 })
      ]
    })]
  });
}
function styles() {
  return {
    default: { document: { run: { font: 'Book Antiqua', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Book Antiqua' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Book Antiqua' },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Book Antiqua' },
        paragraph: { spacing: { before: 140, after: 60 }, outlineLevel: 2 } },
    ],
  };
}
function clauseTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        new TableCell({ children: [p('Requirement / Focus Area', { run: { bold: true } })] }),
        new TableCell({ children: [p('ATT Response', { run: { bold: true } })] }),
      ]}),
      ...rows.map(r => new TableRow({ children: [
        new TableCell({ children: [p(r[0])] }),
        new TableCell({ children: [p(r[1])] })
      ]}))
    ]
  });
}
function endSection() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 720 },
    children: [run('--- END OF THIS SECTION ---', { bold: true, italics: true })]
  });
}

// ============================================================
// DEFAULT TABLES (used by table markers in section-content.json)
// Override with "rows" array in the JSON item to customise.
// ============================================================
const defaultDesignConsiderations = [
  ['Resiliency and availability', 'Production is designed around a highly redundant master and hot-standby server configuration, dual network paths to separately sited core switches/routers in the T3 North and South MCERs, component monitoring, backup jobs and defined recovery procedures to support the required 99.5% availability target.'],
  ['No single point of failure', 'Critical production application, database, storage, interface and network paths are separated or duplicated. UAT is intentionally simpler because the specification does not require HA for UAT.'],
  ['Scalability', 'The platform is sized for present 90 MPPA demand with growth allowance to 140 MPPA. Capacity expansion is achieved through additional compute, storage, endpoint and network resources without additional IIDS application software/product development licensing.'],
  ['Security posture', 'The solution uses a defence-in-depth model covering segmentation, hardened servers, RBAC, privileged access governance, endpoint security tooling, secure log forwarding, encryption and auditability.'],
  ['Network connectivity', 'All external integrations are designed over LAN@Changi with documented routing, protocols, firewall openings and VLAN/VRF segregation. Primary, secondary and drawbridge connectivity to FCS/DR are incorporated.']
];
const defaultComplianceHighlights = [
  ['24x7 operation with degraded mode', 'The design maintains essential services under failure conditions, including stand-alone CATS/SCDS operations and automatic interface reconnection logic.'],
  ['Interfaces to FCS, Master Clock, NCLFI and PA', 'The solution includes dedicated interface design, secure routing, logging and operational monitoring for each required external connection.'],
  ['90 MPPA to 140 MPPA growth', 'Capacity is sized with material headroom and modular expansion paths for compute, storage, endpoint devices and network resources.'],
  ['OEM-agnostic display hardware requirement', 'The proposed application architecture remains display-hardware agnostic subject to standard interface and certification constraints, with any dependency transparently declared at final design stage.'],
  ['Future expansion without additional application licensing', 'ATT will position the commercial and technical architecture so that future expansion does not require further IIDS application software/product development licensing, other than additional hardware and operating systems as needed.']
];
const defaultHardwareTable = [
  ['Production environment', 'High-availability application tier, operational database, protected storage/backup, monitored network interfaces and secure connectivity to LAN@Changi, FCS/FCS DR, Master Clock, NCLFI and airport endpoints.'],
  ['UAT environment', 'Separate non-HA environment mirroring core functional components for configuration testing, interface rehearsal, user familiarisation and release validation.'],
  ['Field / endpoint environment', 'Media players, display devices, GMIDs, BMDs, monitoring stations and CATS workstations connected through controlled network segments with local diagnostics and operational continuity logic.']
];

// ============================================================
// CONTENT RENDERER
// Maps JSON items from section-content.json to docx elements.
//
// Supported types:
//   h1, h2, h3          — headings
//   p                   — body paragraph (text)
//   bullet              — bullet point (text, optional level 0-2)
//   placeholder         — italic grey placeholder note
//   table_design_considerations  — design considerations comparison table
//   table_compliance_highlights  — compliance highlights table
//   table_hardware_env           — hardware/environment summary table
//   custom_table        — custom 2-column key/value table; requires rows: [["col1","col2"],...]
// ============================================================
function renderContent(items) {
  return items.flatMap(item => {
    switch (item.type) {
      case 'h1': return h1(item.text);
      case 'h2': return h2(item.text);
      case 'h3': return h3(item.text);
      case 'p': return p(item.text);
      case 'bullet': return bullet(item.text, item.level || 0);
      case 'placeholder':
        return new Paragraph({ spacing: { after: 120 }, children: [run(item.text || '[To be inserted]', { italics: true, color: '7A7A7A' })] });
      case 'table_design_considerations':
        return clauseTable(item.rows || defaultDesignConsiderations);
      case 'table_compliance_highlights':
        return clauseTable(item.rows || defaultComplianceHighlights);
      case 'table_hardware_env':
        return clauseTable(item.rows || defaultHardwareTable);
      case 'custom_table':
        return clauseTable(item.rows || []);
      default:
        // Fallback: render as paragraph
        return p(item.text || '');
    }
  });
}

// ============================================================
// LOAD section-content.json — REQUIRED
// Hermes must write this file before running generate-cag.js.
// See SKILL.md for the exact JSON format and minimum word counts.
// ============================================================
function loadContent() {
  const contentPath = path.join(__dirname, 'section-content.json');
  if (!fs.existsSync(contentPath)) {
    throw new Error(
      'MISSING: scripts/section-content.json\n' +
      'Hermes must write this file with substantive section content before running generate-cag.js.\n' +
      'See hermes/SKILL.md → Step 3: Content Generation for the required JSON format and word count targets.'
    );
  }
  let content;
  try {
    content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  } catch (e) {
    throw new Error('section-content.json is not valid JSON. Fix the syntax and rerun.\nError: ' + e.message);
  }
  if (!content.doc06 || !content.doc07) {
    throw new Error('section-content.json must have both "doc06" and "doc07" arrays. See SKILL.md.');
  }
  return content;
}

// ============================================================
// DOCUMENT BUILDERS
// ============================================================
function technicalProposalDoc(content) {
  const children = [
    ...cover('06 Technical Proposal', 'Section 06 – Technical Proposal'),
    ...renderContent(content.doc06),
    endSection()
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
function systemDesignDoc(content) {
  const children = [
    ...cover('07 System Design and Technical Architecture', 'Section 07 – System Design and Technical Architecture'),
    ...renderContent(content.doc07),
    endSection()
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
  const content = loadContent();
  const docs = [
    { name: '06 Technical Proposal.docx', doc: technicalProposalDoc(content) },
    { name: '07 System Design and Technical Architecture.docx', doc: systemDesignDoc(content) },
  ];
  for (const item of docs) {
    const buffer = await Packer.toBuffer(item.doc);
    fs.writeFileSync(path.join(outDir, item.name), buffer);
    console.log('Generated: ' + item.name + ' (' + buffer.length + ' bytes)');
  }
  // Write notes from content metadata if present
  if (content.notes) {
    fs.writeFileSync(path.join(outDir, 'hermes-generation-notes.txt'), content.notes);
    console.log('Written: hermes-generation-notes.txt');
  }
  console.log('Hermes generation complete. Output: ' + outDir);
}

main().catch(e => {
  console.error('\n[ERROR] ' + e.message);
  process.exit(1);
});
