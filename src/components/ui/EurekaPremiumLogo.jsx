import React, { useState, useEffect } from 'react';
import logoPng from '../../assets/images/eureka_logo_main.png';

const EurekaPremiumLogo = ({ className = "h-12", animated = true }) => {
  const [transparentLogo, setTransparentLogo] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = logoPng;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Remove white/near-white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If it's very bright (near white), make it transparent
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setTransparentLogo(canvas.toDataURL());
    };
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center ${className} select-none`}>
      {/* 1. Base Layer: The absolute original image with background removed via Canvas */}
      {transparentLogo ? (
        <img 
          src={transparentLogo} 
          alt="Eureka Logo" 
          className="h-full w-auto object-contain drop-shadow-sm"
        />
      ) : (
        <div className="h-full aspect-[3/1] bg-slate-100 animate-pulse rounded-lg" />
      )}

      {/* 2. Overlay Layer: Animated Elements (Stars & Flare) */}
      {animated && (
        <svg
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox="0 0 520 180"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="flareGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#FFD60A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Shimmering Stars Overlays - enhancing the ones in the PNG */}
          <g>
            <path d="M420,65 L423,71 L426,65 L423,59 Z" fill="white">
               <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </path>
            
            <path d="M85,35 L88,41 L91,35 L88,29 Z" fill="white">
               <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
            </path>
            
            <circle cx="218" cy="48" r="18" fill="url(#flareGlow)">
               <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      )}
    </div>
  );
};

export default EurekaPremiumLogo;
