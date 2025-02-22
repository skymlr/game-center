"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 150;
const DINO_WIDTH = 20;
const DINO_HEIGHT = 20;
const GRAVITY = 1;
const JUMP_FORCE = 15;
const OBSTACLE_SPEED = 2;
const OBSTACLE_GAP_MIN = 100;
const OBSTACLE_GAP_MAX = OBSTACLE_GAP_MIN * 3;
const ROTATION_INCREMENT = 0.2;

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle" | "triangle";
  color: string;
};

type Dino = {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  rotation: number;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createObstacles(): Obstacle[] {
  const shapes: ("rect" | "circle" | "triangle")[] = ["rect", "circle", "triangle"];
  const colors = ["red", "green", "blue"];
  const obstacles: Obstacle[] = [];
  let nextX = CANVAS_WIDTH;
  for (let i = 0; i < shapes.length; i++) {
    const gap = randomInt(OBSTACLE_GAP_MIN, OBSTACLE_GAP_MAX);
    nextX += gap;
    const width = randomInt(10, DINO_WIDTH * 2);
    const height = randomInt(10, DINO_HEIGHT * 2);
    obstacles.push({ x: nextX, y: CANVAS_HEIGHT - height, width, height, shape: shapes[i], color: colors[i] });
  }
  return obstacles;
}

export default function DinoGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dino, setDino] = useState<Dino>({ x: 30, y: CANVAS_HEIGHT - DINO_HEIGHT, vy: 0, onGround: true, rotation: 0 });
  const [obstacles, setObstacles] = useState<Obstacle[]>(createObstacles());
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const dinoRef = useRef(dino);
  const obstaclesRef = useRef(obstacles);
  useEffect(() => { dinoRef.current = dino; }, [dino]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);

  const jump = () => {
    setDino(prev => prev.onGround ? { ...prev, vy: -JUMP_FORCE, onGround: false } : prev);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp") jump();
  };

  const drawGame = (ctx: CanvasRenderingContext2D, player: Dino, obsArray: Obstacle[]) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.translate(player.x + DINO_WIDTH / 2, player.y + DINO_HEIGHT / 2);
    ctx.rotate(player.rotation);
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 0);
    ctx.moveTo(0, 2);
    ctx.lineTo(-4, 10);
    ctx.moveTo(0, 2);
    ctx.lineTo(4, 10);
    ctx.stroke();
    ctx.restore();
    obsArray.forEach(obstacle => {
      ctx.fillStyle = obstacle.color;
      if (obstacle.shape === "rect") {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.shape === "circle") {
        const radius = Math.min(obstacle.width, obstacle.height) / 2;
        ctx.beginPath();
        ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obstacle.shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
      }
    });
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
    const context = canvas.getContext("2d");
    if (!context) return;
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("click", jump);
    const gameInterval = setInterval(() => {
      if (gameOver || paused) return;
      let newDino = { ...dinoRef.current };
      if (!newDino.onGround) {
        newDino.vy += GRAVITY;
        newDino.y += newDino.vy;
        newDino.rotation += ROTATION_INCREMENT;
        if (newDino.y >= CANVAS_HEIGHT - DINO_HEIGHT) {
          newDino.y = CANVAS_HEIGHT - DINO_HEIGHT;
          newDino.vy = 0;
          newDino.onGround = true;
          newDino.rotation = 0;
        }
      }
      const movedObstacles = obstaclesRef.current.map(ob => ({ ...ob, x: ob.x - OBSTACLE_SPEED }));
      let rightmostX = Math.max(...movedObstacles.map(ob => ob.x));
      const updatedObstacles = movedObstacles.map(ob => {
        if (ob.x < -ob.width) {
          const gap = randomInt(OBSTACLE_GAP_MIN, OBSTACLE_GAP_MAX);
          const newX = rightmostX + gap;
          rightmostX = newX;
          const newWidth = randomInt(10, DINO_WIDTH * 2);
          const newHeight = randomInt(10, DINO_HEIGHT * 2);
          return { ...ob, x: newX, width: newWidth, height: newHeight, y: CANVAS_HEIGHT - newHeight };
        }
        return ob;
      });
      updatedObstacles.forEach(obs => {
        if (
          newDino.x < obs.x + obs.width &&
          newDino.x + DINO_WIDTH > obs.x &&
          newDino.y < obs.y + obs.height &&
          newDino.y + DINO_HEIGHT > obs.y
        ) {
          setGameOver(true);
        }
      });
      setDino(newDino);
      setObstacles(updatedObstacles);
      drawGame(context, newDino, updatedObstacles);
    }, 30);
    return () => {
      clearInterval(gameInterval);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("click", jump);
    };
  }, [gameOver, paused]);

  useEffect(() => {
    if (gameOver) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      drawGame(context, dinoRef.current, obstaclesRef.current);
    }
  }, [gameOver]);

  const togglePause = () => setPaused(prev => !prev);

  const resetGame = () => {
    setDino({ x: 30, y: CANVAS_HEIGHT - DINO_HEIGHT, vy: 0, onGround: true, rotation: 0 });
    setObstacles(createObstacles());
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
        <button onClick={resetGame} className="bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
          Restart Game
        </button>
      </div>
      <h2 className="text-4xl font-extrabold text-white drop-shadow-lg mb-8">Dino Run</h2>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-white shadow-xl rounded" />
    </div>
  );
}