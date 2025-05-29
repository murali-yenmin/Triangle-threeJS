import React, { useRef, useEffect } from "react";

const NUM_DOTS = 80;
const MAX_DISTANCE = 120;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default function NetworkBackground2D() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, animationFrameId;

    const dots = [];

    function initDots() {
      dots.length = 0;
      for (let i = 0; i < NUM_DOTS; i++) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: randomRange(-0.3, 0.3),
          vy: randomRange(-0.3, 0.3),
          radius: randomRange(1, 3),
        });
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(devicePixelRatio, devicePixelRatio);
      initDots();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw dots
      ctx.fillStyle = "rgba(120,180,255,0.6)";
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw lines between close dots
      ctx.strokeStyle = "rgba(120,180,255,0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
