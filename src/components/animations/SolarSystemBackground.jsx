import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const SolarSystemBackground = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    // Determine screen size for initial config
    const width = window.innerWidth;
    const height = window.innerHeight;

    const config = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: 'solar-system-game-container',
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
        }
      },
      scene: {
        create: create,
        update: update,
      }
    };

    let planets = [];
    let sun;
    let stars = [];
    let pointerPos = { x: width / 2, y: height / 2 };

    function create() {
      const scene = this;

      // Create random stars
      for (let i = 0; i < 200; i++) {
        const x = Phaser.Math.Between(0, width * 1.5);
        const y = Phaser.Math.Between(0, height * 1.5);
        const size = Phaser.Math.FloatBetween(0.5, 2.5);
        const alpha = Phaser.Math.FloatBetween(0.2, 0.9);
        
        const star = scene.add.circle(x, y, size, 0xffffff, alpha);
        stars.push({
          sprite: star,
          baseX: x,
          baseY: y,
          speed: Phaser.Math.FloatBetween(0.1, 0.5)
        });
        
        // Twinkle effect
        scene.tweens.add({
          targets: star,
          alpha: Phaser.Math.FloatBetween(0.1, 0.3),
          duration: Phaser.Math.Between(1000, 3000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Add central sun
      const centerX = width / 2;
      const centerY = height / 2;
      
      sun = scene.add.circle(centerX, centerY, 40, 0xfce570, 1);
      // Sun glow
      const sunGlow = scene.add.circle(centerX, centerY, 60, 0xfce570, 0.3);
      const sunGlow2 = scene.add.circle(centerX, centerY, 90, 0xfce570, 0.1);

      scene.tweens.add({
        targets: [sunGlow, sunGlow2],
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Colors for planets to make them look distinct and modern
      const planetData = [
        { radius: 8, distance: 100, speed: 0.02, color: 0x888888 }, // Mercury-ish
        { radius: 12, distance: 160, speed: 0.015, color: 0xe0a255 }, // Venus-ish
        { radius: 14, distance: 230, speed: 0.01, color: 0x4b90e2 }, // Earth-ish
        { radius: 10, distance: 300, speed: 0.008, color: 0xe24b4b }, // Mars-ish
        { radius: 25, distance: 420, speed: 0.005, color: 0xe2b44b }, // Jupiter-ish (fast)
        { radius: 20, distance: 550, speed: 0.003, color: 0xdbd8c3, hasRing: true }, // Saturn-ish
        { radius: 16, distance: 680, speed: 0.002, color: 0x4bc4e2 }, // Uranus-ish
      ];

      planets = planetData.map(data => {
        // Draw orbital path
        scene.add.circle(centerX, centerY, data.distance, 0xffffff, 0.05).setStrokeStyle(1, 0xffffff, 0.1);
        
        const container = scene.add.container(centerX, centerY);
        const planet = scene.add.circle(0, -data.distance, data.radius, data.color, 1);
        
        if (data.hasRing) {
          const ring = scene.add.ellipse(0, -data.distance, data.radius * 3, data.radius * 1.5, 0xffffff, 0.3);
          ring.setAngle(20);
          container.add(ring);
        }
        
        container.add(planet);
        
        return {
          container,
          speed: data.speed,
          angle: Phaser.Math.FloatBetween(0, Math.PI * 2)
        };
      });

      // Interactive mouse
      scene.input.on('pointermove', (pointer) => {
        pointerPos.x = pointer.x;
        pointerPos.y = pointer.y;
      });
    }

    function update() {
      // Rotate planets
      planets.forEach(p => {
        p.angle += p.speed;
        p.container.rotation = p.angle;
      });

      // Parallax effect based on mouse position
      const targetMouseX = pointerPos.x;
      const targetMouseY = pointerPos.y;
      
      const offsetX = (width / 2 - targetMouseX) * 0.05;
      const offsetY = (height / 2 - targetMouseY) * 0.05;

      stars.forEach(starData => {
        starData.sprite.x = starData.baseX + offsetX * starData.speed;
        starData.sprite.y = starData.baseY + offsetY * starData.speed;
      });
    }

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleResize = () => {
      if (gameRef.current && gameRef.current.scale) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="solar-system-game-container" 
      className="fixed inset-0 z-0 pointer-events-auto overflow-hidden bg-slate-950"
    />
  );
};

export default SolarSystemBackground;
