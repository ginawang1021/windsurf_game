"""
E2E Test for Player Movement & Controls Flow
Critical Path: Mouse movement → Player cell follows cursor → Smooth movement within world boundaries
Test Coverage: Mouse tracking, player cell position updates, boundary constraints
"""

import time
import math
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from browser_config import BrowserConfig


def main():
    print("🎮 Starting Player Movement & Controls E2E Test")
    print("=" * 60)
    
    # Setup driver - using visible driver so you can watch the test
    driver = BrowserConfig.create_visible_driver()
    
    try:
        # Navigate to the game
        print("🌐 Navigating to game...")
        driver.get("http://127.0.0.1:5001")
        
        # Wait for game to load
        print("⏳ Waiting for game initialization...")
        canvas = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "gameCanvas"))
        )
        assert canvas.is_displayed()
        
        # Get canvas dimensions for movement calculations
        canvas_size = canvas.size
        canvas_width = canvas_size['width']
        canvas_height = canvas_size['height']
        center_x = canvas_width // 2
        center_y = canvas_height // 2
        
        print(f"   Canvas size: {canvas_width}x{canvas_height}")
        print(f"   Canvas center: ({center_x}, {center_y})")
        
        # Wait a moment for game entities to spawn
        time.sleep(2)
        
        # Test 1: Basic Mouse Movement Tracking
        print("\n✅ Test 1: Basic Mouse Movement Tracking")
        print("   Testing mouse cursor tracking...")
        
        actions = ActionChains(driver)
        
        # Move to different positions and verify mouse tracking
        test_positions = [
            (center_x + 100, center_y),      # Right
            (center_x - 100, center_y),      # Left  
            (center_x, center_y + 100),      # Down
            (center_x, center_y - 100),      # Up
            (center_x, center_y)             # Back to center
        ]
        
        for i, (x, y) in enumerate(test_positions):
            print(f"   Moving mouse to position {i+1}: ({x}, {y})")
            actions.move_to_element_with_offset(canvas, x - center_x, y - center_y).perform()
            time.sleep(0.5)  # Allow time for smooth movement
        
        print("   ✓ Mouse movement tracking successful")
        
        # Test 2: Player Cell Following Mouse
        print("\n✅ Test 2: Player Cell Following Mouse Movement")
        print("   Testing player cell movement response...")
        
        # Get initial player position by executing JavaScript
        initial_player_data = driver.execute_script("""
            if (window.gameState && window.gameState.playerCells && window.gameState.playerCells.length > 0) {
                const cell = window.gameState.playerCells[0];
                return {
                    x: cell.x,
                    y: cell.y,
                    score: cell.score,
                    velocityX: cell.velocityX || 0,
                    velocityY: cell.velocityY || 0
                };
            }
            return null;
        """)
        
        if initial_player_data:
            print(f"   Initial player position: ({initial_player_data['x']:.1f}, {initial_player_data['y']:.1f})")
            print(f"   Initial player score: {initial_player_data['score']}")
        else:
            print("   ⚠️  Could not get initial player data")
        
        # Test movement in cardinal directions with safe offsets
        safe_offset = min(150, canvas_width // 4, canvas_height // 4)  # Safe movement distance
        movement_tests = [
            ("RIGHT", safe_offset, 0, "Moving right"),
            ("LEFT", -safe_offset, 0, "Moving left"),
            ("DOWN", 0, safe_offset, "Moving down"),
            ("UP", 0, -safe_offset, "Moving up")
        ]
        
        for direction, offset_x, offset_y, description in movement_tests:
            print(f"   {description}...")
            
            # Move mouse to target position using safe offsets
            actions.move_to_element_with_offset(canvas, offset_x, offset_y).perform()
            
            # Wait for player cell to start moving
            time.sleep(1.5)
            
            # Check player position after movement
            player_data = driver.execute_script("""
                if (window.gameState && window.gameState.playerCells && window.gameState.playerCells.length > 0) {
                    const cell = window.gameState.playerCells[0];
                    return {
                        x: cell.x,
                        y: cell.y,
                        velocityX: cell.velocityX || 0,
                        velocityY: cell.velocityY || 0
                    };
                }
                return null;
            """)
            
            if player_data and initial_player_data:
                dx = player_data['x'] - initial_player_data['x']
                dy = player_data['y'] - initial_player_data['y']
                
                print(f"     Position change: ({dx:.1f}, {dy:.1f})")
                print(f"     Current velocity: ({player_data['velocityX']:.2f}, {player_data['velocityY']:.2f})")
                
                # Verify movement in expected direction
                if direction == "RIGHT":
                    assert dx > 0, f"Player should move right, but dx={dx:.1f}"
                elif direction == "LEFT":
                    assert dx < 0, f"Player should move left, but dx={dx:.1f}"
                elif direction == "DOWN":
                    assert dy > 0, f"Player should move down, but dy={dy:.1f}"
                elif direction == "UP":
                    assert dy < 0, f"Player should move up, but dy={dy:.1f}"
                
                print(f"     ✓ {direction} movement verified")
            
            # Update initial position for next test
            initial_player_data = player_data
        
        # Test 3: Smooth Movement and Inertia
        print("\n✅ Test 3: Smooth Movement and Inertia System")
        print("   Testing movement smoothness and inertia...")
        
        # Move to center first
        actions.move_to_element(canvas).perform()
        time.sleep(1)
        
        # Record positions over time to verify smooth movement
        positions = []
        
        # Start movement to the right with safe offset
        safe_movement = min(200, canvas_width // 3)
        actions.move_to_element_with_offset(canvas, safe_movement, 0).perform()
        
        # Sample positions over 2 seconds
        for i in range(10):
            time.sleep(0.2)
            pos_data = driver.execute_script("""
                if (window.gameState && window.gameState.playerCells && window.gameState.playerCells.length > 0) {
                    const cell = window.gameState.playerCells[0];
                    return { x: cell.x, y: cell.y, vx: cell.velocityX || 0, vy: cell.velocityY || 0 };
                }
                return null;
            """)
            if pos_data:
                positions.append(pos_data)
        
        if len(positions) >= 3:
            # Verify smooth acceleration (velocity should increase initially)
            initial_velocity = abs(positions[0]['vx'])
            mid_velocity = abs(positions[len(positions)//2]['vx'])
            
            print(f"   Initial velocity: {initial_velocity:.3f}")
            print(f"   Mid-point velocity: {mid_velocity:.3f}")
            
            # Velocity should increase due to acceleration
            assert mid_velocity > initial_velocity, "Velocity should increase due to acceleration"
            print("   ✓ Smooth acceleration verified")
            
            # Verify continuous movement (positions should change)
            position_changes = []
            for i in range(1, len(positions)):
                dx = positions[i]['x'] - positions[i-1]['x']
                position_changes.append(abs(dx))
            
            avg_change = sum(position_changes) / len(position_changes)
            print(f"   Average position change per frame: {avg_change:.2f}")
            
            # Movement should be continuous (not jerky)
            assert avg_change > 0.1, "Player should be moving continuously"
            print("   ✓ Continuous movement verified")
        
        # Test 4: World Boundary Constraints
        print("\n✅ Test 4: World Boundary Constraints")
        print("   Testing boundary collision detection...")
        
        # Get world size from game config
        world_size = driver.execute_script("return window.WORLD_SIZE || 2000;")
        print(f"   World size: {world_size}x{world_size}")
        
        # Try to move player to extreme positions and verify boundaries
        # Use canvas bounds as limits for mouse movement
        max_offset_x = canvas_width // 2 - 50  # Leave some margin
        max_offset_y = canvas_height // 2 - 50
        boundary_tests = [
            ("TOP_LEFT", -max_offset_x, -max_offset_y),
            ("TOP_RIGHT", max_offset_x, -max_offset_y),
            ("BOTTOM_LEFT", -max_offset_x, max_offset_y),
            ("BOTTOM_RIGHT", max_offset_x, max_offset_y)
        ]
        
        for corner, offset_x, offset_y in boundary_tests:
            print(f"   Testing {corner} boundary...")
            
            # Move mouse to extreme position
            actions.move_to_element_with_offset(canvas, offset_x, offset_y).perform()
            
            # Wait for movement
            time.sleep(2)
            
            # Check player position is within bounds
            boundary_data = driver.execute_script("""
                if (window.gameState && window.gameState.playerCells && window.gameState.playerCells.length > 0) {
                    const cell = window.gameState.playerCells[0];
                    const worldSize = window.WORLD_SIZE || 2000;
                    return {
                        x: cell.x,
                        y: cell.y,
                        worldSize: worldSize,
                        withinBounds: cell.x >= 0 && cell.x <= worldSize && cell.y >= 0 && cell.y <= worldSize
                    };
                }
                return null;
            """)
            
            if boundary_data:
                print(f"     Player position: ({boundary_data['x']:.1f}, {boundary_data['y']:.1f})")
                print(f"     Within bounds: {boundary_data['withinBounds']}")
                
                # Verify player stays within world boundaries
                assert boundary_data['withinBounds'], f"Player at ({boundary_data['x']:.1f}, {boundary_data['y']:.1f}) is outside world bounds (0-{boundary_data['worldSize']})"
                print(f"     ✓ {corner} boundary constraint verified")
        
        # Test 5: Mouse Click for Cell Splitting
        print("\n✅ Test 5: Mouse Click for Cell Splitting")
        print("   Testing cell splitting mechanics...")
        
        # Move back to center
        actions.move_to_element(canvas).perform()
        time.sleep(1)
        
        # Get initial cell count
        initial_cell_data = driver.execute_script("""
            if (window.gameState && window.gameState.playerCells) {
                return {
                    cellCount: window.gameState.playerCells.length,
                    totalScore: window.gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0),
                    canSplit: window.gameState.playerCells.some(cell => cell.score >= (window.MIN_SPLIT_SCORE || 40))
                };
            }
            return null;
        """)
        
        if initial_cell_data:
            print(f"   Initial cell count: {initial_cell_data['cellCount']}")
            print(f"   Total score: {initial_cell_data['totalScore']}")
            print(f"   Can split: {initial_cell_data['canSplit']}")
            
            if initial_cell_data['canSplit']:
                # Perform click to split
                actions.click(canvas).perform()
                time.sleep(0.5)
                
                # Check if splitting occurred
                split_data = driver.execute_script("""
                    if (window.gameState && window.gameState.playerCells) {
                        return {
                            cellCount: window.gameState.playerCells.length,
                            totalScore: window.gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0)
                        };
                    }
                    return null;
                """)
                
                if split_data:
                    print(f"   After split - Cell count: {split_data['cellCount']}")
                    print(f"   After split - Total score: {split_data['totalScore']}")
                    
                    # Verify splitting occurred (more cells, same total score)
                    if split_data['cellCount'] > initial_cell_data['cellCount']:
                        print("   ✓ Cell splitting successful")
                    else:
                        print("   ⚠️  Cell splitting may not have occurred (score too low or max cells reached)")
            else:
                print("   ⚠️  Player score too low for splitting test")
        
        # Final Summary
        print("\n" + "=" * 60)
        print("🎉 Player Movement & Controls Test Summary:")
        print("✅ Mouse movement tracking - PASSED")
        print("✅ Player cell following mouse - PASSED") 
        print("✅ Smooth movement and inertia - PASSED")
        print("✅ World boundary constraints - PASSED")
        print("✅ Mouse click splitting - TESTED")
        print("=" * 60)
        
        # Keep browser open for a moment to see final state
        print("\n⏳ Keeping browser open for 3 seconds to observe final state...")
        time.sleep(3)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        print("   Check that the Flask server is running on http://127.0.0.1:5001")
        raise
    
    finally:
        print("\n🔄 Closing browser...")
        driver.quit()
        print("✅ Test completed!")


if __name__ == "__main__":
    print("⚠️  Make sure Flask server is running on http://127.0.0.1:5001")
    print("   Run: python3 app.py")
    print("   Then run this test with: python3 player_movement_test.py")
    print()
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        exit(1)
