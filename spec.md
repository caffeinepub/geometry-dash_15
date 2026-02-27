# Geometry Dash Game

## Current State

Fresh project with standard Caffeine boilerplate:
- React frontend with TypeScript
- shadcn/ui components available
- Internet Identity authentication setup
- No game logic or UI implemented yet

## Requested Changes (Diff)

### Add

- Complete Geometry Dash-style platformer game with side-scrolling gameplay
- Player character (cube/square) that jumps when clicked/tapped
- Obstacles (spikes, blocks) that the player must avoid
- Continuous horizontal scrolling level
- Collision detection system
- Game over detection and restart functionality
- Score/distance tracking
- Progressive difficulty (obstacles become more frequent)
- Simple animations and visual feedback

### Modify

- Replace default App component with game canvas and UI
- Add game-specific styling and animations

### Remove

- No existing features to remove

## Implementation Plan

**Backend:**
- Leaderboard system to store high scores (player identity + score + timestamp)
- API to submit scores
- API to fetch top scores

**Frontend:**
- Game canvas using HTML5 Canvas API and requestAnimationFrame
- Game state management (menu, playing, game over)
- Player physics (gravity, jump mechanics)
- Obstacle generation and collision detection
- Score display and game UI overlays
- Responsive controls (click, tap, or spacebar to jump)
- Start menu with play button
- Game over screen with restart and score display
- Leaderboard display showing top scores
- Clean, geometric visual style inspired by Geometry Dash

## UX Notes

- Simple one-button gameplay: click/tap/spacebar to jump
- Immediate restart on game over for quick retry loop
- Visual feedback for jumps and collisions
- Clean, minimalist aesthetic with bright colors
- Smooth 60fps animations
- Progressive challenge that increases difficulty over time
- Leaderboard integration with Internet Identity for competitive play
