import { test, expect } from '@playwright/test';
import { GameHelpers } from './utils/gameHelpers.js';

test.describe('Cell Splitting Tests', () => {
  let gameHelpers;

  test.beforeEach(async ({ page }) => {
    gameHelpers = new GameHelpers(page);
    await page.goto('/');
    await gameHelpers.waitForGameInitialization();
  });

  test('should split cell when clicking and score is above minimum', async ({ page }) => {
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ score }) => {
      window.gameState.playerCells[0].score = score + 10;
    }, { score: minSplitScore });

    const initialCellCount = (await gameHelpers.getPlayerCells()).length;
    
    await gameHelpers.clickToSplit();
    await gameHelpers.waitForCellCountChange(initialCellCount);

    const finalCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(finalCellCount).toBe(initialCellCount + 1);
  });

  test('should not split cell when score is below minimum', async ({ page }) => {
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ score }) => {
      window.gameState.playerCells[0].score = score - 10;
    }, { score: minSplitScore });

    const initialCellCount = (await gameHelpers.getPlayerCells()).length;
    
    await gameHelpers.clickToSplit();
    await page.waitForTimeout(500);

    const finalCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(finalCellCount).toBe(initialCellCount);
  });

  test('should divide score equally when splitting', async ({ page }) => {
    const minSplitScore = await gameHelpers.getMinSplitScore();
    const testScore = 100;
    
    await page.evaluate(({ score }) => {
      window.gameState.playerCells[0].score = score;
    }, { score: testScore });

    await gameHelpers.clickToSplit();
    await gameHelpers.waitForCellCountChange(1);

    const playerCells = await gameHelpers.getPlayerCells();
    expect(playerCells).toHaveLength(2);
    expect(playerCells[0].score).toBe(testScore / 2);
    expect(playerCells[1].score).toBe(testScore / 2);
  });

  test('should not exceed maximum player cells', async ({ page }) => {
    const maxPlayerCells = await gameHelpers.getMaxPlayerCells();
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ maxCells, minScore }) => {
      window.gameState.playerCells = [];
      for (let i = 0; i < maxCells; i++) {
        window.gameState.playerCells.push({
          x: 1000 + i * 10,
          y: 1000 + i * 10,
          score: minScore + 10,
          velocityX: 0,
          velocityY: 0
        });
      }
    }, { maxCells: maxPlayerCells, minScore: minSplitScore });

    await gameHelpers.clickToSplit();
    await page.waitForTimeout(500);

    const finalCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(finalCellCount).toBe(maxPlayerCells);
  });

  test('should apply split velocity to new cells', async ({ page }) => {
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ score }) => {
      window.gameState.playerCells[0].score = score + 50;
      window.gameState.playerCells[0].x = 1000;
      window.gameState.playerCells[0].y = 1000;
    }, { score: minSplitScore });

    await gameHelpers.moveMouseTo(600, 400);
    await gameHelpers.clickToSplit();
    await gameHelpers.waitForCellCountChange(1);

    const playerCells = await gameHelpers.getPlayerCells();
    expect(playerCells).toHaveLength(2);

    const hasVelocity = playerCells.some(cell => 
      Math.abs(cell.velocityX) > 0 || Math.abs(cell.velocityY) > 0
    );
    expect(hasVelocity).toBe(true);
  });

  test('should handle multiple rapid splits', async ({ page }) => {
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ score }) => {
      window.gameState.playerCells[0].score = score * 4;
    }, { score: minSplitScore });

    await gameHelpers.clickToSplit();
    await gameHelpers.waitForCellCountChange(1);
    
    await gameHelpers.clickToSplit();
    await page.waitForTimeout(300);
    
    await gameHelpers.clickToSplit();
    await page.waitForTimeout(300);

    const finalCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(finalCellCount).toBeGreaterThan(1);
    expect(finalCellCount).toBeLessThanOrEqual(await gameHelpers.getMaxPlayerCells());
  });

  test('should merge cells back together over time', async ({ page }) => {
    const minSplitScore = await gameHelpers.getMinSplitScore();
    
    await page.evaluate(({ score }) => {
      window.gameState.playerCells[0].score = score + 50;
    }, { score: minSplitScore });

    await gameHelpers.clickToSplit();
    await gameHelpers.waitForCellCountChange(1);

    const splitCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(splitCellCount).toBe(2);

    await page.waitForTimeout(15000);

    const mergedCellCount = (await gameHelpers.getPlayerCells()).length;
    expect(mergedCellCount).toBeLessThan(splitCellCount);
  });
});
