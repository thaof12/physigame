import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const LabBackground = () => {
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
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        create: create,
        update: update,
      }
    };

    let nodes = [];
    let linesGraphics;

    function create() {
      const scene = this;

      linesGraphics = scene.add.graphics();

      // Create nodes (molecules)
      const numNodes = 40;
      for (let i = 0; i < numNodes; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        
        const node = scene.physics.add.image(x, y, null);
        
        // Draw the visual representation
        const size = Phaser.Math.Between(3, 8);
        const graphics = scene.add.graphics();
        graphics.fillStyle(0x10b981, Phaser.Math.FloatBetween(0.3, 0.8)); // Emerald color
        graphics.fillCircle(0, 0, size);
        graphics.generateTexture(`node_${size}`, size * 2, size * 2);
        graphics.destroy();
        
        node.setTexture(`node_${size}`);
        node.setCircle(size);
        node.setBounce(1);
        node.setCollideWorldBounds(true);
        
        // Slow drifting velocity
        node.setVelocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(-20, 20));
        
        nodes.push(node);
      }

      // Mouse interaction
      scene.input.on('pointermove', (p) => {
        nodes.forEach(node => {
          const dist = Phaser.Math.Distance.Between(p.x, p.y, node.x, node.y);
          if (dist < 150) {
            const angle = Phaser.Math.Angle.Between(p.x, p.y, node.x, node.y);
            // Gentle push away
            node.body.velocity.x += Math.cos(angle) * 2;
            node.body.velocity.y += Math.sin(angle) * 2;
            
            // Limit max speed
            const speed = Math.sqrt(node.body.velocity.x**2 + node.body.velocity.y**2);
            if(speed > 50) {
                node.body.velocity.x = (node.body.velocity.x / speed) * 50;
                node.body.velocity.y = (node.body.velocity.y / speed) * 50;
            }
          }
        });
      });
    }

    function update() {
      // Clear previous lines
      linesGraphics.clear();
      
      // Draw lines between close nodes
      const maxDistance = 120;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Phaser.Math.Distance.Between(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          
          if (dist < maxDistance) {
            // Calculate opacity based on distance
            const alpha = 1 - (dist / maxDistance);
            
            linesGraphics.lineStyle(2, 0x10b981, alpha * 0.4); // Emerald color lines
            linesGraphics.beginPath();
            linesGraphics.moveTo(nodes[i].x, nodes[i].y);
            linesGraphics.lineTo(nodes[j].x, nodes[j].y);
            linesGraphics.strokePath();
          }
        }
      }
    }

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        gameRef.current.scale.resize(newWidth, newHeight);
        
        if (gameRef.current.scene.scenes[0]) {
           gameRef.current.scene.scenes[0].physics.world.setBounds(0, 0, newWidth, newHeight);
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
      className="fixed inset-0 z-0 pointer-events-auto mix-blend-screen"
    />
  );
};

export default LabBackground;
