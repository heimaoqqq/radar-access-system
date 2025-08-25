import React, { useEffect, useRef } from 'react';

const Radar3D = ({ data }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;

    const drawRadar = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw radar circles
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = `rgba(0, 255, 0, ${0.05 / i})`;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw cross lines
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.lineTo(centerX, canvas.height - 20);
      ctx.moveTo(20, centerY);
      ctx.lineTo(canvas.width - 20, centerY);
      ctx.stroke();

      // Draw rotating sweep line
      rotationRef.current += 2;
      const sweepAngle = (rotationRef.current * Math.PI) / 180;
      
      // Create gradient for sweep effect
      const gradient = ctx.createLinearGradient(
        centerX, 
        centerY,
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      ctx.stroke();

      // Draw sweep trail
      for (let i = 1; i <= 10; i++) {
        const trailAngle = ((rotationRef.current - i * 5) * Math.PI) / 180;
        ctx.globalAlpha = 1 - i / 10;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(trailAngle) * maxRadius,
          centerY + Math.sin(trailAngle) * maxRadius
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Draw detected targets
      if (data && data.targetDetected) {
        const targetAngle = (data.angle * Math.PI) / 180;
        const targetDistance = (data.distance / 5) * maxRadius;
        
        // Target blip
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(
          centerX + Math.cos(targetAngle) * targetDistance,
          centerY + Math.sin(targetAngle) * targetDistance,
          5,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target info
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.fillText(
          `目标: ${data.distance.toFixed(1)}m`,
          centerX + Math.cos(targetAngle) * targetDistance + 10,
          centerY + Math.sin(targetAngle) * targetDistance
        );
      }

      // Draw range indicators
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      ctx.globalAlpha = 0.5;
      for (let i = 1; i <= 4; i++) {
        ctx.fillText(`${i * 2}m`, centerX + 5, centerY - (maxRadius / 4) * i + 3);
      }
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full bg-black rounded-lg shadow-2xl"
      />
      <div className="absolute top-2 left-2 text-green-400 text-xs font-mono">
        <p>RADAR ACTIVE</p>
        <p>RANGE: 8M</p>
      </div>
    </div>
  );
};

export default Radar3D;
