const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const gamePath = path.resolve(__dirname, 'game', 'index.html').split(path.sep).join('/');
  await page.goto('file:///' + gamePath);
  await page.waitForTimeout(1500);

  // Find valid positions by grid scanning
  const spots = await page.evaluate(() => {
    const api = window.__AGENT_BTD__;
    const valid = [];
    for (let x = 60; x < 1500; x += 60) {
      for (let y = 80; y < 850; y += 60) {
        // Test if tower can be placed here (use internal canPlace check)
        api.getState().placingTower = 'daily';
        // We can't call canPlaceTower directly, but we can try placing
        const before = api.getState().towers.length;
        api.getState().cash = 99999;
        api.placeTowerAt('daily', x, y);
        if (api.getState().towers.length > before) {
          valid.push({x, y});
          // Remove the test tower
          api.getState().towers.pop();
        }
      }
    }
    return valid.slice(0, 20);
  });
  console.log('Valid spots found:', spots.length);
  console.log(JSON.stringify(spots.slice(0, 12)));

  await browser.close();
})();
