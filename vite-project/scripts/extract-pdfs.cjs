const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

async function extractPdfToText(inputPdfPath, outputTxtPath) {
  try {
    const pdfBuffer = fs.readFileSync(inputPdfPath);
    const parsed = await pdfParse(pdfBuffer);
    fs.writeFileSync(outputTxtPath, parsed.text, 'utf8');
    console.log(`OK  ${path.basename(inputPdfPath)} -> ${outputTxtPath} (${parsed.text.length} chars)`);
  } catch (error) {
    console.error(`FAIL ${path.basename(inputPdfPath)} -> ${outputTxtPath}`);
    console.error(error && error.stack ? error.stack : String(error));
  }
}

async function main() {
  const here = __dirname;
  const outDir = path.resolve(here, '..', 'data', 'pdf_text');
  await ensureDirectoryExists(outDir);

  const inputs = [
    path.resolve(here, '..', '..', '..', 'COMP2140_7240_ReactWeb_Brief_V1.pdf'),
    path.resolve(here, '..', '..', '..', 'COMP2140_7240_ReactWeb_RESTFul_API.pdf'),
    path.resolve(here, '..', '..', '..', 'COMP2140_7240_ReactWeb_Rubric_V1.pdf'),
  ];

  for (const input of inputs) {
    const baseName = path.basename(input, path.extname(input));
    const outFile = path.join(outDir, `${baseName}.txt`);
    await extractPdfToText(input, outFile);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


