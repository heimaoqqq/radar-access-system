import React, { useEffect, useRef, useState } from 'react';

const MicroDopplerSpectrogram = ({ data, isActive = true }) => {
  const canvasRef = useRef(null);
  const [spectrogramData, setSpectrogramData] = useState([]);
  
  // Generate realistic micro-Doppler spectrogram data
  const generateSpectrogramData = () => {
    const timeSteps = 100;
    const frequencyBins = 64;
    const data = [];
    
    for (let t = 0; t < timeSteps; t++) {
      const column = [];
      for (let f = 0; f < frequencyBins; f++) {
        // Simulate walking pattern with multiple harmonics
        const baseFreq = 20 + Math.sin(t * 0.1) * 10;
        const torsoComponent = Math.exp(-Math.pow(f - baseFreq, 2) / 50);
        const limbComponent = Math.exp(-Math.pow(f - (baseFreq * 2), 2) / 30) * 0.7;
        const microMotion = Math.exp(-Math.pow(f - (baseFreq * 0.5), 2) / 40) * 0.5;
        
        const noise = Math.random() * 0.1;
        const value = (torsoComponent + limbComponent + microMotion + noise) * 50;
        
        column.push(Math.min(40, Math.max(-50, value - 50)));
      }
      data.push(column);
    }
    return data;
  };

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setSpectrogramData(generateSpectrogramData());
    }, 2000);
    
    // Initial data
    setSpectrogramData(generateSpectrogramData());
    
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || spectrogramData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, width, height);
    
    // Draw spectrogram
    const timeSteps = spectrogramData.length;
    const frequencyBins = spectrogramData[0]?.length || 64;
    const pixelWidth = width / timeSteps;
    const pixelHeight = height / frequencyBins;
    
    spectrogramData.forEach((column, t) => {
      column.forEach((value, f) => {
        // Color mapping: blue (low) -> green -> yellow -> red (high)
        const normalized = (value + 50) / 90; // Normalize to 0-1
        let r, g, b;
        
        if (normalized < 0.25) {
          r = 0;
          g = 0;
          b = normalized * 4 * 255;
        } else if (normalized < 0.5) {
          r = 0;
          g = (normalized - 0.25) * 4 * 255;
          b = 255 - (normalized - 0.25) * 4 * 255;
        } else if (normalized < 0.75) {
          r = (normalized - 0.5) * 4 * 255;
          g = 255;
          b = 0;
        } else {
          r = 255;
          g = 255 - (normalized - 0.75) * 4 * 255;
          b = 0;
        }
        
        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(
          t * pixelWidth,
          height - (f + 1) * pixelHeight,
          pixelWidth,
          pixelHeight
        );
      });
    });
    
    // Draw axes labels
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.setLineDash([2, 2]);
    
    // Vertical grid lines (time)
    for (let i = 0; i <= 5; i++) {
      const x = (width / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines (frequency)
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }, [spectrogramData]);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-white font-semibold">微多普勒频谱图</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Range: 2.5m</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-400">77GHz FMCW</span>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full rounded border border-gray-700"
        />
        
        {/* Axis labels */}
        <div className="absolute bottom-0 left-0 text-xs text-gray-400 -mb-5">0s</div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-400 -mb-5">3s</div>
        <div className="absolute top-0 left-0 text-xs text-gray-400 -ml-8">2 kHz</div>
        <div className="absolute bottom-0 left-0 text-xs text-gray-400 -ml-8">-2 kHz</div>
        
        {/* Color bar legend */}
        <div className="absolute right-0 top-1/2 transform translate-x-12 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">dB</span>
            <div className="w-4 h-40 bg-gradient-to-t from-blue-900 via-green-500 to-red-500 rounded"></div>
            <span className="text-xs text-gray-400 mt-1">-50</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-800 rounded p-2">
          <span className="text-gray-400">主频率:</span>
          <span className="text-green-400 ml-1">0.8 Hz</span>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <span className="text-gray-400">步速:</span>
          <span className="text-green-400 ml-1">1.2 m/s</span>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <span className="text-gray-400">SNR:</span>
          <span className="text-green-400 ml-1">28 dB</span>
        </div>
      </div>
    </div>
  );
};

export default MicroDopplerSpectrogram;
