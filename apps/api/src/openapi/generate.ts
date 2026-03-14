import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateOpenAPIDocument } from './spec';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const doc = generateOpenAPIDocument();

// Output to apps/api/openapi.json (two levels up from src/openapi/)
const outputPath = resolve(__dirname, '../../openapi.json');

writeFileSync(outputPath, JSON.stringify(doc, null, 2));
console.log(`✓ OpenAPI spec written to ${outputPath}`);
