const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-web-security'] });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.toString(), err.stack));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE_ERROR:', msg.text());
  });
  await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle0' });
  await browser.close();
})();
