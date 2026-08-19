const fs = require('fs');
let code = fs.readFileSync('client/src/components/LiveRouteMap.tsx', 'utf-8');

code = code.replace(/const directionsRendererRef = useRef<google\.maps\.DirectionsRenderer \| null>\(null\);/g, '');

code = code.replace(/if \(\!directionsRendererRef\.current\) \{\s*directionsRendererRef\.current = new window\.google\.maps\.DirectionsRenderer\(\{\s*map,\s*suppressMarkers: false,\s*polylineOptions: \{\s*strokeColor: "\#38bdf8",\s*strokeOpacity: 0\.8,\s*strokeWeight: 6,\s*\},\s*\}\);\s*\}/g, `const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#38bdf8",
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });`);

code = code.replace(/directionsRendererRef\.current\?\.setDirections\(result\);/g, 'directionsRenderer.setDirections(result);');

code = code.replace(/directionsRendererRef\.current\?\.setMap\(null\);/g, 'directionsRenderer.setMap(null);');

fs.writeFileSync('client/src/components/LiveRouteMap.tsx', code);
