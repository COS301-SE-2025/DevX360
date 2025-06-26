
const fs = require('fs');

test('File starts with the word "test"', () => {
  const content = fs.readFileSync('Testing/tests/unit/sampleText.txt', 'utf8');
  const firstWord = content.trim().split(/\s+/)[0];
  expect(firstWord.toLowerCase()).toBe('test');
});
