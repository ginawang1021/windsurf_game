import { test, expect } from '@playwright/test';
import { GameHelpers } from './utils/gameHelpers.js';

test.describe('Performance and Load Tests', () => {
  let gameHelpers;

  test.beforeEach(async ({ page }) => {
    gameHelpers = new GameHelpers(page);
    await page.goto('/');
    await gameHelpers.waitForGameInitialization();
  });

  test('should maintain smooth gameplay under normal conditions', async ({ page }) => {
    const startTime = Date.now();
    let frameCount = 0;

    await page.evaluate(() => {
      window.testFrameCount = 0;
      const originalRequestAnimationFrame = window.requestAnimationFrame;
      window.requestAnimationFrame = function(callback) {
        window.testFrameCount++;
        return originalRequestAnimationFrame(callback);
      };
    });

    await gameHelpers.simulateGameplayFor(5000);

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    frameCount = await page.evaluate(() => window.testFrameCount);
    const fps = (frameCount / duration) * 1000;

    expect(fps).toBeGreaterThan(30);
  });

  test('should handle maximum player cells without performance degradation', async ({ page }) => {
    const maxPlayerCells = await gameHelpers.getMaxPlayerCells();
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ maxCells, minScore }) => {
      window.gameState.playerCells = [];
      for (let i = 0; i < maxCells; i++) {
        window.gameState.playerCells.push({
          x: 1000 + (i % 4) * 50,
          y: 1000 + Math.floor(i / 4) * 50,
          score: minScore + 10,
          velocityX: Math.random() * 2 - 1,
          velocityY: Math.random() * 2 - 1
        });
      }
    }, { maxCells: maxPlayerCells, minScore: minSplitScore });

    const startTime = Date.now();
    await gameHelpers.simulateGameplayFor(3000);
    const endTime = Date.now();

    const actualDuration = endTime - startTime;
    expect(actualDuration).toBeLessThan(4000);

    const finalCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(finalCellCount).toBeLessThanOrEqual(maxPlayerCells);
  });

  test('should handle high entity count without crashes', async ({ page }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        window.gameState.food.push({
          x: Math.random() * window.WORLD_SIZE,
          y: Math.random() * window.WORLD_SIZE,
          color: `hsl(${Math.random() * 360}, 50%, 50%)`
        });
      }
      
      for (let i = 0; i < 5; i++) {
        window.gameState.aiPlayers.push({
          x: Math.random() * window.WORLD_SIZE,
          y: Math.random() * window.WORLD_SIZE,
          score: 50 + Math.random() * 100,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          direction: Math.random() * Math.PI * 2,
          name: `TestAI${i}`
        });
      }
    });

    await gameHelpers.simulateGameplayFor(4000);

    const gameState = await gameHelpers.getGameState();
    expect(gameState.playerCells).toBeDefined();
    expect(gameState.aiPlayers).toBeDefined();
    expect(gameState.food).toBeDefined();
  });

  test('should maintain consistent frame rate during extended gameplay', async ({ page }) => {
    const measurements = [];
    
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.testFrameCount = 0;
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function(callback) {
          window.testFrameCount++;
          return originalRequestAnimationFrame(callback);
        };
      });

      const startTime = Date.now();
      await gameHelpers.simulateGameplayFor(2000);
      const endTime = Date.now();
      
      const frameCount = await page.evaluate(() => window.testFrameCount);
      const fps = (frameCount / (endTime - startTime)) * 1000;
      measurements.push(fps);
      
      await page.waitForTimeout(500);
    }

    const avgFps = measurements.reduce((sum, fps) => sum + fps, 0) / measurements.length;
    const fpsVariation = Math.max(...measurements) - Math.min(...measurements);

    expect(avgFps).toBeGreaterThan(10);
    expect(fpsVariation).toBeLessThan(50);
  });

  test('should handle memory efficiently during long gameplay sessions', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    await gameHelpers.simulateGameplayFor(10000);

    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
      
      expect(memoryIncreasePercent).toBeLessThan(200);
    }

    const gameState = await gameHelpers.getGameState();
    expect(gameState.playerCells.length).toBeLessThanOrEqual(await gameHelpers.getMaxPlayerCells());
  });

  test('should recover from temporary performance spikes', async ({ page }) => {
    await page.evaluate(() => {
      const heavyComputation = () => {
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.random();
        }
        return result;
      };
      
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          heavyComputation();
        }
      }, 1000);
    });

    await gameHelpers.simulateGameplayFor(3000);

    const gameState = await gameHelpers.getGameState();
    expect(gameState.playerCells).toBeDefined();
    expect(gameState.playerCells.length).toBeGreaterThan(0);
  });
});
