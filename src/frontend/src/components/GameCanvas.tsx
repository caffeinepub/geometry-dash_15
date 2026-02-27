import React, { useRef, useEffect, useState } from "react";
import type { Identity } from "@icp-sdk/core/agent";

// Physics constants
const GRAVITY = 0.8;
const JUMP_VELOCITY = -15;
const PLAYER_SIZE = 40;
const PLAYER_X = 100;
const GROUND_Y = 500;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_GAP_MIN = 300;
const OBSTACLE_GAP_MAX = 500;
const GAME_SPEED_INITIAL = 5;
const GAME_SPEED_INCREMENT = 0.0005;

interface Obstacle {
  x: number;
  height: number;
  type: "spike" | "block";
}

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  identity: Identity | null | undefined;
}

export default function GameCanvas({ onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  
  // Game state refs (for fast access in animation loop)
  const gameStateRef = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    playerVelocity: 0,
    obstacles: [] as Obstacle[],
    nextObstacleX: 800,
    isJumping: false,
    isGrounded: true,
    gameSpeed: GAME_SPEED_INITIAL,
    distance: 0,
    animationId: 0,
  });

  useEffect(() => {
    const requestJump = () => {
      const state = gameStateRef.current;
      if (state.isGrounded) {
        state.playerVelocity = JUMP_VELOCITY;
        state.isGrounded = false;
        state.isJumping = true;
      }
    };
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        requestJump();
      }
    };

    const handleClick = () => {
      requestJump();
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick);

    // Game loop
    const gameLoop = () => {
      const state = gameStateRef.current;
      
      // Update physics
      state.playerVelocity += GRAVITY;
      state.playerY += state.playerVelocity;

      // Ground collision
      if (state.playerY >= GROUND_Y - PLAYER_SIZE) {
        state.playerY = GROUND_Y - PLAYER_SIZE;
        state.playerVelocity = 0;
        state.isGrounded = true;
        state.isJumping = false;
      }

      // Increase speed over time
      state.gameSpeed += GAME_SPEED_INCREMENT;

      // Update obstacles
      state.obstacles = state.obstacles.filter((obs) => obs.x > -OBSTACLE_WIDTH);
      state.obstacles.forEach((obs) => {
        obs.x -= state.gameSpeed;
      });

      // Generate new obstacles
      if (state.nextObstacleX < canvas.width + 200) {
        const gap = OBSTACLE_GAP_MIN + Math.random() * (OBSTACLE_GAP_MAX - OBSTACLE_GAP_MIN);
        const height = 40 + Math.random() * 60;
        const type = Math.random() > 0.5 ? "spike" : "block";
        
        state.obstacles.push({
          x: canvas.width + 50,
          height,
          type,
        });
        
        state.nextObstacleX = canvas.width + 50 + gap;
      }
      state.nextObstacleX -= state.gameSpeed;

      // Update distance/score
      state.distance += state.gameSpeed;
      const currentScore = Math.floor(state.distance / 10);
      setScore(currentScore);

      // Collision detection
      const playerLeft = PLAYER_X;
      const playerRight = PLAYER_X + PLAYER_SIZE;
      const playerTop = state.playerY;
      const playerBottom = state.playerY + PLAYER_SIZE;

      for (const obs of state.obstacles) {
        const obsLeft = obs.x;
        const obsRight = obs.x + OBSTACLE_WIDTH;
        const obsTop = GROUND_Y - obs.height;
        const obsBottom = GROUND_Y;

        if (
          playerRight > obsLeft &&
          playerLeft < obsRight &&
          playerBottom > obsTop &&
          playerTop < obsBottom
        ) {
          // Collision detected - game over
          cancelAnimationFrame(state.animationId);
          onGameOver(currentScore);
          return;
        }
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = "oklch(0.45 0.18 195)";
      ctx.fillRect(0, GROUND_Y, canvas.width, 4);

      // Draw grid lines on ground
      ctx.strokeStyle = "oklch(0.72 0.22 195 / 0.2)";
      ctx.lineWidth = 1;
      const gridOffset = (state.distance * 0.5) % 50;
      for (let x = -gridOffset; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x + 25, GROUND_Y + 50);
        ctx.stroke();
      }

      // Draw player with glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = "oklch(0.72 0.22 195)";
      ctx.fillStyle = "oklch(0.72 0.22 195)";
      
      // Rotate player slightly when jumping
      ctx.save();
      ctx.translate(PLAYER_X + PLAYER_SIZE / 2, state.playerY + PLAYER_SIZE / 2);
      const rotation = state.isJumping ? -Math.PI / 8 : 0;
      ctx.rotate(rotation);
      ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
      ctx.restore();

      ctx.shadowBlur = 0;

      // Draw obstacles
      state.obstacles.forEach((obs) => {
        if (obs.type === "spike") {
          // Draw spike triangle
          ctx.fillStyle = "oklch(0.58 0.26 15)";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "oklch(0.58 0.26 15)";
          
          ctx.beginPath();
          ctx.moveTo(obs.x + OBSTACLE_WIDTH / 2, GROUND_Y - obs.height);
          ctx.lineTo(obs.x, GROUND_Y);
          ctx.lineTo(obs.x + OBSTACLE_WIDTH, GROUND_Y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Draw block
          ctx.fillStyle = "oklch(0.65 0.28 340)";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "oklch(0.65 0.28 340)";
          ctx.fillRect(obs.x, GROUND_Y - obs.height, OBSTACLE_WIDTH, obs.height);
        }
        ctx.shadowBlur = 0;
      });

      // Continue loop
      state.animationId = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(gameStateRef.current.animationId);
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [onGameOver]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer"
      />
      
      {/* HUD */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-primary rounded-lg px-6 py-4 shadow-[0_0_20px_oklch(var(--primary)/0.4)]">
          <div className="text-sm text-muted-foreground font-display">DISTANCE</div>
          <div className="text-5xl font-display font-bold text-primary">
            {score}
          </div>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm border-2 border-accent rounded-lg px-6 py-3 shadow-[0_0_20px_oklch(var(--accent)/0.4)]">
          <div className="text-sm text-muted-foreground font-display">SPEED</div>
          <div className="text-2xl font-display font-bold text-accent">
            {(gameStateRef.current.gameSpeed / GAME_SPEED_INITIAL).toFixed(1)}x
          </div>
        </div>
      </div>

      {/* Instructions overlay (fades after a few seconds) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm border-2 border-border rounded-lg px-8 py-4 pointer-events-none animate-pulse">
        <p className="text-lg font-display text-foreground text-center">
          CLICK OR PRESS SPACE TO JUMP
        </p>
      </div>
    </div>
  );
}
