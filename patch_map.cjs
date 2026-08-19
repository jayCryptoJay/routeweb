const fs = require('fs');
let code = fs.readFileSync('client/src/components/Map.tsx', 'utf-8');
code = code.replace(/center: initialCenter,/g, 'center: { ...initialCenter },');
fs.writeFileSync('client/src/components/Map.tsx', code);
