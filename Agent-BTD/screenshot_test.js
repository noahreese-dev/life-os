const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const gamePath = path.resolve(__dirname, 'game', 'index.html').split(path.sep).join('/');
  const url = 'file:///' + gamePath;
  await page.goto(url);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/audit-01-initial.png', fullPage: true });

  await page.evaluate(() => {
    const api = window.__AGENT_BTD__;
    api.placeTowerAt('cos', 280, 280);
    api.placeTowerAt('ali', 450, 350);
    api.placeTowerAt('jung', 620, 250);
    api.placeTowerAt('hassan', 700, 400);
    api.placeTowerAt('garage', 350, 500);
    api.placeTowerAt('im', 550, 550);
    api.placeTowerAt('ultra', 200, 350);
    api.placeTowerAt('daily', 150, 220);
    api.placeTowerAt('telegram', 900, 200);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/audit-02-towers.png', fullPage: true });

  await page.evaluate(() => {
    window.__AGENT_BTD__.startWave();
    window.__AGENT_BTD__.getState().gameSpeed = 2;
  });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/screenshots/audit-03-action.png', fullPage: true });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/screenshots/audit-04-more-action.png', fullPage: true });

  await page.evaluate(() => {
    const s = window.__AGENT_BTD__.getState();
    s.towers[0].level = 4;
    s.towers[0].range = 250;
    s.towers[0].dmg = 10;
    s.cash = 99999;
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/audit-05-upgraded.png', fullPage: true });

  await browser.close();
  console.log('Done - 5 screenshots captured');
})();
