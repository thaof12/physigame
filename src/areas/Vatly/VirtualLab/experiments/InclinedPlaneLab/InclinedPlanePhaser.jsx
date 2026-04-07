import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import { PHYSICS_CONSTANTS } from '../../core/PhysicsEngine';

const InclinedPlanePhaser = forwardRef(({ 
  angle, 
  planeLength, 
  mass, 
  frictionCoeff, 
  isRunning,
  experimentState,
  onUpdate,
  onFinish
}, ref) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const callbacks = useRef({ angle, planeLength, mass, frictionCoeff, isRunning, experimentState, onUpdate, onFinish });
  useEffect(() => {
    callbacks.current = { angle, planeLength, mass, frictionCoeff, isRunning, experimentState, onUpdate, onFinish };
  }, [angle, planeLength, mass, frictionCoeff, isRunning, experimentState, onUpdate, onFinish]);

  const mainSceneRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.startExperiment();
    },
    resetExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.resetExperiment();
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 450;

    const config = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: containerRef.current,
      transparent: true,
      scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
          simAngle: angle,
          simLength: planeLength,
          simMass: mass,
          simFriction: frictionCoeff,
          isFinished: experimentState === 'finished'
        }
      }
    };

    let bgGraphics;
    let groundGraphics;
    let planeGraphics;
    let boxGraphics;
    let vectorGraphics;
    
    let trailParticles;
    let sparkParticles;
    
    let timeElapsed = 0;
    let currentVel = 0;
    let currentPos = 0;
    let active = false;

    function preload() {
      const scene = this;
      
      const createTrailUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 16; canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,16,16);
        return canvas.toDataURL();
      };
      
      const createSparkUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 12; canvas.height = 12;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.3, '#fcd34d');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,12,12);
        return canvas.toDataURL();
      };

      scene.load.image('trailTex', createTrailUrl());
      scene.load.image('sparkTex', createSparkUrl());
    }

    function create() {
      const scene = this;
      mainSceneRef.current = scene;

      bgGraphics = scene.add.graphics();
      groundGraphics = scene.add.graphics();
      planeGraphics = scene.add.graphics();
      
      trailParticles = scene.add.particles(0, 0, 'trailTex', {
        scale: { start: 1.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 400,
        blendMode: 'ADD',
        emitting: false
      });

      vectorGraphics = scene.add.graphics();
      vectorGraphics.setDepth(10);

      boxGraphics = scene.add.graphics();
      boxGraphics.setDepth(5);
      
      sparkParticles = scene.add.particles(0, 0, 'sparkTex', {
        speed: { min: 100, max: 300 },
        angle: { min: 200, max: 340 },
        gravityY: 500,
        scale: { start: 1, end: 0 },
        lifespan: 700,
        blendMode: 'ADD',
        emitting: false
      });
      sparkParticles.setDepth(15);

      scene.startExperiment = () => {
        active = true;
        timeElapsed = 0;
        currentVel = 0;
        currentPos = 0;
        trailParticles.emitting = true;
        scene.isFinished = false;
      };

      scene.resetExperiment = () => {
        active = false;
        timeElapsed = 0;
        currentVel = 0;
        currentPos = 0;
        trailParticles.emitting = false;
        if (trailParticles.killAll) trailParticles.killAll(); // Safe alternative to clear()
        scene.isFinished = false;
        drawScene(0);
      };

      drawScene(0);
    }
    
    function drawScene(pos) {
      if (!mainSceneRef.current) return;
      
      const width = mainSceneRef.current.sys.game.config.width;
      const height = mainSceneRef.current.sys.game.config.height;

      const padding = 60;
      const planePixelLength = width - 2 * padding - 100;
      const angleRad = (mainSceneRef.current.simAngle * Math.PI) / 180;
      
      const baseX = padding + 50;
      const baseY = height - padding;
      const topX = baseX + planePixelLength * Math.cos(angleRad);
      const topY = baseY - planePixelLength * Math.sin(angleRad);

      // Background
      bgGraphics.clear();
      bgGraphics.fillGradientStyle(0x0a0f1d, 0x0a0f1d, 0x16213e, 0x16213e, 1);
      bgGraphics.fillRect(0, 0, width, height);

      // Ground
      groundGraphics.clear();
      groundGraphics.fillGradientStyle(0x1a2138, 0x1a2138, 0x0b1021, 0x0b1021, 1);
      groundGraphics.fillRect(0, baseY, width, height - baseY);
      groundGraphics.lineStyle(2, 0x3b82f6, 0.3);
      groundGraphics.beginPath(); groundGraphics.moveTo(0, baseY); groundGraphics.lineTo(width, baseY); groundGraphics.strokePath();

      // Plane (3D Slab implementation)
      planeGraphics.clear();
      const slabDepth = 25;
      const slabThickness = 15;
      
      // Shadow
      planeGraphics.fillStyle(0x000000, 0.4);
      planeGraphics.beginPath();
      planeGraphics.moveTo(baseX + 10, baseY + 5);
      planeGraphics.lineTo(topX + slabDepth, baseY + 5);
      planeGraphics.lineTo(topX + slabDepth + 15, baseY + 18);
      planeGraphics.lineTo(baseX + 25, baseY + 18);
      planeGraphics.fillPath();

      // Side
      planeGraphics.fillStyle(0x1e293b, 1);
      planeGraphics.beginPath();
      planeGraphics.moveTo(topX, topY);
      planeGraphics.lineTo(topX + slabDepth, topY - slabDepth * 0.5);
      planeGraphics.lineTo(baseX + slabDepth, baseY - slabDepth * 0.5);
      planeGraphics.lineTo(baseX, baseY);
      planeGraphics.fillPath();

      // Right wall
      planeGraphics.fillStyle(0x0f172a, 1);
      planeGraphics.beginPath();
      planeGraphics.moveTo(topX, topY);
      planeGraphics.lineTo(topX + slabDepth, topY - slabDepth * 0.5);
      planeGraphics.lineTo(topX + slabDepth, topY - slabDepth * 0.5 + slabThickness);
      planeGraphics.lineTo(topX, topY + slabThickness);
      planeGraphics.fillPath();

      // Top surface - Glowing Cyberpunk theme
      planeGraphics.fillGradientStyle(0x3b82f6, 0x1d4ed8, 0x2563eb, 0x1e3a8a, 1);
      planeGraphics.beginPath();
      planeGraphics.moveTo(baseX, baseY);
      planeGraphics.lineTo(baseX + slabDepth, baseY - slabDepth * 0.5);
      planeGraphics.lineTo(topX + slabDepth, topY - slabDepth * 0.5);
      planeGraphics.lineTo(topX, topY);
      planeGraphics.fillPath();
      
      // Neon Edge
      planeGraphics.lineStyle(2, 0x60a5fa, 0.8);
      planeGraphics.beginPath();
      planeGraphics.moveTo(baseX, baseY);
      planeGraphics.lineTo(topX, topY);
      planeGraphics.strokePath();

      // Front face
      planeGraphics.fillGradientStyle(0x1e3a8a, 0x0f172a, 0x1e3a8a, 0x1e3a8a, 1);
      planeGraphics.beginPath();
      planeGraphics.moveTo(baseX, baseY);
      planeGraphics.lineTo(topX, topY);
      planeGraphics.lineTo(topX, topY + slabThickness);
      planeGraphics.lineTo(baseX, baseY + slabThickness);
      planeGraphics.fillPath();

      // Box
      const progress = pos / mainSceneRef.current.simLength;
      const objX = topX - progress * (topX - baseX);
      const objY = topY + progress * (baseY - topY);
      
      if(active) {
         trailParticles.emitParticleAt(objX, objY - 20);
      }

      boxGraphics.clear();
      const boxSize = 40;
      const box3D = 12;
      
      const dx = Math.cos(angleRad);
      const dy = -Math.sin(angleRad);
      const nx = Math.sin(angleRad);
      const ny = Math.cos(angleRad);
      const cx = objX + nx * (boxSize/2);
      const cy = objY - ny * (boxSize/2) - 2;

      const rotatePt = (px, py) => {
        return {
          x: cx + px * Math.cos(-angleRad) - py * Math.sin(-angleRad),
          y: cy + px * Math.sin(-angleRad) + py * Math.cos(-angleRad)
        };
      };

      const pts = [
        rotatePt(-boxSize/2, -boxSize/2),
        rotatePt(-boxSize/2 + box3D, -boxSize/2 - box3D * 0.6),
        rotatePt(boxSize/2 + box3D, -boxSize/2 - box3D * 0.6),
        rotatePt(boxSize/2, -boxSize/2),
        rotatePt(boxSize/2 + box3D, boxSize/2 - box3D * 0.6),
        rotatePt(boxSize/2, boxSize/2),
        rotatePt(-boxSize/2, boxSize/2)
      ];

      // Top face
      boxGraphics.fillStyle(0xf59e0b, 1);
      boxGraphics.beginPath();
      boxGraphics.moveTo(pts[0].x, pts[0].y);
      boxGraphics.lineTo(pts[1].x, pts[1].y);
      boxGraphics.lineTo(pts[2].x, pts[2].y);
      boxGraphics.lineTo(pts[3].x, pts[3].y);
      boxGraphics.fillPath();

      // Right face
      boxGraphics.fillStyle(0xb45309, 1);
      boxGraphics.beginPath();
      boxGraphics.moveTo(pts[3].x, pts[3].y);
      boxGraphics.lineTo(pts[2].x, pts[2].y);
      boxGraphics.lineTo(pts[4].x, pts[4].y);
      boxGraphics.lineTo(pts[5].x, pts[5].y);
      boxGraphics.fillPath();

      // Front Face
      boxGraphics.fillGradientStyle(0xfcd34d, 0xf59e0b, 0xd97706, 0xb45309, 1);
      boxGraphics.beginPath();
      boxGraphics.moveTo(pts[0].x, pts[0].y);
      boxGraphics.lineTo(pts[3].x, pts[3].y);
      boxGraphics.lineTo(pts[5].x, pts[5].y);
      boxGraphics.lineTo(pts[6].x, pts[6].y);
      boxGraphics.fillPath();
      
      // Neon Edge Box
      boxGraphics.lineStyle(1.5, 0xfffbbf24, 0.8);
      boxGraphics.beginPath();
      boxGraphics.moveTo(pts[0].x, pts[0].y);
      boxGraphics.lineTo(pts[3].x, pts[3].y);
      boxGraphics.lineTo(pts[5].x, pts[5].y);
      boxGraphics.lineTo(pts[6].x, pts[6].y);
      boxGraphics.closePath();
      boxGraphics.strokePath();

      // Forces
      vectorGraphics.clear();
      if (!mainSceneRef.current.isFinished) {
        const forceScale = 2.5;
        const massScale = 0.5 + mainSceneRef.current.simMass; 
        const P = massScale * PHYSICS_CONSTANTS.g;
        
        // Glow effect for vectors
        vectorGraphics.lineStyle(5, 0xef4444, 0.2);
        drawArrowRaw(vectorGraphics, cx, cy, cx, cy + P * forceScale);
        drawArrow(vectorGraphics, cx, cy, cx, cy + P * forceScale, 0xef4444); // P
        
        const Px = P * Math.sin(angleRad);
        const pxEndX = cx + Px * forceScale * Math.cos(angleRad);
        const pxEndY = cy + Px * forceScale * Math.sin(angleRad);
        vectorGraphics.lineStyle(5, 0xf59e0b, 0.2);
        drawArrowRaw(vectorGraphics, cx, cy, pxEndX, pxEndY);
        drawArrow(vectorGraphics, cx, cy, pxEndX, pxEndY, 0xf59e0b); // Px

        if (mainSceneRef.current.simFriction > 0 && currentVel > 0) {
          const N = P * Math.cos(angleRad);
          const Fms = mainSceneRef.current.simFriction * N;
          const fmEndX = cx - Fms * forceScale * Math.cos(angleRad);
          const fmEndY = cy - Fms * forceScale * Math.sin(angleRad);
          vectorGraphics.lineStyle(5, 0xa855f7, 0.2);
          drawArrowRaw(vectorGraphics, cx, cy, fmEndX, fmEndY);
          drawArrow(vectorGraphics, cx, cy, fmEndX, fmEndY, 0xa855f7); // Fms
        }
      }
    }
    
    function drawArrowRaw(g, x1, y1, x2, y2) {
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.strokePath();
    }
    
    function drawArrow(g, x1, y1, x2, y2, color) {
      g.lineStyle(3, color, 1);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.strokePath();
      
      const angle = Math.atan2(y2 - y1, x2 - x1);
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x2, y2);
      g.lineTo(x2 - 12 * Math.cos(angle - Math.PI/6), y2 - 12 * Math.sin(angle - Math.PI/6));
      g.lineTo(x2 - 12 * Math.cos(angle + Math.PI/6), y2 - 12 * Math.sin(angle + Math.PI/6));
      g.fillPath();
    }

    function update(time, delta) {
      if (!mainSceneRef.current) return;
      const dt = delta / 1000;
      const { angle, planeLength, mass, frictionCoeff, onUpdate, onFinish } = callbacks.current;

      if (!active) {
        if (mainSceneRef.current.simAngle !== angle || mainSceneRef.current.simLength !== planeLength || mainSceneRef.current.simMass !== mass || mainSceneRef.current.simFriction !== frictionCoeff) {
          mainSceneRef.current.simAngle = angle;
          mainSceneRef.current.simLength = planeLength;
          mainSceneRef.current.simMass = mass;
          mainSceneRef.current.simFriction = frictionCoeff;
          drawScene(0);
        }
      }

      if (active) {
        const g = PHYSICS_CONSTANTS.g;
        const angleRad = (mainSceneRef.current.simAngle * Math.PI) / 180;
        const a = g * (Math.sin(angleRad) - mainSceneRef.current.simFriction * Math.cos(angleRad));

        if (a <= 0) {
          active = false;
          mainSceneRef.current.isFinished = true;
          if (onFinish) onFinish(timeElapsed, currentPos, currentVel);
          return;
        }

        currentVel += a * dt;
        currentPos += currentVel * dt;
        timeElapsed += dt;

        if (currentPos >= mainSceneRef.current.simLength) {
          currentPos = mainSceneRef.current.simLength;
          active = false;
          trailParticles.emitting = false;
          mainSceneRef.current.isFinished = true;
          
          const padding = 60;
          const width = mainSceneRef.current.sys.game.config.width;
          const planePixelLength = width - 2 * padding - 100;
          const baseX = padding + 50;
          const baseY = mainSceneRef.current.sys.game.config.height - padding;
          
          sparkParticles.emitParticleAt(baseX, baseY, 30); // Sparks at the end

          if (onFinish) onFinish(timeElapsed, currentPos, currentVel);
          
          drawScene(currentPos);
          return;
        }

        drawScene(currentPos);
        
        if (onUpdate && timeElapsed % 0.05 < dt) {
          onUpdate(timeElapsed, currentPos, currentVel);
        }
      }
    }

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      mainSceneRef.current = null;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Empty dependency array means no unmount

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0f1d]"
    />
  );
});

export default InclinedPlanePhaser;
