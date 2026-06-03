import React, { useEffect, useRef } from 'react';

const SpacetimeGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Grid settings
    const spacing = 50;
    
    // Initial mouse pos off-screen to avoid weirdness
    let mouse = { x: -1000, y: -1000, radius: 350 };
    // Smooth target mouse for interpolation
    let targetMouse = { x: width / 2, y: height / 2 };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = e.clientX - rect.left;
      targetMouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      targetMouse.x = width / 2;
      targetMouse.y = height / 2;
    };
    
    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      targetMouse.x = width / 2;
      targetMouse.y = height / 2;
    };
    
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Interpolate mouse for smooth black hole movement
      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;
      
      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;
      
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)'; // Indigo-ish grid
      ctx.lineWidth = 1;
      
      // Distort point
      const getDistortedPoint = (x, y) => {
        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If within radius, pull towards center
        if (dist < mouse.radius && dist > 5) {
          const pull = Math.pow(1 - dist / mouse.radius, 3) * 120; // Gravity strength
          return {
            x: x + (dx / dist) * pull,
            y: y + (dy / dist) * pull
          };
        }
        return { x, y };
      };
      
      // Draw vertical lines
      ctx.beginPath();
      for (let i = -1; i <= cols; i++) {
        for (let j = -1; j <= rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          const p = getDistortedPoint(x, y);
          if (j === -1) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
      
      // Draw horizontal lines
      ctx.beginPath();
      for (let j = -1; j <= rows; j++) {
        for (let i = -1; i <= cols; i++) {
          const x = i * spacing;
          const y = j * spacing;
          const p = getDistortedPoint(x, y);
          if (i === -1) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
      
      // Draw event horizon (Black Hole core)
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.3, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.5, 'rgba(49, 46, 129, 0.8)'); // deep indigo
      gradient.addColorStop(0.8, 'rgba(99, 102, 241, 0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a bright accretion disk / glow
      ctx.strokeStyle = 'rgba(165, 180, 252, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(mouse.x, mouse.y, 55, 15, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.beginPath();
      ctx.ellipse(mouse.x, mouse.y, 70, 20, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
      style={{ backgroundColor: '#020617' }} // bg-slate-950
    />
  );
};

export default SpacetimeGrid;
