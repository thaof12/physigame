import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';

const SCALE = 200; // 1m = 200 pixels
const G = 9.8;

const PendulumPhaser = forwardRef(({ 
  length, 
  amplitude, 
  mass, 
  damping, 
  simulationSpeed, 
  experimentState, 
  showTrail = true,
  onUpdate, 
  onTick 
}, ref) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const callbacks = useRef({ onUpdate, onTick, length, amplitude, mass, damping, showTrail });
  useEffect(() => {
    callbacks.current = { onUpdate, onTick, length, amplitude, mass, damping, showTrail };
  }, [onUpdate, onTick, length, amplitude, mass, damping, showTrail]);

  const mainSceneRef = useRef(null);

  // Expose control methods Safely
  useImperativeHandle(ref, () => ({
    startExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.startExperiment();
    },
    pauseExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.pauseExperiment();
    },
    resumeExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.resumeExperiment();
    },
    resetExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.resetExperiment();
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 450;
    const floorY = height - 30;
    const pivotX = width / 2;
    const pivotY = 60;

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
          simLength: length,
          simAmplitude: amplitude,
          simMass: mass,
          simDamping: damping,
          simState: experimentState
        }
      }
    };

    let backgroundGraphics;
    let ceilingGraphics;
    let rulerGraphics;
    let ropeGraphics;
    let shadowGraphics;
    let trailParticles;
    let bobSprite;
    
    let timeElapsed = 0;
    let prevAngle = amplitude;
    let currentAngle = amplitude;
    let isRunning = false;
    let isPaused = false;

    function preload() {
      const scene = this;
      
      // ─── Generate Premium UI/Textures using Canvas 2D ───
      const createBobUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 60; canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // Glow
        const glowGrad = ctx.createRadialGradient(30, 30, 15, 30, 30, 30);
        glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
        glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, 60, 60);

        // Core Sphere
        const grad = ctx.createRadialGradient(22, 22, 2, 30, 30, 20);
        grad.addColorStop(0, '#93c5fd');
        grad.addColorStop(0.3, '#3b82f6');
        grad.addColorStop(0.8, '#1e3a8a');
        grad.addColorStop(1, '#0f172a');
        ctx.beginPath();
        ctx.arc(30, 30, 20, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner Sharp Specular highlight
        ctx.beginPath();
        ctx.ellipse(22, 20, 8, 5, -Math.PI/6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        return canvas.toDataURL();
      };
      
      const createTrailUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 30; canvas.height = 30;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(15, 15, 0, 15, 15, 15);
        grad.addColorStop(0, 'rgba(147, 197, 253, 1)');
        grad.addColorStop(0.4, 'rgba(59, 130, 246, 0.5)');
        grad.addColorStop(1, 'rgba(29, 78, 216, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 30, 30);
        return canvas.toDataURL();
      };

      scene.load.image('bobTex', createBobUrl());
      scene.load.image('trailTex', createTrailUrl());
    }

    function create() {
      const scene = this;
      mainSceneRef.current = scene; // Safely save reference for React hook

      // 1. Background (Walls & Floor)
      backgroundGraphics = scene.add.graphics();
      drawBackground(backgroundGraphics);

      // 2. Ceiling Mount
      ceilingGraphics = scene.add.graphics();
      drawCeilingMount(ceilingGraphics);

      // 3. Ruler & Arc
      rulerGraphics = scene.add.graphics();

      // 4. Rope
      ropeGraphics = scene.add.graphics();

      // 5. Shadow
      shadowGraphics = scene.add.graphics();

      // 6. Trail
      trailParticles = scene.add.particles(0, 0, 'trailTex', {
        scale: { start: 1.2, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 600,
        blendMode: 'ADD',
        emitting: false
      });

      // 7. Bob
      bobSprite = scene.add.sprite(pivotX, pivotY + length * SCALE, 'bobTex');
      bobSprite.setOrigin(0.5, 0.5);
      
      trailParticles.startFollow(bobSprite);

      // Control functions
      scene.startExperiment = () => {
        isRunning = true;
        isPaused = false;
        timeElapsed = 0;
        prevAngle = scene.simAmplitude;
        currentAngle = scene.simAmplitude;
        trailParticles.emitting = showTrail;
      };

      scene.pauseExperiment = () => {
        isPaused = true;
        trailParticles.emitting = false;
      };

      scene.resumeExperiment = () => {
        isPaused = false;
        trailParticles.emitting = showTrail;
      };

      scene.resetExperiment = () => {
        isRunning = false;
        isPaused = false;
        timeElapsed = 0;
        prevAngle = scene.simAmplitude;
        currentAngle = scene.simAmplitude;
        trailParticles.emitting = false;
        
        // Phaser 3.60+ way to kill particles instead of clear()
        if (trailParticles.killAll) trailParticles.killAll();
        
        updatePendulum(scene.simAmplitude);
      };

      // Initial draw
      updatePendulum(scene.simAmplitude);
    }
    
    function drawBackground(g) {
      g.clear();
      // Wall
      g.fillGradientStyle(0x0a0f1d, 0x0a0f1d, 0x16213e, 0x16213e, 1);
      g.fillRect(0, 0, width, height);
      
      // Floor
      g.fillGradientStyle(0x1a2138, 0x1a2138, 0x0b1021, 0x0b1021, 1);
      g.fillRect(0, floorY, width, height - floorY);
      
      // glowing neon grid
      g.lineStyle(1.5, 0x3b82f6, 0.15);
      for (let i = 0; i < 10; i++) {
        const y = floorY + i * 3.5;
        const perspective = 1 + i * 0.15;
        g.beginPath();
        g.moveTo(width * (0.5 - 0.5 * perspective), y);
        g.lineTo(width * (0.5 + 0.5 * perspective), y);
        g.strokePath();
      }
      
      // Horizon line
      g.lineStyle(2, 0x60a5fa, 0.3);
      g.beginPath(); g.moveTo(0, floorY); g.lineTo(width, floorY); g.strokePath();
    }
    
    function drawCeilingMount(g) {
      g.clear();
      const beamW = 160; const beamH = 22; const beamDepth = 14;
      
      // Metallic rendering
      // Top face
      g.fillStyle(0x475569, 1);
      g.beginPath();
      g.moveTo(pivotX - beamW / 2, pivotY - beamH);
      g.lineTo(pivotX - beamW / 2 + beamDepth, pivotY - beamH - beamDepth * 0.5);
      g.lineTo(pivotX + beamW / 2 + beamDepth, pivotY - beamH - beamDepth * 0.5);
      g.lineTo(pivotX + beamW / 2, pivotY - beamH);
      g.closePath();
      g.fillPath();
      
      // Side face
      g.fillStyle(0x334155, 1);
      g.beginPath();
      g.moveTo(pivotX + beamW / 2, pivotY - beamH);
      g.lineTo(pivotX + beamW / 2 + beamDepth, pivotY - beamH - beamDepth * 0.5);
      g.lineTo(pivotX + beamW / 2 + beamDepth, pivotY - beamDepth * 0.5);
      g.lineTo(pivotX + beamW / 2, pivotY);
      g.closePath();
      g.fillPath();
      
      // Front face
      g.fillGradientStyle(0x64748b, 0x64748b, 0x475569, 0x475569, 1);
      g.fillRect(pivotX - beamW / 2, pivotY - beamH, beamW, beamH);
      
      // Neon Strip on mount
      g.fillStyle(0x3b82f6, 0.8);
      g.fillRect(pivotX - beamW/2 + 5, pivotY - beamH + 5, beamW - 10, 2);
      
      // Pivot
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(pivotX, pivotY, 9);
      g.fillStyle(0x3b82f6, 1);
      g.fillCircle(pivotX, pivotY, 4);
    }
    
    function drawRulerAndArc(l, ampRad, isSetup) {
      const g = rulerGraphics;
      g.clear();
      const ropeLength = l * SCALE;
      const rulerX = pivotX + 110;
      
      // Neon Ruler line
      g.lineStyle(3, 0xf59e0b, 0.8);
      g.beginPath(); g.moveTo(rulerX, pivotY); g.lineTo(rulerX, pivotY + ropeLength); g.strokePath();
      
      // Ticks
      for (let m = 0; m <= l; m += 0.25) {
        const tickY = pivotY + m * SCALE;
        const isWhole = Math.abs(m - Math.round(m)) < 0.01;
        g.lineStyle(isWhole ? 3 : 2, 0xfcd34d, isWhole ? 1 : 0.6);
        g.beginPath();
        g.moveTo(rulerX - (isWhole ? 10 : 5), tickY);
        g.lineTo(rulerX + (isWhole ? 10 : 5), tickY);
        g.strokePath();
      }
      
      if (isSetup && ampRad > 0) {
        g.lineStyle(2, 0x10b981, 0.4);
        g.beginPath();
        g.arc(pivotX, pivotY, ropeLength * 0.4, Phaser.Math.DegToRad(90 - ampRad), Phaser.Math.DegToRad(90 + ampRad));
        g.strokePath();
        
        g.lineStyle(1.5, 0x10b981, 0.8);
        g.beginPath();
        g.arc(pivotX, pivotY, ropeLength * 0.4, Phaser.Math.DegToRad(90 - ampRad), Phaser.Math.DegToRad(90 + ampRad));
        g.strokePath();
      }
    }
    
    function updatePendulum(angleDeg) {
      if (!mainSceneRef.current) return;
      const l = mainSceneRef.current.simLength;
      const m = mainSceneRef.current.simMass;
      
      const angleRad = Phaser.Math.DegToRad(angleDeg);
      const ropeLength = l * SCALE;
      const bobX = pivotX + ropeLength * Math.sin(angleRad);
      const bobY = pivotY + ropeLength * Math.cos(angleRad);
      
      // Update Sprite
      const dynamicScale = 0.5 + m * 0.5; // Scale base on mass
      bobSprite.setPosition(bobX, bobY);
      bobSprite.setScale(dynamicScale); 
      
      // Draw Rope
      ropeGraphics.clear();
      ropeGraphics.lineStyle(3, 0x94a3b8, 1);
      ropeGraphics.beginPath();
      ropeGraphics.moveTo(pivotX, pivotY);
      ropeGraphics.lineTo(bobX, bobY);
      ropeGraphics.strokePath();
      
      // Draw smooth shadow
      shadowGraphics.clear();
      const shadowOnFloor = floorY - 2;
      if (bobY < shadowOnFloor) {
        const shadowScale = Math.max(0.1, 1 - (shadowOnFloor - bobY) / 600) * dynamicScale * 40;
        shadowGraphics.fillStyle(0x000000, 0.4);
        shadowGraphics.fillEllipse(bobX, shadowOnFloor, shadowScale * 1.5, shadowScale * 0.3);
      }
    }

    function update(time, delta) {
      if (!mainSceneRef.current) return;
      const dt = (delta / 1000) * simulationSpeed;
      const { onUpdate, onTick, length, amplitude, mass, damping, showTrail } = callbacks.current;

      // Sync React props
      if (!isRunning && !isPaused) {
        if (mainSceneRef.current.simLength !== length || mainSceneRef.current.simAmplitude !== amplitude || mainSceneRef.current.simMass !== mass) {
          mainSceneRef.current.simLength = length;
          mainSceneRef.current.simAmplitude = amplitude;
          mainSceneRef.current.simMass = mass;
          updatePendulum(amplitude);
          drawRulerAndArc(length, amplitude, true);
        }
      } else {
        // Hide arc when running
        drawRulerAndArc(mainSceneRef.current.simLength, 0, false);
      }
      
      if (mainSceneRef.current.simDamping !== damping) mainSceneRef.current.simDamping = damping;
      if (trailParticles.emitting !== (showTrail && isRunning && !isPaused)) {
         trailParticles.emitting = (showTrail && isRunning && !isPaused);
      }

      if (isRunning && !isPaused) {
        timeElapsed += dt;
        
        const omega = Math.sqrt(G / mainSceneRef.current.simLength);
        const dampFactor = Math.exp(-mainSceneRef.current.simDamping * timeElapsed);
        currentAngle = mainSceneRef.current.simAmplitude * dampFactor * Math.cos(omega * timeElapsed);
        
        updatePendulum(currentAngle);
        
        // Check for equilibrium crossing (tick logic)
        let didCross = false;
        let tickType = 0; // 1 = right to left, 2 = left to right
        if (prevAngle > 0 && currentAngle <= 0) {
          didCross = true;
          tickType = 1;
        } else if (prevAngle < 0 && currentAngle >= 0) {
          didCross = true;
          tickType = 2;
        }

        if (onTick && didCross) {
          onTick(timeElapsed, tickType);
        }
        
        if (onUpdate && timeElapsed % 0.05 < dt) {
          onUpdate(timeElapsed, currentAngle);
        }
        
        prevAngle = currentAngle;
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
  }, [simulationSpeed]); // Note: simulationSpeed is mostly constant, so usually no unmount

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0f1d]"
    />
  );
});

export default PendulumPhaser;
