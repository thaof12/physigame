import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';

const SCALE = 150; // 1m = 150 pixels for better visibility
const G = 9.8;

const FreeFallPhaser = forwardRef(({ dropHeight, ballMass, airResistance, onUpdate, onLand }, ref) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const callbacks = useRef({ dropHeight, ballMass, airResistance, onUpdate, onLand });
  useEffect(() => {
    callbacks.current = { dropHeight, ballMass, airResistance, onUpdate, onLand };
  }, [dropHeight, ballMass, airResistance, onUpdate, onLand]);

  const mainSceneRef = useRef(null);

  useImperativeHandle(ref, () => ({
    dropBall: () => {
      if (mainSceneRef.current) mainSceneRef.current.dropBall();
    },
    resetExperiment: () => {
      if (mainSceneRef.current) mainSceneRef.current.resetExperiment();
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 450;
    const groundY = height - 65;
    const towerX = width / 2;

    const config = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: containerRef.current,
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: G * SCALE },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
          dropHeightProp: dropHeight,
          ballMassProp: ballMass,
          airResistanceProp: airResistance
        }
      }
    };

    let ball;
    let ground;
    let sensor;
    let particles;
    let sparks;
    let platform;
    let towerGraphics;
    let uiText;
    let dropTimer = 0;
    let isDropping = false;
    let hasLanded = false;
    let startY = 0;

    function preload() {
      const scene = this;
      
      // ─── Beautiful Textures using Canvas 2D ───
      const createAppleUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 40; canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // Glow
        const glowGrad = ctx.createRadialGradient(20, 20, 5, 20, 20, 20);
        glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, 40, 40);

        // Core Red Sphere
        const grad = ctx.createRadialGradient(14, 14, 2, 20, 20, 15);
        grad.addColorStop(0, '#fca5a5');
        grad.addColorStop(0.3, '#ef4444');
        grad.addColorStop(0.8, '#991b1b');
        grad.addColorStop(1, '#450a0a');
        ctx.beginPath();
        ctx.arc(20, 20, 15, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.ellipse(14, 12, 5, 3, -Math.PI/6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        return canvas.toDataURL();
      };
      
      const createPlatformUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 90; canvas.height = 12;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 12);
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.5, '#dc2626');
        grad.addColorStop(1, '#991b1b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 90, 12);
        // neon edge
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(0, 0, 90, 2);
        return canvas.toDataURL();
      };

      const createSensorUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 110; canvas.height = 14;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 14);
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(0.5, '#2563eb');
        grad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 110, 14);
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(0, 0, 110, 2);
        return canvas.toDataURL();
      };
      
      const createSparkUrl = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 20; canvas.height = 20;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.2, '#fca5a5');
        grad.addColorStop(1, 'rgba(252, 165, 165, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,20,20);
        return canvas.toDataURL();
      }

      scene.load.image('ballTex', createAppleUrl());
      scene.load.image('platformTex', createPlatformUrl());
      scene.load.image('sensorTex', createSensorUrl());
      scene.load.image('sparkTex', createSparkUrl());
    }

    function create() {
      const scene = this;
      mainSceneRef.current = scene;

      // ─── Environment ───
      const sky = scene.add.graphics();
      sky.fillGradientStyle(0x0a0f1d, 0x0a0f1d, 0x1e293b, 0x1e293b, 1);
      sky.fillRect(0, 0, width, groundY);

      // Stars/Bg particles
      const starG = scene.add.graphics();
      starG.fillStyle(0xffffff, 0.4);
      for(let i=0; i<40; i++){
        starG.fillCircle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, groundY * 0.8), Math.random() * 2);
      }

      towerGraphics = scene.add.graphics();
      drawTower(scene.dropHeightProp);

      // Ground
      groundGraphics(scene, groundY, width, height);
      ground = scene.physics.add.staticImage(width / 2, groundY + 10, 'sensorTex'); // invisible physics ground
      ground.setAlpha(0);
      
      sensor = scene.physics.add.staticImage(towerX, groundY - 7, 'sensorTex');
      platform = scene.add.sprite(towerX, groundY - scene.dropHeightProp * SCALE, 'platformTex');

      ball = scene.physics.add.sprite(towerX, platform.y - 18, 'ballTex');
      ball.setCircle(12, 8, 8); // Adjust physics body inside the 40x40 texture
      ball.setBounce(0.5);
      ball.body.allowGravity = false;

      // Particles
      particles = scene.add.particles(0, 0, 'sparkTex', {
        scale: { start: 1, end: 0 },
        speed: { min: -150, max: 150 },
        gravityY: 300,
        lifespan: 800,
        blendMode: 'ADD',
        emitting: false
      });

      // Trail
      const trail = scene.add.particles(0, 0, 'sparkTex', {
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 200,
        blendMode: 'ADD'
      });
      trail.startFollow(ball);

      scene.physics.add.collider(ball, sensor, handleLand, null, scene);

      scene.dropBall = () => {
        if(isDropping || hasLanded) return;
        isDropping = true;
        dropTimer = 0;
        startY = ball.y;
        
        ball.body.allowGravity = true;
        ball.setVelocity(0, 0);
        
        if (callbacks.current.airResistance) {
          ball.setDragY(30 / (callbacks.current.ballMass || 0.1));
        } else {
          ball.setDragY(0);
        }
      };

      scene.resetExperiment = () => {
        isDropping = false;
        hasLanded = false;
        dropTimer = 0;
        
        ball.body.allowGravity = false;
        ball.setVelocity(0, 0);
        
        updatePlatformHeight(callbacks.current.dropHeight);
        
        // Remove particles safely
        if(particles.killAll) particles.killAll();
      };
      
      const updatePlatformHeight = (h) => {
        platform.y = groundY - h * SCALE;
        ball.y = platform.y - 18;
        drawTower(h);
      };

      scene.updatePlatformHeight = updatePlatformHeight;
    }

    function groundGraphics(scene, y, w, h) {
       const g = scene.add.graphics();
       g.fillGradientStyle(0x1a2138, 0x1a2138, 0x0b1021, 0x0b1021, 1);
       g.fillRect(0, y, w, h - y);
       g.lineStyle(2, 0x3b82f6, 0.4);
       g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.strokePath();
    }

    function drawTower(h) {
      if(!towerGraphics) return;
      towerGraphics.clear();
      
      const towerWidth = 65;
      const towerHeight = h * SCALE + 60;
      const towerTop = groundY - towerHeight;
      
      // Tower Body (metallic)
      towerGraphics.fillGradientStyle(0x334155, 0x1e293b, 0x475569, 0x0f172a, 1);
      towerGraphics.fillRect(towerX - towerWidth / 2, towerTop, towerWidth, groundY - towerTop);
      
      // Neon edges
      towerGraphics.fillStyle(0x3b82f6, 0.5);
      towerGraphics.fillRect(towerX - towerWidth / 2, towerTop, 3, groundY - towerTop);
      towerGraphics.fillRect(towerX + towerWidth / 2 - 3, towerTop, 3, groundY - towerTop);
      
      // Ruler Line
      const rulerX = towerX - towerWidth / 2 - 55;
      towerGraphics.lineStyle(3, 0xf59e0b, 0.8);
      towerGraphics.beginPath();
      towerGraphics.moveTo(rulerX, groundY);
      towerGraphics.lineTo(rulerX, groundY - h * SCALE);
      towerGraphics.strokePath();
      
      // Ticks
      for (let m = 0; m <= h; m += 0.5) {
        const tickY = groundY - m * SCALE;
        const isWhole = Math.abs(m - Math.round(m)) < 0.01;
        towerGraphics.lineStyle(isWhole ? 3 : 2, 0xfcd34d, isWhole ? 1 : 0.6);
        towerGraphics.beginPath();
        towerGraphics.moveTo(rulerX - (isWhole ? 12 : 6), tickY);
        towerGraphics.lineTo(rulerX + (isWhole ? 12 : 6), tickY);
        towerGraphics.strokePath();
      }
    }

    function handleLand(ballObj, sensorObj) {
      if(!hasLanded) {
        hasLanded = true;
        isDropping = false;
        
        particles.emitParticleAt(ballObj.x, ballObj.y + 15, 30);
        
        ballObj.setVelocity(0, 0);
        ballObj.body.allowGravity = false;
        
        if(callbacks.current.onLand) {
          setTimeout(() => callbacks.current.onLand(dropTimer), 10);
        }
      }
    }

    function update(time, delta) {
      if (!mainSceneRef.current) return;
      const dt = delta / 1000;
      const { dropHeight, ballMass, onUpdate } = callbacks.current;

      if (!isDropping && !hasLanded) {
        if (mainSceneRef.current.dropHeightProp !== dropHeight) {
          mainSceneRef.current.dropHeightProp = dropHeight;
          mainSceneRef.current.updatePlatformHeight(dropHeight);
        }
        if (mainSceneRef.current.ballMassProp !== ballMass) {
          mainSceneRef.current.ballMassProp = ballMass;
          const scale = 0.5 + ballMass * 4;
          ball.setScale(scale);
        }
      }

      if (isDropping) {
        dropTimer += dt;
        const fallenPx = ball.y - startY;
        const hFallen = Math.max(0, fallenPx / SCALE);
        const v = ball.body.velocity.y / SCALE;

        if (onUpdate && dropTimer % 0.05 < dt) {
           onUpdate(dropTimer, v, hFallen);
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
  }, []); // Run ONLY once on mount

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0f1d]"
    />
  );
});

export default FreeFallPhaser;
