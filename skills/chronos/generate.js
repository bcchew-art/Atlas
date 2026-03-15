const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, Footer, Header, ImageRun, VerticalAlign } = require('docx');

const generateProjectPlan = () => {
  // Create new document
  const doc = new Document({
    creator: 'ATT Infosoft',
    title: 'Project Plan - CAG T3 IIDS Refresh',
    description: 'Project Management Plan for CAG T3 IIDS Refresh Tender',
    coreProperties: {
        subject: 'Project Plan',
        keywords: ['CAG', 'IIDS', 'Tender', 'Project Management']
    }
});

  // Add header with ATT logo
  const header = new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: require('fs').readFileSync('skills/hermes/assets/att-logo.png').toString('base64'),
            transformation: {
              width: 100,
              height: 30,
            },
          }),
        ],
        alignment: 'right',
      }),
    ],
  });

  // Add footer with page numbers
  const footer = new Footer({
    children: [
      new Paragraph({
        text: 'Page ${pageNumber} of ${totalPages}',
        alignment: 'right',
      }),
    ],
  });

  // Add document metadata
  doc.addSection({
    properties: {
      titlePage: true,
    },
    children: [
      new Paragraph({
        text: '08 PROJECT PLAN - CAG T3 IIDS Refresh',
        heading: HeadingLevel.HEADING_1,
        alignment: 'center',
      }),
      new Paragraph({
        text: 'Tender Submission Document',
        alignment: 'center',
      }),
      new Paragraph({
        text: 'Date: ${new Date().toLocaleDateString()}',
        alignment: 'center',
      }),
    ],
  });

  // Add content sections
  // ... (content generation logic from SKILL.md would go here)

  // Add end marker
  doc.addSection({
    children: [
      new Paragraph({
        text: '--- END OF THIS SECTION ---',
        bold: true,
        italic: true,
        alignment: 'center',
      }),
    ],
  });

  return doc;
};

const generateProjectGovernance = () => {
  // Similar structure for Section 9
};

const generateTeamOrganisation = () => {
  // Similar structure for Section 10
};

// Main execution
const main = async () => {
  const projectPlanDoc = generateProjectPlan();
  const projectGovernanceDoc = generateProjectGovernance();
  const teamOrganisationDoc = generateTeamOrganisation();

  // Save documents
  const packer = new Packer();

  await packer.toBufferAsync(projectPlanDoc);
  await packer.toBufferAsync(projectGovernanceDoc);
  await packer.toBufferAsync(teamOrganisationDoc);

  console.log('Documents generated successfully');
};

main().catch(err => {
  console.error('Error generating documents:', err);
});