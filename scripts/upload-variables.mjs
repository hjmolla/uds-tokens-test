
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import 'dotenv/config';

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

const TOKENS_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'tokens');

// A simple function to determine variable type from value
function getVariableType(value) {
    if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return 'COLOR';
    }
    if (typeof value === 'number') {
        return 'FLOAT';
    }
    return 'STRING';
}

// A simple function to parse RGB from hex color
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
    } : null;
}


async function processTokenFile(filePath, collectionName) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(content);
        const variablePayloads = [];

        // Recursive function to flatten the token object
        function flattenTokens(obj, prefix = '') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const newKey = prefix ? `${prefix}/${key}` : key;
                    const valueObj = obj[key];

                    if (valueObj.hasOwnProperty('$value')) { // Using DTCG format with $value
                        const value = valueObj.$value;
                        const type = valueObj.$type;
                        let figmaType;
                        let apiValue;

                        switch (type) {
                            case 'color':
                                figmaType = 'COLOR';
                                const rgb = hexToRgb(value);
                                if (rgb) {
                                   apiValue = { ...rgb, a: 1 };
                                }
                                break;
                            case 'dimension':
                            case 'font-size':
                            case 'number':
                                figmaType = 'FLOAT';
                                apiValue = parseFloat(value);
                                break;
                            default:
                                figmaType = 'STRING';
                                apiValue = value.toString();
                                break;
                        }

                        if (figmaType && apiValue !== undefined) {
                             variablePayloads.push({
                                name: newKey,
                                syntacticType: figmaType,
                                value: apiValue,
                                collectionName: collectionName
                            });
                        }

                    } else if (typeof valueObj === 'object' && valueObj !== null) {
                        flattenTokens(valueObj, newKey);
                    }
                }
            }
        }

        flattenTokens(json);
        return variablePayloads;
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        return [];
    }
}


async function main() {
    if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
        console.error('FIGMA_TOKEN and FIGMA_FILE_KEY environment variables are required');
        process.exit(1);
    }

    console.log('Starting token upload to Figma Variables...');

    // 1. Get existing variable collections to avoid duplicates
    const collectionsResponse = await fetch(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variable_collections`, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN }
    });
    if (!collectionsResponse.ok) {
        if (collectionsResponse.status !== 404) { // Gracefully handle 404 when no variables exist
            console.error('Failed to fetch variable collections:', await collectionsResponse.text());
            return;
        }
    }
    let collectionsData = { meta: { variable_collections: [] } }; // Default empty state
    if (collectionsResponse.ok) {
        collectionsData = await collectionsResponse.json();
    }

    const existingCollections = collectionsData.meta.variable_collections;
    const collectionNameToId = Object.fromEntries(existingCollections.map(c => [c.name, c.id]));
    let defaultModeId = existingCollections.length > 0 ? existingCollections[0].default_mode_id : null;


    // 2. Read all token files and prepare payloads
    const allPayloads = [];
    const tokenDirs = ['primitives', 'semantic', 'component'];

    for (const dir of tokenDirs) {
        try {
            const collectionName = dir.charAt(0).toUpperCase() + dir.slice(1);
            const files = await fs.readdir(path.join(TOKENS_DIR, dir));
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(TOKENS_DIR, dir, file);
                    const payloads = await processTokenFile(filePath, collectionName);
                    allPayloads.push(...payloads);
                }
            }
        } catch (e) {
            if (e.code !== 'ENOENT') { // Ignore if directory doesn't exist
                 console.error(`Could not read directory ${dir}:`, e);
            }
        }
    }

    if (allPayloads.length === 0) {
        console.log("No valid tokens found to upload.");
        return;
    }

    // 3. Create collections if they don't exist and upload variables
    const uniqueCollectionNames = [...new Set(allPayloads.map(p => p.collectionName))];

    for (const collectionName of uniqueCollectionNames) {
        let collectionId = collectionNameToId[collectionName];

        if (!collectionId) {
            console.log(`Collection "${collectionName}" does not exist. Creating it...`);
            const createCollectionResponse = await fetch(`https://api.figma.com/v1/variable_collections`, {
                method: 'POST',
                headers: { 'X-Figma-Token': FIGMA_TOKEN, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: collectionName, file_key: FIGMA_FILE_KEY })
            });
            if (!createCollectionResponse.ok) {
                console.error(`Failed to create collection "${collectionName}":`, await createCollectionResponse.text());
                continue;
            }
            const newCollectionData = await createCollectionResponse.json();
            collectionId = newCollectionData.meta.id;
            defaultModeId = newCollectionData.meta.default_mode_id; // Use the new modeId
            console.log(`Collection "${collectionName}" created with ID: ${collectionId}`);
        }

        const variablesForCollection = allPayloads.filter(p => p.collectionName === collectionName);
        const figmaPayload = {
            variable_creations: variablesForCollection.map(p => ({
                name: p.name,
                collection_id: collectionId,
                syntactic_type: p.syntacticType,
                values_by_mode: {
                    [defaultModeId]: p.value
                }
            }))
        };

        console.log(`Uploading ${variablesForCollection.length} variables to collection "${collectionName}"...`);

        const uploadResponse = await fetch(`https://api.figma.com/v1/variables`, {
            method: 'POST',
            headers: { 'X-Figma-Token': FIGMA_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify(figmaPayload)
        });

        if (uploadResponse.ok) {
            console.log(`Successfully uploaded variables to "${collectionName}".`);
        } else {
            console.error(`Failed to upload variables to "${collectionName}":`, await uploadResponse.text());
        }
    }

    console.log('Figma variable upload process finished.');
}

main().catch(err => {
    console.error('An unexpected error occurred:', err);
    process.exit(1);
});
