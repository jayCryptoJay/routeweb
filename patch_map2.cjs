const fs = require('fs');
let content = fs.readFileSync('client/src/pages/MapPage.tsx', 'utf-8');
content = content.replace(
  'markerRefs.current.forEach(marker => { marker.map = null; });',
  'markerRefs.current.forEach(marker => { try { marker.map = null; } catch(e) {} });'
);
fs.writeFileSync('client/src/pages/MapPage.tsx', content);
