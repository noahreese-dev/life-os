const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const gamePath = path.resolve(__dirname, 'game', 'index.html').split(path.sep).join('/');
  await page.goto('file:///' + gamePath);
  await page.waitForTimeout(1500);

  // Find STRATEGIC valid positions near the path (high coverage)
  const result = await page.evaluate(() => {
    const api = window.__AGENT_BTD__;
    const s = api.getState();
    s.cash = 999999;
    
    // Scan grid for valid positions, score by path coverage
    const valid = [];
    for (let x = 60; x < 1500; x += 40) {
      for (let y = 80; y < 850; y += 40) {
        const before = s.towers.length;
        api.placeTowerAt('daily', x, y);
        if (s.towers.length > before) {
          valid.push({x, y});
          s.towers.pop();
          s.cash += 200;
        }
      }
    }
    
    // Pick 10 spread-out positions
    const picks = [];
    const types = ['cos','ali','jung','hassan','garage','im','ultra','daily','health','social'];
    const zones = [
      {minX:100,maxX:300,minY:100,maxY:400},
      {minX:300,maxX:500,minY:100,maxY:350},
      {minX:500,maxX:700,minY:100,maxY:350},
      {minX:700,maxX:900,minY:200,maxY:500},
      {minX:600,maxX:800,minY:400,maxY:600},
      {minX:400,maxX:600,minY:400,maxY:600},
      {minX:200,maxX:400,minY:400,maxY:650},
      {minX:100,maxX:300,minY:550,maxY:750},
      {minX:400,maxX:700,minY:600,maxY:800},
      {minX:800,maxX:1100,minY:500,maxY:750},
    ];
    
    for (let z = 0; z < zones.length; z++) {
      const zone = zones[z];
      const inZone = valid.filter(v => v.x >= zone.minX && v.x <= zone.maxX && v.y >= zone.minY && v.y <= zone.maxY);
      if (inZone.length > 0) {
        const spot = inZone[Math.floor(inZone.length / 2)]; // middle of zone
        s.cash = 999999;
        api.placeTowerAt(types[z], spot.x, spot.y);
        picks.push({type: types[z], x: spot.x, y: spot.y, placed: s.towers.length});
      }
    }
    
    // Upgrade all to level 3
    s.towers.forEach(t => { t.level = 3; t.range = Math.round(t.range * 1.3); t.dmg += 3; });
    s.cash = 50000;
    
    return { placed: s.towers.length, picks };
  });
  console.log('Towers placed:', result.placed, result.picks.map(p => p.type + '@' + p.x + ',' + p.y));
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/showcase-01-towers.png', fullPage: true });

  // Wave 1
  await page.evaluate(() => {
    window.__AGENT_BTD__.startWave();
    window.__AGENT_BTD__.getState().gameSpeed = 2;
  });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/screenshots/showcase-02-combat.png', fullPage: true });

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/showcase-03-intense.png', fullPage: true });

  // Wave 2
  await page.evaluate(() => {
    const s = window.__AGENT_BTD__.getState();
    if (!s.waveActive) window.__AGENT_BTD__.startWave();
  });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'tests/screenshots/showcase-04-round2.png', fullPage: true });

  await browser.close();
  console.log('Done');
})();
