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
  const touchStartRef = useRef<globalThis.Touch | null>(null);

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

  const draw = (ctx: CanvasRenderingContext2D, snakeData: { x: number; y: number }[], foodData: { x: number; y: number }) => {
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
        const newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y,
        };
        if (newHead.x < 0) newHead.x = CANVAS_WIDTH - SCALE;
        else if (newHead.x >= CANVAS_WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = CANVAS_HEIGHT - SCALE;
        else if (newHead.y >= CANVAS_HEIGHT) newHead.y = 0;
        for (const part of prevSnake) {
          if (newHead.x === part.x && newHead.y === part.y) {
            setGameOver(true);
            return prevSnake;
          }
        }
        const newSnake = [newHead, ...prevSnake];
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

  const changeDirection = (dir: "up" | "down" | "left" | "right") => {
    if (dir === "up" && directionRef.current.y === 0) {
      setDirection({ x: 0, y: -SCALE });
    } else if (dir === "down" && directionRef.current.y === 0) {
      setDirection({ x: 0, y: SCALE });
    } else if (dir === "left" && directionRef.current.x === 0) {
      setDirection({ x: -SCALE, y: 0 });
    } else if (dir === "right" && directionRef.current.x === 0) {
      setDirection({ x: SCALE, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0];
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0];
    if (!touchStartRef.current) return;
    const deltaX = touchEnd.clientX - touchStartRef.current.clientX;
    const deltaY = touchEnd.clientY - touchStartRef.current.clientY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        changeDirection("right");
      } else {
        changeDirection("left");
      }
    } else {
      if (deltaY > 0) {
        changeDirection("down");
      } else {
        changeDirection("up");
      }
    }
    touchStartRef.current = null;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 relative p-8" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <button onClick={() => router.back()} className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white px-4 py-2 rounded shadow-xl">
        Back
      </button>
      <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl w-[350px]">
        <div className="bg-black border-4 border-gray-900 rounded-lg p-2">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full" />
        </div>
        <div className="mt-2 flex flex-col">
          <div className="flex gap-4 mb-4">
            <button onClick={togglePause} className="p-4 text-lg">
              {paused ? "▶️" : "⏸️"}
            </button>
            <button onClick={restartGame} className="p-4 text-lg">
              🔄
            </button>
          </div>
          <div className="flex flex-col items-center">
            <button onClick={() => changeDirection("up")} className="bg-gray-800 border-2 border-gray-500 rounded-full w-16 h-16 text-white text-2xl shadow-lg">
              ▲
            </button>
            <div className="flex items-center justify-center mt-1 mb-1">
              <button onClick={() => changeDirection("left")} className="bg-gray-800 border-2 border-gray-500 rounded-full w-16 h-16 text-white text-2xl shadow-lg mr-8">
                ◀
              </button>
              <button onClick={() => changeDirection("right")} className="bg-gray-800 border-2 border-gray-500 rounded-full w-16 h-16 text-white text-2xl shadow-lg ml-8">
                ▶
              </button>
            </div>
            <button onClick={() => changeDirection("down")} className="bg-gray-800 border-2 border-gray-500 rounded-full w-16 h-16 text-white text-2xl shadow-lg">
              ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}