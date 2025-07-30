# End-to-End Tests for Windsurf Game

This directory contains comprehensive E2E tests for the windsurf game using Playwright.

## Setup

The E2E tests are automatically configured to start the Flask backend server before running tests.

## Running Tests

From the repository root:

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
cd e2e-tests && npx playwright test tests/01-player-movement.spec.js
```

## Test Structure

### 1. Player Movement Tests (`01-player-movement.spec.js`)
- Mouse tracking and player cell position updates
- Movement towards mouse cursor
- Boundary constraint validation
- Speed variation based on cell size
- Mouse position synchronization

### 2. Cell Growth Tests (`02-cell-growth.spec.js`)
- Food consumption and score increases
- Food respawning mechanics
- Leaderboard updates
- Food distribution across world
- Rapid consumption handling

### 3. Cell Splitting Tests (`03-cell-splitting.spec.js`)
- Split functionality with minimum score requirements
- Score division mechanics
- Maximum cell limit enforcement
- Split velocity application
- Cell merging over time

### 4. Multi-player Interaction Tests (`04-multiplayer-interactions.spec.js`)
- AI player movement
- Player-AI collision handling
- AI-AI interactions
- Boundary constraints for AI
- AI respawning
- Leaderboard integration

### 5. Performance and Load Tests (`05-performance-load.spec.js`)
- Frame rate consistency
- Maximum entity handling
- Extended gameplay sessions
- Memory efficiency
- Performance spike recovery

## Test Utilities

The `utils/gameHelpers.js` file provides helper functions for:
- Game state access via exposed window objects
- Mouse movement simulation
- Cell splitting actions
- Score and entity monitoring
- Gameplay simulation

## Exposed Game State

Tests leverage the following exposed variables:
- `window.gameState` - Complete game state
- `window.mouse` - Mouse position
- `window.WORLD_SIZE` - World boundaries
- `window.MIN_SPLIT_SCORE` - Minimum score for splitting
- `window.MAX_PLAYER_CELLS` - Maximum player cells

## Configuration

Playwright configuration is in `playwright.config.js` with:
- Automatic Flask server startup
- Chrome browser testing
- Screenshot/video capture on failures
- Trace collection for debugging
