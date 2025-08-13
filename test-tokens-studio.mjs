import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

console.log('StyleDictionary version and properties:');
console.log('Available properties on StyleDictionary:', Object.getOwnPropertyNames(StyleDictionary).sort());

// Register the transforms
register(StyleDictionary);

console.log('\nAfter register:');
console.log('Available properties on StyleDictionary:', Object.getOwnPropertyNames(StyleDictionary).sort());

// Test creating an instance to see if it works
try {
  const sd = new StyleDictionary({
    source: [],
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        buildPath: 'test/',
        files: []
      }
    }
  });
  console.log('\n✅ StyleDictionary instance created successfully with tokens-studio config');
} catch (error) {
  console.log('\n❌ Error creating StyleDictionary instance:', error.message);
}