// Fix EJS regex patterns that break item.itemName.replace(/'/g, ...)
// The single quote inside the regex confuses EJS parser
// Solution: replace with .split("'").join("\\'")
const fs = require('fs');
const filePath = 'views/items/details.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Count original patterns
const lines = content.split('\n');
let fixCount = 0;

// Find and replace all variations of the broken pattern
// Pattern: item.itemName.replace(/'/g, "\\'")  in various forms
const newContent = content.replace(
    /item\.itemName\.replace\([^)]*\)/g,
    (match) => {
        fixCount++;
        console.log(`  Fix ${fixCount}: ${match}`);
        return "item.itemName.split(\"'\").join(\"\\\\'\")";
    }
);

fs.writeFileSync(filePath, newContent);
console.log(`\nTotal fixes: ${fixCount}`);
