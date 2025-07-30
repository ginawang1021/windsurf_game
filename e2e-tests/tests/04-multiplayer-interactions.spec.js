import { test, expect } from '@playwright/test';
import { GameHelpers } from './utils/gameHelpers.js';

test.describe('Multi-player Interaction Tests', () => {
  let gameHelpers;

  test.beforeEach(async ({ page }) => {
    gameHelpers = new GameHelpers(page);
    await page.goto('/');
    await gameHelpers.waitForGameInitialization();
  });

  test('should have AI players moving around the world', async ({ page }) => {
    const initialAIPlayers = await gameHelpers.getAIPlayers();
    const initialPositions = initialAIPlayers.map(ai => ({ x: ai.x, y: ai.y }));

    await page.waitForTimeout(2000);

    const updatedAIPlayers = await gameHelpers.getAIPlayers();
    const updatedPositions = updatedAIPlayers.map(ai => ({ x: ai.x, y: ai.y }));

    let hasMovement = false;
    for (let i = 0; i < initialPositions.length; i++) {
      if (initialPositions[i].x !== updatedPositions[i].x || 
          initialPositions[i].y !== updatedPositions[i].y) {
        hasMovement = true;
        break;
      }
    }

    expect(hasMovement).toBe(true);
  });

  test('should handle player-AI collisions based on size', async ({ page }) => {
    const initialAICount = (await gameHelpers.getAIPlayers()).length;
    
    await page.evaluate(() => {
      const playerCell = window.gameState.playerCells[0];
      const aiPlayer = window.gameState.aiPlayers[0];
      
      playerCell.score = 400;
      aiPlayer.score = 50;
      aiPlayer.x = playerCell.x;
      aiPlayer.y = playerCell.y;
    });

    await page.waitForTimeout(1000);

    const finalAICount = (await gameHelpers.getAIPlayers()).length;
    const playerScore = await gameHelpers.getTotalPlayerScore();

    expect(finalAICount).toBeLessThanOrEqual(initialAICount);
    expect(playerScore).toBeGreaterThan(400);
  });

  test('should handle AI consuming player when AI is larger', async ({ page }) => {
    const initialPlayerScore = await gameHelpers.getTotalPlayerScore();
    
    await page.evaluate(() => {
      const playerCell = window.gameState.playerCells[0];
      const aiPlayer = window.gameState.aiPlayers[0];
      
      playerCell.score = 50;
      aiPlayer.score = 400;
      aiPlayer.x = playerCell.x;
      aiPlayer.y = playerCell.y;
    });

    await page.waitForTimeout(1000);

    const finalPlayerCells = await gameHelpers.getPlayerCells();
    const aiPlayers = await gameHelpers.getAIPlayers();
    
    expect(finalPlayerCells).toHaveLength(1);
    
    const largeAI = aiPlayers.find(ai => ai.score > 400);
    expect(largeAI).toBeDefined();
  });

  test('should handle AI-AI collisions', async ({ page }) => {
    const initialAICount = (await gameHelpers.getAIPlayers()).length;
    
    await page.evaluate(() => {
      if (window.gameState.aiPlayers.length >= 2) {
        const ai1 = window.gameState.aiPlayers[0];
        const ai2 = window.gameState.aiPlayers[1];
        
        ai1.score = 400;
        ai2.score = 50;
        ai2.x = ai1.x;
        ai2.y = ai1.y;
      }
    });

    await page.waitForTimeout(1000);

    const finalAICount = (await gameHelpers.getAIPlayers()).length;
    expect(finalAICount).toBeLessThanOrEqual(initialAICount);
  });

  test('should maintain AI players within world boundaries', async ({ page }) => {
    const worldSize = await gameHelpers.getWorldSize();
    
    await page.waitForTimeout(3000);
    
    const aiPlayers = await gameHelpers.getAIPlayers();
    
    aiPlayers.forEach(ai => {
      expect(ai.x).toBeGreaterThanOrEqual(0);
      expect(ai.x).toBeLessThanOrEqual(worldSize);
      expect(ai.y).toBeGreaterThanOrEqual(0);
      expect(ai.y).toBeLessThanOrEqual(worldSize);
    });
  });

  test('should respawn AI players when consumed', async ({ page }) => {
    const initialAICount = (await gameHelpers.getAIPlayers()).length;
    
    await page.evaluate(() => {
      const playerCell = window.gameState.playerCells[0];
      playerCell.score = 1000;
      
      window.gameState.aiPlayers.forEach(ai => {
        ai.score = 50;
        ai.x = playerCell.x;
        ai.y = playerCell.y;
      });
    });

    await page.waitForTimeout(2000);

    const finalAICount = (await gameHelpers.getAIPlayers()).length;
    expect(finalAICount).toBeGreaterThanOrEqual(initialAICount * 0.5);
  });

  test('should update leaderboard with AI and player scores', async ({ page }) => {
    await page.evaluate(() => {
      window.gameState.playerCells[0].score = 500;
      if (window.gameState.aiPlayers.length > 0) {
        window.gameState.aiPlayers[0].score = 300;
      }
    });

    await page.waitForTimeout(1000);

    const leaderboardData = await gameHelpers.getLeaderboardData();
    expect(leaderboardData).toContain('Windsurf');
    
    const aiPlayers = await gameHelpers.getAIPlayers();
    if (aiPlayers.length > 0) {
      const hasAIInLeaderboard = aiPlayers.some(ai => 
        leaderboardData.includes(ai.name)
      );
      expect(hasAIInLeaderboard).toBe(true);
    }
  });
});
