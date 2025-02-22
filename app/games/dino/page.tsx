"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 150;
const DINO_WIDTH = 20;
const DINO_HEIGHT = 20;
const GRAVITY = 1;
const JUMP_FORCE = 15;
const OBSTACLE_WIDTH = 10;
const OBSTACLE_HEIGHT = 20;

export default function DinoGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dino, setDino] = useState({ x: 30, y: CANVAS_HEIGHT - DINO_HEIGHT, vy: 0, onGround: true });
  const [obstacle, setObstacle] = useState({ x: CANVAS_WIDTH + 100, y: CANVAS_HEIGHT - OBSTACLE_HEIGHT });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const dinoRef = useRef(dino);
  const obstacleRef = useRef(obstacle);

  useEffect(() => { dinoRef.current = dino; }, [dino]);
  useEffect(() => { obstacleRef.current = obstacle; }, [obstacle]);

  const handleJump = () => {
    setDino(prev => prev.onGround ? { ...prev, vy: -JUMP_FORCE, onGround: false } : prev);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp") {
      handleJump();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, d, o) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "yellow";
    ctx.fillRect(d.x, d.y, DINO_WIDTH, DINO_HEIGHT);
    ctx.fillStyle = "red";
    ctx.fillRect(o.x, o.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
    if (gameOver) {
      ctx.fillStyle = "white";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleJump);
    const interval = setInterval(() => {
      if (gameOver || paused) return;
      let newDino = { ...dinoRef.current };
      if (!newDino.onGround) {
        newDino.vy += GRAVITY;
        newDino.y += newDino.vy;
        if (newDino.y >= CANVAS_HEIGHT - DINO_HEIGHT) {
          newDino.y = CANVAS_HEIGHT - DINO_HEIGHT;
          newDino.vy = 0;
          newDino.onGround = true;
        }
      }
      let newObstacle = { ...obstacleRef.current };
      newObstacle.x -= 2;
      if (newObstacle.x < -OBSTACLE_WIDTH) {
        newObstacle.x = CANVAS_WIDTH;
      }
      if (
        newDino.x < newObstacle.x + OBSTACLE_WIDTH &&
        newDino.x + DINO_WIDTH > newObstacle.x &&
        newDino.y < newObstacle.y + OBSTACLE_HEIGHT &&
        newDino.y + DINO_HEIGHT > newObstacle.y
      ) {
        setGameOver(true);
      }
      setDino(newDino);
      setObstacle(newObstacle);
      draw(ctx, newDino, newObstacle);
    }, 30);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleJump);
    };
  }, [gameOver, paused]);

  useEffect(() => {
    if (gameOver) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      draw(ctx, dinoRef.current, obstacleRef.current);
    }
  }, [gameOver]);

  const togglePause = () => {
    setPaused(prev => !prev);
  };

  const restartGame = () => {
    setDino({ x: 30, y: CANVAS_HEIGHT - DINO_HEIGHT, vy: 0, onGround: true });
    setObstacle({ x: CANVAS_WIDTH + 100, y: CANVAS_HEIGHT - OBSTACLE_HEIGHT });
    setGameOver(false);
    setPaused(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center relative p-8">
      <button onClick={() => router.back()} className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
        Back
      </button>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={togglePause} className="bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={restartGame} className="bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
          Restart Game
        </button>
      </div>
      <h2 className="text-4xl font-extrabold text-white drop-shadow-lg mb-8">Dino Run</h2>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-white shadow-xl rounded" />
    </div>
  );
}