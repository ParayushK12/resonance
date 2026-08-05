"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export interface WavyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  waveYOffset?: number;
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  waveYOffset = 250,
  ...props
}: WavyBackgroundProps) => {
  const noise = useMemo(() => createNoise3D(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSafari] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome")
    );
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let w = (ctx.canvas.width = window.innerWidth);
    let h = (ctx.canvas.height = window.innerHeight);
    let nt = 0;

    const getSpeed = () => (speed === "slow" ? 0.001 : 0.002);

    const waveColors = colors ?? [
      "#38bdf8",
      "#818cf8",
      "#c084fc",
      "#e879f9",
      "#22d3ee",
    ];

    const drawWave = (n: number) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + waveYOffset);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.fillStyle = backgroundFill || "black";
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, w, h);
      drawWave(5);
      animationId = requestAnimationFrame(render);
    };

    ctx.filter = `blur(${blur}px)`;
    const handleResize = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };

    window.addEventListener("resize", handleResize);
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [backgroundFill, blur, colors, noise, speed, waveOpacity, waveWidth, waveYOffset]);

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};