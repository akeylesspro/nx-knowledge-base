#!/usr/bin/env node
/**
 * Removes duplicate doc files per Schema Guardian section 6.1
 * Same folder, same base name (e.g. api.json vs api.ts.json)
 * Keeps the extension-preserving file when content is ≥80% similar
 */

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.join(__dirname, '../repos/akeyless-client-commons/docs');
const SOURCE_ROOT = path.join(__dirname, '../../../commons/client_commons/src');

function getAllJsonFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      getAllJsonFiles(full, files);
    } else if (e.name.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

function getBaseName(filename) {
  return filename.replace(/\.(tsx?|jsx?|vue)\.json$/i, '').replace(/\.json$/i, '');
}

function getSourceExtFromFilePath(doc) {
  try {
    const data = JSON.parse(fs.readFileSync(doc, 'utf8'));
    const fp = data?.source?.file_path;
    if (!fp) return null;
    const ext = path.extname(fp);
    return ext || null;
  } catch {
    return null;
  }
}

function symbolOverlap(docA, docB) {
  try {
    const a = JSON.parse(fs.readFileSync(docA, 'utf8'));
    const b = JSON.parse(fs.readFileSync(docB, 'utf8'));
    const symA = new Set((a.symbols || []).map(s => `${s.name}:${s.kind}`));
    const symB = new Set((b.symbols || []).map(s => `${s.name}:${s.kind}`));
    const expA = new Set((a.exports || []).map(e => `${e.name}:${e.kind}`));
    const expB = new Set((b.exports || []).map(e => `${e.name}:${e.kind}`));
    const symIntersect = [...symA].filter(x => symB.has(x)).length;
    const symUnion = new Set([...symA, ...symB]).size;
    const expIntersect = [...expA].filter(x => expB.has(x)).length;
    const expUnion = new Set([...expA, ...expB]).size;
    const symRatio = symUnion > 0 ? symIntersect / symUnion : 1;
    const expRatio = expUnion > 0 ? expIntersect / expUnion : 1;
    return (symRatio + expRatio) / 2;
  } catch {
    return 0;
  }
}

function preferFile(files) {
  // Prefer extension-preserving: index.ts.json over index.json when source is index.ts
  // Prefer .tsx over .ts when source is tsx
  const withMeta = files.map(f => {
    const ext = getSourceExtFromFilePath(f);
    const name = path.basename(f);
    const isExtPreserving = ext && name.includes(ext);
    return { f, ext, isExtPreserving, name };
  });
  const hasExt = withMeta.find(m => m.isExtPreserving);
  if (hasExt) return hasExt.f;
  return withMeta[0].f;
}

function fileSizeQuality(doc) {
  try {
    const data = JSON.parse(fs.readFileSync(doc, 'utf8'));
    const symCount = (data.symbols || []).length;
    const expCount = (data.exports || []).length;
    let score = symCount * 2 + expCount;
    if (data.symbols) {
      for (const s of data.symbols) {
        if (s.examples?.minimal_correct) score += 1;
        if (s.signature) score += 1;
      }
    }
    return score;
  } catch {
    return 0;
  }
}

const allFiles = getAllJsonFiles(DOCS_ROOT);
const byDirBase = {};

for (const full of allFiles) {
  const rel = path.relative(DOCS_ROOT, full);
  const dir = path.dirname(rel).replace(/\\/g, '/');
  const base = getBaseName(path.basename(full));
  const key = dir ? `${dir}/${base}` : base;
  if (!byDirBase[key]) byDirBase[key] = [];
  byDirBase[key].push(full);
}

const duplicateGroups = Object.entries(byDirBase).filter(([_, arr]) => arr.length > 1);
console.log('Duplicate groups:', duplicateGroups.length);

const toDelete = [];
const toRename = [];
const manualReview = [];

for (const [key, files] of duplicateGroups) {
  if (files.length < 2) continue;
  const overlap = files.length === 2
    ? symbolOverlap(files[0], files[1])
    : Math.min(...files.flatMap((f, i) => files.slice(i + 1).map(g => symbolOverlap(f, g))));
  const avgOverlap = files.length === 2 ? overlap : overlap;
  let pairOverlap = 0;
  if (files.length === 2) pairOverlap = symbolOverlap(files[0], files[1]);
  else {
    for (let i = 0; i < files.length - 1; i++) {
      for (let j = i + 1; j < files.length; j++) {
        pairOverlap = Math.max(pairOverlap, symbolOverlap(files[i], files[j]));
      }
    }
  }
  if (pairOverlap >= 0.8) {
    const keep = preferFile(files) || files.reduce((a, b) => fileSizeQuality(a) >= fileSizeQuality(b) ? a : b);
    for (const f of files) {
      if (f !== keep) toDelete.push({ file: path.relative(DOCS_ROOT, f), keep: path.relative(DOCS_ROOT, keep) });
    }
  } else if (pairOverlap < 0.5) {
    manualReview.push({ key, files: files.map(f => path.relative(DOCS_ROOT, f)), overlap: pairOverlap, action: 'KEEP_ALL' });
  } else {
    manualReview.push({ key, files: files.map(f => path.relative(DOCS_ROOT, f)), overlap: pairOverlap, action: 'MANUAL_REVIEW' });
  }
}

console.log('\nFiles to DELETE (duplicates, content ≥80% similar):');
toDelete.forEach(d => console.log('  -', d.file, '(keeping', d.keep + ')'));
console.log('\nManual review (50-80% overlap or <50% - different content):');
manualReview.forEach(m => console.log('  ', m.key, m.action, m.files));

// Execute deletions (pass --execute to actually delete)
const doExecute = process.argv.includes('--execute');
let deleted = 0;
if (doExecute) {
  for (const d of toDelete) {
    const fullPath = path.join(DOCS_ROOT, d.file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      deleted++;
      console.log('Deleted:', d.file);
    }
  }
  console.log('\nTotal deleted:', deleted);
} else {
  console.log('\nDry run. Pass --execute to actually delete', toDelete.length, 'files.');
}
