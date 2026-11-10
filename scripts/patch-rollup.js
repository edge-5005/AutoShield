import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rollupNativePath = path.resolve(__dirname, '..', 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(rollupNativePath)) {
  let content = fs.readFileSync(rollupNativePath, 'utf8');
  if (!content.includes('@rollup/wasm-node/dist/native.js')) {
    content = content.replace(
      /const nativeModule = requireWithFriendlyError\(\s*existsSync\(path\.join\(__dirname, localName\)\) \? localName : `@rollup\/rollup-\${packageBase}`\s*\);/,
      `let nativeModule;
try {
  nativeModule = requireWithFriendlyError(
    existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
  );
} catch (e) {
  try {
    nativeModule = require('@rollup/wasm-node/dist/native.js');
  } catch (err2) {
    throw e;
  }
}`
    );
    fs.writeFileSync(rollupNativePath, content, 'utf8');
    console.log('✓ Successfully patched Rollup for WASM compatibility on Windows');
  }
}
