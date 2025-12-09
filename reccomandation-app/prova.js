import puppeteer from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import proxyChain from 'proxy-chain';

puppeteer.use(Stealth());

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function humanType(page, selector, txt) {
  if (typeof txt !== 'string') txt = String(txt);
  for (const ch of txt) {
    await page.type(selector, ch);
    await page.waitForTimeout(rand(50, 200));
  }
}

(async () => {
  const oldProxyUrl = process.env.PROXY;  // es: 'http://user:pass@ip:port'
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--proxy-server=${newProxyUrl}`,
      '--no-sandbox',
      '--ignore-certificate-errors',
      '--disable-setuid-sandbox'
    ],
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();

  // Proxy authentication non necessaria, gestita da proxy-chain

  page.setDefaultNavigationTimeout(60000);
  try {
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
  } catch (e) {
    console.error('Timeout carico pagina:', e);
    await browser.close();
    return;
  }

  await humanType(page, '#username', process.env.LINKEDIN_USER);
  await humanType(page, '#password', process.env.LINKEDIN_PASS);
  await page.click('button[type=submit]');

  // ...
  
  // Pulisci proxy-chain a fine sessione
  await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
})();
