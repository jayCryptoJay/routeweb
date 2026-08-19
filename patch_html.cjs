const fs = require('fs');
const path = 'client/index.html';
let html = fs.readFileSync(path, 'utf-8');

// Replace static %VITE_ANALYTICS_ENDPOINT% tag with safe conditional loader
html = html.replace(
  '<script defer src="%VITE_ANALYTICS_ENDPOINT%/umami" data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"></script>',
  `<script>
      (function() {
        var ep = "%VITE_ANALYTICS_ENDPOINT%";
        var id = "%VITE_ANALYTICS_WEBSITE_ID%";
        if (ep && !ep.startsWith("%") && id && !id.startsWith("%")) {
          var s = document.createElement("script");
          s.defer = true;
          s.src = ep + "/umami";
          s.setAttribute("data-website-id", id);
          document.head.appendChild(s);
        }
      })();
    </script>`
);

fs.writeFileSync(path, html);
console.log("Updated client/index.html");
