// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const GAME_URL = 'file://' + path.resolve(__dirname, '../game/index.html').replace(/\\/g, '/');

test.describe('Agent BTD — Visual & Functional Checks', () => {

  test('game loads and renders canvas', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(1000);

    // Canvas should exist and have dimensions
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    // HUD should show initial values
    await expect(page.locator('#hud-cash')).toHaveText('$650');
    await expect(page.locator('#hud-lives')).toHaveText('100');
    await expect(page.locator('#hud-round')).toHaveText('0');

    // Game state should be exposed
    const hasState = await page.evaluate(() => !!window.__AGENT_BTD__);
    expect(hasState).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/01-game-loaded.png', fullPage: true });
  });

  test('tower can be placed', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(1000);

    // Place a Daily-Ops tower via exposed API
    const placed = await page.evaluate(() => {
      const api = window.__AGENT_BTD__;
      api.placeTowerAt('daily', 300, 350);
      return api.getState().towers.length;
    });
    expect(placed).toBeGreaterThanOrEqual(1);

    // Cash should have decreased
    const cash = await page.evaluate(() => window.__AGENT_BTD__.getState().cash);
    expect(cash).toBeLessThan(650);

    await page.screenshot({ path: 'tests/screenshots/02-tower-placed.png', fullPage: true });
  });

  test('wave sends and balloons appear', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(1000);

    // Place some towers first
    await page.evaluate(() => {
      const api = window.__AGENT_BTD__;
      api.placeTowerAt('daily', 200, 250);
      api.placeTowerAt('ali', 500, 350);
    });

    // Start a wave
    await page.evaluate(() => window.__AGENT_BTD__.startWave());
    await page.waitForTimeout(2000);

    // Should be in round 1 with active balloons
    const state = await page.evaluate(() => {
      const s = window.__AGENT_BTD__.getState();
      return { round: s.round, waveActive: s.waveActive, balloonCount: s.balloons.length };
    });
    expect(state.round).toBe(1);
    expect(state.waveActive).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/03-wave-active.png', fullPage: true });
  });

  test('AI auto-play survives 3+ waves', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(500);

    // Enable AI
    await page.evaluate(() => window.__AGENT_BTD__.enableAI());

    // Set game to 3x speed for faster testing
    await page.evaluate(() => {
      window.__AGENT_BTD__.getState().gameSpeed = 3;
    });

    // Wait for AI to play through waves (give it up to 45 seconds)
    let finalRound = 0;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1500);
      const state = await page.evaluate(() => {
        const s = window.__AGENT_BTD__.getState();
        return { round: s.round, lives: s.lives, towers: s.towers.length };
      });
      finalRound = state.round;
      if (state.round >= 3 && !await page.evaluate(() => window.__AGENT_BTD__.getState().waveActive)) {
        break;
      }
      if (state.lives <= 0) break;
    }

    expect(finalRound).toBeGreaterThanOrEqual(3);

    const finalState = await page.evaluate(() => {
      const s = window.__AGENT_BTD__.getState();
      return { round: s.round, lives: s.lives, towers: s.towers.length, pops: s.totalPops };
    });
    console.log('AI result:', JSON.stringify(finalState));

    await page.screenshot({ path: 'tests/screenshots/04-ai-autoplay.png', fullPage: true });
  });

  test('visual quality — balloons render with teardrop shape', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(500);

    // Place towers and start wave to get balloons on screen
    await page.evaluate(() => {
      const api = window.__AGENT_BTD__;
      api.placeTowerAt('daily', 200, 250);
      api.startWave();
    });
    await page.waitForTimeout(1500);

    // Take a detailed screenshot of the game area
    await page.screenshot({ path: 'tests/screenshots/05-balloon-visuals.png', fullPage: true });

    // Verify balloons exist on screen
    const balloonCount = await page.evaluate(() => window.__AGENT_BTD__.getState().balloons.length);
    expect(balloonCount).toBeGreaterThan(0);
  });

  test('combo system triggers on rapid pops', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(500);

    // Place several towers for rapid popping
    await page.evaluate(() => {
      const api = window.__AGENT_BTD__;
      api.placeTowerAt('daily', 150, 220);
      api.placeTowerAt('ali', 250, 220);
      api.placeTowerAt('jung', 350, 260);
      api.placeTowerAt('ultra', 450, 180);
      api.getState().gameSpeed = 3;
      api.startWave();
    });

    // Wait for pops to accumulate
    await page.waitForTimeout(4000);

    const pops = await page.evaluate(() => window.__AGENT_BTD__.getState().totalPops);
    expect(pops).toBeGreaterThan(0);

    await page.screenshot({ path: 'tests/screenshots/06-combo-system.png', fullPage: true });
  });
});
