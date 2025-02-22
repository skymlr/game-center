"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 300;
const SCALE = 10;

export default function SnakeGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState([{ x: 150, y: 150 }]);
  const [direction, setDirection] = useState({ x: SCALE, y: 0 });
  const [food, setFood] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const generateFood = () => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / SCALE)) * SCALE;
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / SCALE)) * SCALE;
    setFood({ x, y });
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    snakeData: { x: number; y: number }[],
    foodData: { x: number; y: number }
  ) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "lime";
    snakeData.forEach((part) => {
      ctx.fillRect(part.x, part.y, SCALE, SCALE);
    });
    ctx.fillStyle = "red";
    ctx.fillRect(foodData.x, foodData.y, SCALE, SCALE);
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
    generateFood();
    const interval = setInterval(() => {
      if (gameOver || paused) return;
      setSnake((prevSnake) => {
        let newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y,
        };
        if (newHead.x < 0) newHead.x = CANVAS_WIDTH - SCALE;
        else if (newHead.x >= CANVAS_WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = CANVAS_HEIGHT - SCALE;
        else if (newHead.y >= CANVAS_HEIGHT) newHead.y = 0;
        for (let part of prevSnake) {
          if (newHead.x === part.x && newHead.y === part.y) {
            setGameOver(true);
            return prevSnake;
          }
        }
        let newSnake = [newHead, ...prevSnake];
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          generateFood();
        } else {
          newSnake.pop();
        }
        draw(ctx, newSnake, foodRef.current);
        return newSnake;
      });
    }, 100);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, paused]);

  useEffect(() => {
    if (gameOver) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      draw(ctx, snake, food);
    }
  }, [gameOver]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" && directionRef.current.y === 0) {
      setDirection({ x: 0, y: -SCALE });
    } else if (e.key === "ArrowDown" && directionRef.current.y === 0) {
      setDirection({ x: 0, y: SCALE });
    } else if (e.key === "ArrowLeft" && directionRef.current.x === 0) {
      setDirection({ x: -SCALE, y: 0 });
    } else if (e.key === "ArrowRight" && directionRef.current.x === 0) {
      setDirection({ x: SCALE, y: 0 });
    }
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const restartGame = () => {
    setSnake([{ x: 150, y: 150 }]);
    setDirection({ x: SCALE, y: 0 });
    setGameOver(false);
    setPaused(false);
    generateFood();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center relative p-8">
      <button onClick={() => router.back()} className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
        Back
      </button>
      <h2 className="text-4xl font-extrabold text-white drop-shadow-lg mb-8">Snake Game</h2>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-white shadow-xl rounded" />
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={togglePause} className="bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={restartGame} className="bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
          Restart Game
        </button>
      </div>
    </div>
  );
}