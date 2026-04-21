import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PhysicsHeaderBackground = () => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const config = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: containerRef.current,
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 }, // Realistic gravity
          debug: false
        }
      },
      scene: {
        create: create,
        update: update,
      }
    };

    let atoms = [];
    let pointer;

    function create() {
      const scene = this;
      pointer = scene.input.activePointer;

      // Add boundaries
      scene.physics.world.setBounds(0, 0, width, height, true, true, false, true); // Open top

      // Create interactive bouncy atoms
      const colors = [0x22d3ee, 0x818cf8, 0xf472b6, 0x34d399, 0xfbbf24];

      for (let i = 0; i < 30; i++) {
        const radius = Phaser.Math.Between(10, 25);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const x = Phaser.Math.Between(radius, width - radius);
        const y = Phaser.Math.Between(-height, 0); // Drop from above

        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 0.8);
        graphics.fillCircle(0, 0, radius);
        graphics.lineStyle(2, 0xffffff, 0.5);
        graphics.strokeCircle(0, 0, radius);

        // Generate texture from graphics for physics body
        graphics.generateTexture(`atom_${i}`, radius * 2, radius * 2);
        graphics.destroy();

        const atom = scene.physics.add.image(x, y, `atom_${i}`);
        
        // Physics properties
        atom.setCircle(radius);
        atom.setBounce(0.8);
        atom.setCollideWorldBounds(true);
        atom.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(0, 100));
        atom.setDrag(5); // Air resistance
        
        atoms.push(atom);
      }

      // Add collision between atoms
      scene.physics.add.collider(atoms, atoms);

      // Interactive mouse repel
      scene.input.on('pointermove', (p) => {
        atoms.forEach(atom => {
          const dist = Phaser.Math.Distance.Between(p.x, p.y, atom.x, atom.y);
          if (dist < 100) {
            const angle = Phaser.Math.Angle.Between(p.x, p.y, atom.x, atom.y);
            const force = (100 - dist) * 2;
            atom.setVelocityX(atom.body.velocity.x + Math.cos(angle) * force);
            atom.setVelocityY(atom.body.velocity.y + Math.sin(angle) * force);
          }
        });
      });
    }

    function update() {
      // Keep atoms moving slightly, add a subtle upward wind
      atoms.forEach(atom => {
        if (atom.y > height - atom.height) {
            // Apply slight upward force if sitting on bottom
            if(Math.random() > 0.98) {
                atom.setVelocityY(-Phaser.Math.Between(100, 300));
            }
        }
      });
    }

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        gameRef.current.scale.resize(newWidth, newHeight);
        
        // Update physics bounds
        if (gameRef.current.scene.scenes[0]) {
           gameRef.current.scene.scenes[0].physics.world.setBounds(0, 0, newWidth, newHeight, true, true, false, true);
        }
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
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-auto"
    />
  );
};

export default PhysicsHeaderBackground;
