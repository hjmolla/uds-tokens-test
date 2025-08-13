import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ['test-simple.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      buildPath: 'test/',
      files: [{
        destination: 'test.css',
        format: 'css/variables'
      }]
    }
  }
});

await sd.buildAllPlatforms();