#!/usr/bin/env node
/**
 * Schema Guardian validation script - validates all file-doc JSON files against file-doc.schema.json
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;

const SCHEMA_PATH = path.join(__dirname, '../schemas/file-doc.schema.json');
const DOCS_PATH = path.join(__dirname, '../repos/akeyless-client-commons/docs');
const SOURCE_PATH = path.join(__dirname, '../../../commons/client_commons/src');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const validate = ajv.compile(schema);

function getAllJsonFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllJsonFiles(fullPath, files);
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function getRelativePath(absPath) {
  return path.relative(DOCS_PATH, absPath).replace(/\\/g, '/');
}

// Export -> Symbol referential integrity
function checkExportSymbolIntegrity(doc) {
  const errors = [];
  const symbolIds = new Set((doc.symbols || []).map((s) => s.symbol_id));
  for (const exp of doc.exports || []) {
    if (exp.symbol_id && !symbolIds.has(exp.symbol_id)) {
      errors.push(`Export "${exp.name}" references missing symbol_id: ${exp.symbol_id}`);
    }
  }
  return errors;
}

// Check source file exists
function checkMirrorLink(docPath, doc) {
  const filePath = doc?.source?.file_path;
  if (!filePath) return { ok: false, reason: 'Missing source.file_path' };
  const ext = path.extname(filePath) || '.ts';
  const sourcePath = path.join(SOURCE_PATH, filePath);
  const withExt = sourcePath.endsWith('.ts') || sourcePath.endsWith('.tsx') || sourcePath.endsWith('.js') || sourcePath.endsWith('.jsx')
    ? sourcePath
    : sourcePath + ext;
  const exists = fs.existsSync(sourcePath) || fs.existsSync(withExt);
  return { ok: exists, sourcePath: exists ? sourcePath : sourcePath };
}

// Extension preservation: doc should be <name>.<ext>.json
function checkExtensionPreservation(docPath, doc) {
  const filePath = doc?.source?.file_path;
  if (!filePath) return null;
  const base = path.basename(filePath);
  const expectedDocName = base + '.json';
  const actualDocName = path.basename(docPath);
  if (actualDocName !== expectedDocName) {
    return { expected: expectedDocName, actual: actualDocName };
  }
  return null;
}

const results = {
  total: 0,
  valid: [],
  invalid: [],
  schemaErrors: {},
  exportSymbolErrors: {},
  orphaned: [],
  extensionMismatch: [],
};

const jsonFiles = getAllJsonFiles(DOCS_PATH);
results.total = jsonFiles.length;

for (const filePath of jsonFiles) {
  const rel = getRelativePath(filePath);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    results.invalid.push({ file: rel, error: 'Read error: ' + e.message });
    continue;
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    results.invalid.push({ file: rel, error: 'Invalid JSON: ' + e.message });
    continue;
  }

  const schemaValid = validate(doc);
  const exportErr = checkExportSymbolIntegrity(doc);
  const mirror = checkMirrorLink(filePath, doc);
  const extCheck = checkExtensionPreservation(filePath, doc);

  if (!mirror.ok) {
    results.orphaned.push({ file: rel, sourcePath: mirror.sourcePath });
  }
  if (extCheck) {
    results.extensionMismatch.push({ file: rel, ...extCheck });
  }
  if (exportErr.length) {
    results.exportSymbolErrors[rel] = exportErr;
  }

  if (!schemaValid) {
    results.schemaErrors[rel] = validate.errors;
    results.invalid.push({ file: rel, errors: validate.errors });
  } else if (exportErr.length) {
    results.invalid.push({ file: rel, errors: exportErr });
  } else {
    results.valid.push(rel);
  }
}

// Output report
console.log(JSON.stringify(results, null, 2));
