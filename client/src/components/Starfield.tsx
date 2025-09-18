import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; r: number; tw: number };

export default function Starfield({ density = 0.0015, speed = 0.02 }: { density?: number; speed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rebuild stars based on area
      const count = Math.max(80, Math.floor(width * height * density));
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 1 + 0.2,
          r: Math.random() * 1.2 + 0.2,
          tw: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    const onResize = () => resize();
    resize();
    window.addEventListener("resize", onResize);

    const step = () => {
      // Clear with deep night gradient
      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, "#0a0f1f");
      grd.addColorStop(1, "#060912");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // Twinkle
        const twinkle = 0.6 + 0.4 * Math.sin(s.tw);
        s.tw += 0.03 + Math.random() * 0.01;

        // Drift gently downward to simulate motion
        s.y += (0.2 + s.z) * speed * 60 * (1 / 60);
        if (s.y > height + 2) s.y = -2;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.7 * twinkle})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [density, speed]);

  return <canvas className="home-starfield" ref={canvasRef} />;
}
