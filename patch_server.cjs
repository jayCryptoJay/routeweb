const fs = require('fs');
const path = 'server/_core/index.ts';
let code = fs.readFileSync(path, 'utf-8');

// Ensure production binds strictly to process.env.PORT and 0.0.0.0
code = code.replace(
  `  const preferredPort = parseInt(process.env.PORT || "3000");\n  const port = await findAvailablePort(preferredPort);\n  if (port !== preferredPort) {\n    console.log(\`Port \${preferredPort} is busy, using port \${port} instead\`);\n  }\n\n  server.listen(port, () => {\n    console.log(\`Server running on http://localhost:\${port}/\`);\n  });`,
  `  const preferredPort = parseInt(process.env.PORT || "3000");\n  const port = process.env.NODE_ENV === "production" ? preferredPort : await findAvailablePort(preferredPort);\n  if (port !== preferredPort) {\n    console.log(\`Port \${preferredPort} is busy, using port \${port} instead\`);\n  }\n\n  server.listen(port, "0.0.0.0", () => {\n    console.log(\`Server running on http://0.0.0.0:\${port}/\`);\n  });`
);

fs.writeFileSync(path, code);
console.log("Updated server/_core/index.ts");
