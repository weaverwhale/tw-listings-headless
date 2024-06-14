import { writeFileSync } from 'fs';

async function generate() {
  const schemaToTypescript = require('json-schema-to-typescript');
  writeFileSync('schema.d.ts', await schemaToTypescript.compileFromFile('schema.json'));
}

generate();
