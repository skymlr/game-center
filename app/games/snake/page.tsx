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

  const draw = (ctx: CanvasRenderingContext2D, snakeData: { x: number; y: number }[], foodData: { x: number; y: number }) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "lime";
    snakeData.forEach((part) => {
      ctx.fillRect(part.x, part.y, SCALE, SCALE);
    });
    ctx.fillStyle = "red";
    ctx.fillRect(foodData.x, foodData.y, SCALE, SCALE);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    generateFood();
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y,
        };
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
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative">
      <button onClick={() => router.back()} className="absolute top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded">
        Back
      </button>
      <h2 className="text-2xl text-white mb-4">Snake Game</h2>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-white" />
    </div>
  );
}