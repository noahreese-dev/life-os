const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const gamePath = path.resolve(__dirname, 'game', 'index.html').split(path.sep).join('/');
  await page.goto('file:///' + gamePath);
  await page.waitForTimeout(1500);

  // Place towers at valid positions (off-path)
  await page.evaluate(() => {
    const api = window.__AGENT_BTD__;
    api.placeTowerAt('cos', 220, 310);
    api.placeTowerAt('ali', 380, 250);
    api.placeTowerAt('jung', 520, 200);
    api.placeTowerAt('hassan', 680, 230);
    api.placeTowerAt('garage', 320, 380);
    api.placeTowerAt('im', 600, 380);
    api.placeTowerAt('ultra', 160, 150);
    api.placeTowerAt('daily', 450, 150);
    api.placeTowerAt('health', 780, 350);
    // Give lots of cash for upgrades
    const s = api.getState();
    s.cash = 50000;
    // Upgrade some towers
    s.towers.forEach(t => { t.level = 3; t.range *= 1.3; t.dmg += 3; });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/final-01-towers.png', fullPage: true });

  // Start wave at 3x speed
  await page.evaluate(() => {
    window.__AGENT_BTD__.startWave();
    window.__AGENT_BTD__.getState().gameSpeed = 3;
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/final-02-combat.png', fullPage: true });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/screenshots/final-03-intense.png', fullPage: true });

  // Round 2
  await page.evaluate(() => { if (!window.__AGENT_BTD__.getState().waveActive) window.__AGENT_BTD__.startWave(); });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/screenshots/final-04-round2.png', fullPage: true });

  await browser.close();
  console.log('Done - 4 final screenshots');
})();
