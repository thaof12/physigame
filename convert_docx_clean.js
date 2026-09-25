import fs from 'fs';
import path from 'path';

const rawDir = 'd:/web6-9/physigame/docx_extracted_raw/word';
const relsFile = path.join(rawDir, '_rels/document.xml.rels');
const docXmlFile = path.join(rawDir, 'document.xml');
const mediaDir = path.join(rawDir, 'media');
const outputMediaDir = 'd:/web6-9/physigame/extracted_doc_media';
const outputMdFile = 'd:/web6-9/physigame/Eureka_Physics_Converted.md';
const outputTxtFile = 'd:/web6-9/physigame/Eureka_Physics_Converted.txt';

// 1. Ensure outputMediaDir exists and copy media files
if (!fs.existsSync(outputMediaDir)) {
  fs.mkdirSync(outputMediaDir, { recursive: true });
}

if (fs.existsSync(mediaDir)) {
  const mediaFiles = fs.readdirSync(mediaDir);
  for (const file of mediaFiles) {
    fs.copyFileSync(path.join(mediaDir, file), path.join(outputMediaDir, file));
  }
  console.log(`Copied ${mediaFiles.length} media files to ${outputMediaDir}`);
}

// 2. Parse relationships to map rId -> target image path
const relsContent = fs.readFileSync(relsFile, 'utf-8');
const rIdToMedia = {};
const relRegex = /<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g;
let match;
while ((match = relRegex.exec(relsContent)) !== null) {
  const rId = match[1];
  let target = match[2];
  if (target.startsWith('media/')) {
    target = target.replace('media/', '');
    rIdToMedia[rId] = `extracted_doc_media/${target}`;
  }
}
console.log(`Parsed ${Object.keys(rIdToMedia).length} media relationships.`);

// 3. Read document.xml
const xmlContent = fs.readFileSync(docXmlFile, 'utf-8');

// Simple helper to unescape XML entities
function decodeXml(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// Parse document body
// We will iterate through block elements inside <w:body> (paragraphs <w:p> and tables <w:tbl>)
const bodyMatch = xmlContent.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
if (!bodyMatch) {
  console.error('No <w:body> found in document.xml');
  process.exit(1);
}

const bodyXml = bodyMatch[1];

function parseParagraph(pXml) {
  // Check style
  let isHeading = 0;
  const styleMatch = pXml.match(/<w:pStyle\s+w:val="([^"]+)"/);
  if (styleMatch) {
    const styleVal = styleMatch[1].toLowerCase();
    if (styleVal.includes('heading1') || styleVal === 'title') isHeading = 1;
    else if (styleVal.includes('heading2') || styleVal === 'subtitle') isHeading = 2;
    else if (styleVal.includes('heading3')) isHeading = 3;
    else if (styleVal.includes('heading4') || styleVal.includes('appendix')) isHeading = 4;
  }

  let textParts = [];

  // Find all runs <w:r> or drawings <w:drawing> / <w:pict>
  // Also check for image embed rId inside drawing
  const elementRegex = /(<w:r[^>]*>[\s\S]*?<\/w:r>|<w:drawing[^>]*>[\s\S]*?<\/w:drawing>|<w:pict[^>]*>[\s\S]*?<\/w:pict>)/g;
  let elMatch;
  while ((elMatch = elementRegex.exec(pXml)) !== null) {
    const chunk = elMatch[1];
    
    // Check if chunk contains an image relationship rId
    const blipMatch = chunk.match(/(?:r:embed|r:link|embed)="([^"]+)"/);
    if (blipMatch) {
      const rId = blipMatch[1];
      if (rIdToMedia[rId]) {
        const mediaPath = rIdToMedia[rId];
        textParts.push(`\n\n![Figure](${mediaPath})\n\n`);
      }
    }

    // Extract text elements <w:t>
    const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    let runText = '';
    while ((tMatch = tRegex.exec(chunk)) !== null) {
      runText += decodeXml(tMatch[1]);
    }
    // Clean any residual XML tags
    runText = runText.replace(/<[^>]+>/g, '');

    if (runText) {
      // Check formatting like bold/italic in run
      const isBold = /<w:b(?:\s|\/>|>)/.test(chunk);
      const isItalic = /<w:i(?:\s|\/>|>)/.test(chunk);

      let formattedText = runText;
      if (isBold && isItalic) formattedText = `***${runText.trim()}*** `;
      else if (isBold) formattedText = `**${runText.trim()}** `;
      else if (isItalic) formattedText = `*${runText.trim()}* `;

      textParts.push(formattedText);
    }
  }

  let fullText = textParts.join('').trim();
  if (!fullText) return '';

  if (isHeading === 1) return `# ${fullText}\n`;
  if (isHeading === 2) return `## ${fullText}\n`;
  if (isHeading === 3) return `### ${fullText}\n`;
  if (isHeading === 4) return `#### ${fullText}\n`;

  return `${fullText}\n`;
}

function parseTable(tblXml) {
  // Extract rows <w:tr>
  const rowMatches = tblXml.match(/<w:tr[^>]*>[\s\S]*?<\/w:tr>/g);
  if (!rowMatches || rowMatches.length === 0) return '';

  const tableData = [];
  for (const rowXml of rowMatches) {
    const cellMatches = rowXml.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
    if (!cellMatches) continue;

    const rowCells = [];
    for (const cellXml of cellMatches) {
      // Each cell can have multiple paragraphs
      const pMatches = cellXml.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/g);
      let cellText = '';
      if (pMatches) {
        cellText = pMatches.map(parseParagraph).join(' ').replace(/\n+/g, ' ').trim();
      }
      // Escape pipes in cell content
      cellText = cellText.replace(/\|/g, '\\|');
      rowCells.push(cellText || ' ');
    }
    tableData.push(rowCells);
  }

  if (tableData.length === 0) return '';

  // Determine max columns
  const colCount = Math.max(...tableData.map(r => r.length));

  // Build markdown table
  const lines = [];
  
  // Header row
  const headerRow = tableData[0];
  while (headerRow.length < colCount) headerRow.push(' ');
  lines.push(`| ${headerRow.join(' | ')} |`);

  // Separator
  lines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);

  // Data rows
  for (let i = 1; i < tableData.length; i++) {
    const row = tableData[i];
    while (row.length < colCount) row.push(' ');
    lines.push(`| ${row.join(' | ')} |`);
  }

  return '\n' + lines.join('\n') + '\n\n';
}

// Extract blocks in order (<w:p> and <w:tbl>)
const blockRegex = /(<w:p[^>]*>[\s\S]*?<\/w:p>|<w:tbl[^>]*>[\s\S]*?<\/w:tbl>)/g;
let blockMatch;
const mdOut = [];

while ((blockMatch = blockRegex.exec(bodyXml)) !== null) {
  const blockXml = blockMatch[1];
  if (blockXml.startsWith('<w:tbl')) {
    const tblMd = parseTable(blockXml);
    if (tblMd) mdOut.push(tblMd);
  } else if (blockXml.startsWith('<w:p')) {
    const pMd = parseParagraph(blockXml);
    if (pMd) mdOut.push(pMd);
  }
}

const finalMdContent = mdOut.join('\n');
fs.writeFileSync(outputMdFile, finalMdContent, 'utf-8');
console.log(`Wrote converted Markdown file: ${outputMdFile} (${finalMdContent.length} chars)`);

// Plain text version without markdown syntax
const plainText = finalMdContent
  .replace(/#+\s+/g, '')
  .replace(/\*\*\*/g, '')
  .replace(/\*\*/g, '')
  .replace(/\*/g, '')
  .replace(/!\[Figure\]\(([^)]+)\)/g, '[Hình ảnh/Sơ đồ: $1]')
  .replace(/\|/g, ' ');

fs.writeFileSync(outputTxtFile, plainText, 'utf-8');
console.log(`Wrote converted TXT file: ${outputTxtFile} (${plainText.length} chars)`);
