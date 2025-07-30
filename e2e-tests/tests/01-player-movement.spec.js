import { test, expect } from '@playwright/test';
import { GameHelpers } from './utils/gameHelpers.js';

test.describe('Player Movement Tests', () => {
  let gameHelpers;

  test.beforeEach(async ({ page }) => {
    gameHelpers = new GameHelpers(page);
    await page.goto('/');
    await gameHelpers.waitForGameInitialization();
  });

  test('should track mouse movement and update player cell position', async ({ page }) => {
    const initialPlayerCells = await gameHelpers.getPlayerCells();
    const initialPosition = { x: initialPlayerCells[0].x, y: initialPlayerCells[0].y };

    await gameHelpers.moveMouseTo(400, 300);
    await page.waitForTimeout(500);

    const updatedPlayerCells = await gameHelpers.getPlayerCells();
    const newPosition = { x: updatedPlayerCells[0].x, y: updatedPlayerCells[0].y };

    expect(newPosition.x).not.toBe(initialPosition.x);
    expect(newPosition.y).not.toBe(initialPosition.y);
  });

  test('should move player cells towards mouse cursor', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    const canvasBox = await canvas.boundingBox();
    
    const targetX = canvasBox.x + canvasBox.width * 0.75;
    const targetY = canvasBox.y + canvasBox.height * 0.25;

    const initialPlayerCells = await gameHelpers.getPlayerCells();
    const initialPosition = { x: initialPlayerCells[0].x, y: initialPlayerCells[0].y };

    await gameHelpers.moveMouseTo(targetX, targetY);
    await page.waitForTimeout(1000);

    const updatedPlayerCells = await gameHelpers.getPlayerCells();
    const newPosition = { x: updatedPlayerCells[0].x, y: updatedPlayerCells[0].y };

    const initialDistance = Math.sqrt(
      Math.pow(targetX - initialPosition.x, 2) + Math.pow(targetY - initialPosition.y, 2)
    );
    const newDistance = Math.sqrt(
      Math.pow(targetX - newPosition.x, 2) + Math.pow(targetY - newPosition.y, 2)
    );

    expect(newDistance).toBeLessThan(initialDistance);
  });

  test('should keep player cells within world boundaries', async ({ page }) => {
    const worldSize = await gameHelpers.getWorldSize();
    
    await gameHelpers.moveMouseTo(0, 0);
    await page.waitForTimeout(500);
    expect(await gameHelpers.isPlayerCellWithinBounds()).toBe(true);

    await gameHelpers.moveMouseTo(1000, 1000);
    await page.waitForTimeout(500);
    expect(await gameHelpers.isPlayerCellWithinBounds()).toBe(true);

    const playerCells = await gameHelpers.getPlayerCells();
    for (const cell of playerCells) {
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThanOrEqual(worldSize);
      expect(cell.y).toBeGreaterThanOrEqual(0);
      expect(cell.y).toBeLessThanOrEqual(worldSize);
    }
  });

  test('should apply speed based on cell size', async ({ page }) => {
    const initialPlayerCells = await gameHelpers.getPlayerCells();
    const initialScore = initialPlayerCells[0].score;

    await gameHelpers.moveMouseTo(500, 300);
    await page.waitForTimeout(300);
    
    const firstMovement = await gameHelpers.getPlayerCells();
    const firstDistance = Math.sqrt(
      Math.pow(firstMovement[0].x - initialPlayerCells[0].x, 2) + 
      Math.pow(firstMovement[0].y - initialPlayerCells[0].y, 2)
    );

    await page.evaluate(() => {
      window.gameState.playerCells[0].score = 400;
    });

    await gameHelpers.moveMouseTo(600, 400);
    await page.waitForTimeout(300);
    
    const secondMovement = await gameHelpers.getPlayerCells();
    const secondDistance = Math.sqrt(
      Math.pow(secondMovement[0].x - firstMovement[0].x, 2) + 
      Math.pow(secondMovement[0].y - firstMovement[0].y, 2)
    );

    expect(firstDistance).toBeGreaterThan(secondDistance);
  });

  test('should update mouse position in game state', async ({ page }) => {
    await gameHelpers.moveMouseTo(300, 200);
    await page.waitForTimeout(100);

    const mousePosition = await gameHelpers.getMousePosition();
    expect(mousePosition.x).toBe(300);
    expect(mousePosition.y).toBe(200);
  });
});
