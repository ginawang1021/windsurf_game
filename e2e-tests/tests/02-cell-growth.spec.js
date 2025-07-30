import { test, expect } from '@playwright/test';
import { GameHelpers } from './utils/gameHelpers.js';

test.describe('Cell Growth Tests', () => {
  let gameHelpers;

  test.beforeEach(async ({ page }) => {
    gameHelpers = new GameHelpers(page);
    await page.goto('/');
    await gameHelpers.waitForGameInitialization();
  });

  test('should increase player score when consuming food', async ({ page }) => {
    const initialScore = await gameHelpers.getTotalPlayerScore();
    const initialFoodCount = (await gameHelpers.getFood()).length;

    await gameHelpers.simulateGameplayFor(3000);

    const finalScore = await gameHelpers.getTotalPlayerScore();
    const finalFoodCount = (await gameHelpers.getFood()).length;

    expect(finalScore).toBeGreaterThan(initialScore);
    expect(finalFoodCount).toBeLessThan(initialFoodCount);
  });

  test('should spawn new food when consumed', async ({ page }) => {
    const initialFoodCount = (await gameHelpers.getFood()).length;

    await gameHelpers.simulateGameplayFor(5000);

    const finalFoodCount = (await gameHelpers.getFood()).length;
    expect(finalFoodCount).toBeGreaterThanOrEqual(initialFoodCount * 0.8);
  });

  test('should update leaderboard when score changes', async ({ page }) => {
    const initialLeaderboard = await gameHelpers.getLeaderboardData();
    const initialScore = await gameHelpers.getTotalPlayerScore();

    await gameHelpers.simulateGameplayFor(4000);

    const finalScore = await gameHelpers.getTotalPlayerScore();
    const finalLeaderboard = await gameHelpers.getLeaderboardData();

    if (finalScore > initialScore) {
      expect(finalLeaderboard).not.toBe(initialLeaderboard);
    }
  });

  test('should maintain food distribution across world', async ({ page }) => {
    const worldSize = await gameHelpers.getWorldSize();
    const food = await gameHelpers.getFood();

    const foodInQuadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };

    food.forEach(item => {
      if (item.x < worldSize / 2 && item.y < worldSize / 2) {
        foodInQuadrants.topLeft++;
      } else if (item.x >= worldSize / 2 && item.y < worldSize / 2) {
        foodInQuadrants.topRight++;
      } else if (item.x < worldSize / 2 && item.y >= worldSize / 2) {
        foodInQuadrants.bottomLeft++;
      } else {
        foodInQuadrants.bottomRight++;
      }
    });

    const totalFood = food.length;
    const expectedPerQuadrant = totalFood / 4;
    const tolerance = expectedPerQuadrant * 0.5;

    Object.values(foodInQuadrants).forEach(count => {
      expect(count).toBeGreaterThan(expectedPerQuadrant - tolerance);
      expect(count).toBeLessThan(expectedPerQuadrant + tolerance);
    });
  });

  test('should handle rapid food consumption', async ({ page }) => {
    const initialScore = await gameHelpers.getTotalPlayerScore();

    await page.evaluate(() => {
      const playerCell = window.gameState.playerCells[0];
      const nearbyFood = window.gameState.food.filter(food => {
        const distance = Math.sqrt(
          Math.pow(food.x - playerCell.x, 2) + Math.pow(food.y - playerCell.y, 2)
        );
        return distance < 100;
      });

      nearbyFood.forEach(food => {
        food.x = playerCell.x;
        food.y = playerCell.y;
      });
    });

    await page.waitForTimeout(1000);

    const finalScore = await gameHelpers.getTotalPlayerScore();
    expect(finalScore).toBeGreaterThan(initialScore);
  });
});
