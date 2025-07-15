import fs from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;

if (!token || !fileKey) {
  console.error('FIGMA_TOKEN and FIGMA_FILE_KEY environment variables are required');
  process.exit(1);
}

const url = `https://api.figma.com/v1/files/${fileKey}`;

fetch(url, {
  headers: {
    'X-Figma-Token': token
  }
})
  .then(res => {
    if (!res.ok) throw new Error(`Figma API error: ${res.status}`);
    return res.json();
  })
  .then(data => {
    fs.writeFileSync('tokens/figma-raw.json', JSON.stringify(data, null, 2));
    console.log('Tokens fetched from Figma');
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
