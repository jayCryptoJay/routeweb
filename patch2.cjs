const fs = require('fs');
let code = fs.readFileSync('client/src/pages/MapPage.tsx', 'utf-8');
code = code.replace(/marker\.position = null; /g, '');
fs.writeFileSync('client/src/pages/MapPage.tsx', code);
