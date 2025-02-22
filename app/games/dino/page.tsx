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
  const [obstacle, setObstacle] = useState({ x: CANVAS_WIDTH, y: CANVAS_HEIGHT - OBSTACLE_HEIGHT });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const interval = setInterval(() => {
      setDino((prev) => {
        let vy = prev.vy;
        let y = prev.y;
        if (!prev.onGround) {
          vy = prev.vy + GRAVITY;
          y = prev.y + vy;
          if (y >= CANVAS_HEIGHT - DINO_HEIGHT) {
            y = CANVAS_HEIGHT - DINO_HEIGHT;
            vy = 0;
            return { x: prev.x, y, vy, onGround: true };
          }
        }
        return { x: prev.x, y, vy, onGround: prev.onGround };
      });
      setObstacle((prev) => {
        let newX = prev.x - 2;
        if (newX < -OBSTACLE_WIDTH) {
          newX = CANVAS_WIDTH;
        }
        return { ...prev, x: newX };
      });
      draw(ctx);
    }, 30);
    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleJump);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleJump);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp") {
      handleJump();
    }
  };

  const handleJump = () => {
    setDino((prev) => {
      if (prev.onGround) {
        return { ...prev, vy: -JUMP_FORCE, onGround: false };
      }
      return prev;
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "yellow";
    ctx.fillRect(dino.x, dino.y, DINO_WIDTH, DINO_HEIGHT);
    ctx.fillStyle = "red";
    ctx.fillRect(obstacle.x, obstacle.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center relative">
      <button onClick={() => router.back()} className="absolute top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded">
        Back
      </button>
      <h2 className="text-2xl text-white mb-4">Dino Run</h2>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-white" />
    </div>
  );
}