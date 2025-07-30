export class GameHelpers {
  constructor(page) {
    this.page = page;
  }

  async waitForGameInitialization() {
    await this.page.waitForFunction(() => {
      return window.gameState && 
             window.gameState.playerCells && 
             window.gameState.playerCells.length > 0 &&
             window.gameState.food && 
             window.gameState.food.length > 0 &&
             window.gameState.aiPlayers &&
             window.gameState.aiPlayers.length > 0;
    }, { timeout: 10000 });
  }

  async getGameState() {
    return await this.page.evaluate(() => window.gameState);
  }

  async getMousePosition() {
    return await this.page.evaluate(() => window.mouse);
  }

  async getWorldSize() {
    return await this.page.evaluate(() => window.WORLD_SIZE);
  }

  async getMinSplitScore() {
    return await this.page.evaluate(() => window.MIN_SPLIT_SCORE);
  }

  async getMaxPlayerCells() {
    return await this.page.evaluate(() => window.MAX_PLAYER_CELLS);
  }

  async moveMouseTo(x, y) {
    await this.page.mouse.move(x, y);
    await this.page.waitForTimeout(100);
  }

  async clickToSplit() {
    const canvas = this.page.locator('#gameCanvas');
    await canvas.click();
    await this.page.waitForTimeout(200);
  }

  async getPlayerCells() {
    return await this.page.evaluate(() => window.gameState.playerCells);
  }

  async getAIPlayers() {
    return await this.page.evaluate(() => window.gameState.aiPlayers);
  }

  async getFood() {
    return await this.page.evaluate(() => window.gameState.food);
  }

  async getTotalPlayerScore() {
    return await this.page.evaluate(() => {
      return window.gameState.playerCells.reduce((total, cell) => total + cell.score, 0);
    });
  }

  async waitForScoreChange(initialScore, timeout = 5000) {
    await this.page.waitForFunction(
      (expectedScore) => {
        const currentScore = window.gameState.playerCells.reduce((total, cell) => total + cell.score, 0);
        return currentScore !== expectedScore;
      },
      initialScore,
      { timeout }
    );
  }

  async waitForCellCountChange(initialCount, timeout = 3000) {
    await this.page.waitForFunction(
      (expectedCount) => window.gameState.playerCells.length !== expectedCount,
      initialCount,
      { timeout }
    );
  }

  async simulateGameplayFor(durationMs) {
    const endTime = Date.now() + durationMs;
    while (Date.now() < endTime) {
      const x = Math.random() * 800 + 100;
      const y = Math.random() * 600 + 100;
      await this.moveMouseTo(x, y);
      
      if (Math.random() < 0.3) {
        await this.clickToSplit();
      }
      
      await this.page.waitForTimeout(100);
    }
  }

  async getLeaderboardData() {
    return await this.page.evaluate(() => {
      const leaderboardElement = document.getElementById('leaderboard-content');
      return leaderboardElement ? leaderboardElement.textContent : '';
    });
  }

  async isPlayerCellWithinBounds() {
    const worldSize = await this.getWorldSize();
    const playerCells = await this.getPlayerCells();
    
    return playerCells.every(cell => 
      cell.x >= 0 && cell.x <= worldSize && 
      cell.y >= 0 && cell.y <= worldSize
    );
  }
}
