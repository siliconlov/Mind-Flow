
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(__dirname, '../models_new.txt'), 'utf8'); // Try utf8 first, if it fails we might need to handle encoding
// Actually list-models.ts used console.log, which in powershell might produce utf16.
// Let's try to read it as string and split.

console.log("Searching for gemini models...");
const lines = content.split('\n');
const geminiModels = lines.filter(l => l.toLowerCase().includes('gemini'));
geminiModels.forEach(m => console.log(m.trim()));
