const fs = require('fs');
let code = fs.readFileSync('client/src/pages/MapPage.tsx', 'utf-8');

code = code.replace(/const markerRefs = useRef<google\.maps\.marker\.AdvancedMarkerElement\[\]>\(\[\]\);\n\s*const lineRef = useRef<google\.maps\.Polyline \| null>\(null\);/g, '');

code = code.replace(/markerRefs\.current\.forEach\(marker => \{ try \{ marker\.position = null; marker\.map = null; \} catch\(e\) \{\} \}\);\n\s*markerRefs\.current = \[\];\n\s*try \{ lineRef\.current\?\.setMap\(null\); \} catch\(e\) \{\}/g, 'const currentMarkers: google.maps.marker.AdvancedMarkerElement[] = [];\n    let currentLine: google.maps.Polyline | null = null;');

code = code.replace(/lineRef\.current = new google\.maps\.Polyline/g, 'currentLine = new google.maps.Polyline');
code = code.replace(/markerRefs\.current\.push\(/g, 'currentMarkers.push(');

code = code.replace(/markerRefs\.current\.forEach\(marker => \{ try \{ marker\.position = null; marker\.map = null; \} catch\(e\) \{\} \}\);\n\s*lineRef\.current\?\.setMap\(null\);/g, `currentMarkers.forEach(marker => { try { marker.position = null; marker.map = null; } catch(e) {} });
      if (currentLine) { try { currentLine.setMap(null); } catch(e) {} }`);

fs.writeFileSync('client/src/pages/MapPage.tsx', code);
