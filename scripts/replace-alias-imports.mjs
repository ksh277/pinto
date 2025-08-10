import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function loadTsConfig() {
  const tsconfigPath = path.join(root, 'tsconfig.json');
  const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));
  const baseUrl = path.resolve(root, tsconfig.compilerOptions?.baseUrl || '.');
  const paths = tsconfig.compilerOptions?.paths || {};
  const mappings = Object.entries(paths).map(([alias, targets]) => {
    const prefix = alias.replace(/\/\*$/, '');
    const target = path.resolve(baseUrl, targets[0].replace(/\/\*$/, ''));
    return { prefix, target };
  });
  return mappings;
}

function replaceImports(code, filePath, mappings) {
  let modified = false;
  for (const { prefix, target } of mappings) {
    const re = new RegExp(`from ['"]${prefix}(/[^'\"]*)?['"]`, 'g');
    code = code.replace(re, (_match, subpath = '') => {
      const absTarget = path.join(target, subpath);
      let rel = path.relative(path.dirname(filePath), absTarget).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;
      modified = true;
      return `from '${rel}'`;
    });
  }
  return { code, modified };
}

async function walk(dir, mappings) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, mappings);
    } else if (/\.[mc]?[tj]sx?$/.test(entry.name)) {
      const { code, modified } = replaceImports(await fs.readFile(fullPath, 'utf8'), fullPath, mappings);
      if (modified) {
        await fs.writeFile(fullPath, code);
        console.log('Updated imports in', path.relative(root, fullPath));
      }
    }
  }
}

const targetDir = path.resolve(root, process.argv[2] || '.');
const mappings = await loadTsConfig();
await walk(targetDir, mappings);
