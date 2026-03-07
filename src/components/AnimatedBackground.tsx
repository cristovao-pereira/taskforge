import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
  color?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = "",
  color = "var(--accent-color)"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolvedColor = color.startsWith('var(')
      ? getComputedStyle(document.documentElement).getPropertyValue(color.match(/var\(([^)]+)\)/)?.[1] || '').trim() || '#3b82f6'
      : color;

    // Configuration
    const particleCount = 60;
    const shapeCount = 15; // New shapes
    const connectionDistance = 140;
    const mouseDistance = 150;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Mouse position
    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseX: number;
      baseY: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Mouse interaction (repel)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseDistance - distance) / mouseDistance;

          // Push away gently
          const repelForce = 2;
          this.vx -= forceDirectionX * force * repelForce * 0.05;
          this.vy -= forceDirectionY * force * repelForce * 0.05;
        }

        // Friction to prevent infinite acceleration
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Minimum speed to keep moving
        if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.01;
        if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.01;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = 0.6;
        ctx.fill();
      }
    }

    // New Geometric Shape Class
    class GeometricShape {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      sides: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 100 + 40;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
        this.sides = Math.random() > 0.6 ? 6 : 3; // Hexagons or triangles
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Wrap around edges
        if (this.x < -this.size) this.x = w + this.size;
        if (this.x > w + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = h + this.size;
        if (this.y > h + this.size) this.y = -this.size;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
          const angle = this.rotation + (i * Math.PI * 2) / this.sides;
          const px = this.x + Math.cos(angle) * this.size;
          const py = this.y + Math.sin(angle) * this.size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = resolvedColor;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.08; // Very subtle
        ctx.stroke();
      }
    }

    let animationFrameId: number;
    let particles: Particle[] = [];
    let shapes: GeometricShape[] = [];

    const init = () => {

      particles = [];
      shapes = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      for (let i = 0; i < shapeCount; i++) {
        shapes.push(new GeometricShape());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Draw shapes first (background layer)
      for (let i = 0; i < shapes.length; i++) {
        shapes[i].update();
        shapes[i].draw();
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = resolvedColor;
            // Opacity based on distance
            ctx.globalAlpha = 1 - distance / connectionDistance;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Get mouse position relative to viewport (fixed position canvas)
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.4 }}
      />
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]"></div>
    </div>
  );
};

export default AnimatedBackground;
