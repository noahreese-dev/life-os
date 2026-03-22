const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const gamePath = path.resolve(__dirname, 'game', 'index.html').split(path.sep).join('/');
  await page.goto('file:///' + gamePath);
  await page.waitForTimeout(1500);

  // Place towers at known-valid positions far from path
  const placed = await page.evaluate(() => {
    const api = window.__AGENT_BTD__;
    const s = api.getState();
    const positions = [
      ['cos',    850, 120],
      ['ali',    400, 300],
      ['jung',   150, 370],
      ['hassan',  560, 340],
      ['garage', 1000, 400],
      ['im',     1300, 200],
      ['ultra',  700, 100],
      ['daily',  200, 130],
      ['health', 1150, 700],
      ['telegram', 100, 680],
    ];
    let count = 0;
    for (const [type, x, y] of positions) {
      api.placeTowerAt(type, x, y);
      if (s.towers.length > count) count = s.towers.length;
    }
    // Upgrade all towers to level 3 for glow
    s.towers.forEach(t => { t.level = 3; t.range = Math.round(t.range * 1.4); t.dmg += 4; });
    s.cash = 50000;
    return s.towers.length;
  });
  console.log('Towers placed:', placed);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/showcase-01-towers.png', fullPage: true });

  // Start wave
  await page.evaluate(() => {
    window.__AGENT_BTD__.startWave();
    window.__AGENT_BTD__.getState().gameSpeed = 2;
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/screenshots/showcase-02-combat.png', fullPage: true });

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/screenshots/showcase-03-intense.png', fullPage: true });

  // More rounds
  await page.evaluate(() => { 
    const s = window.__AGENT_BTD__.getState();
    if (!s.waveActive) window.__AGENT_BTD__.startWave();
    s.gameSpeed = 3;
  });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/showcase-04-late.png', fullPage: true });

  await browser.close();
  console.log('Done - 4 showcase screenshots');
})();
