import React, { useState, useEffect } from 'react';
import MicroDopplerSpectrogram from './MicroDopplerSpectrogram';
import RadarDataSimulator from '../utils/radarDataSimulator';

const RadarMonitor = () => {
  const [radarData, setRadarData] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [recognition, setRecognition] = useState(null);
  const [pointCloud, setPointCloud] = useState([]);
  
  const simulator = new RadarDataSimulator();

  useEffect(() => {
    const updateData = () => {
      setRadarData(simulator.generateRangeDopplerMap());
      setMetrics(simulator.getRadarMetrics());
      setPointCloud(simulator.generatePointCloud());
      
      // 模拟识别事件
      if (Math.random() > 0.7) {
        setRecognition(simulator.generateRecognitionResult());
      }
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 text-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 微多普勒频谱 */}
        <div className="lg:col-span-2">
          <MicroDopplerSpectrogram data={radarData} />
          
          {/* Range-Doppler Map */}
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">Range-Doppler Map</h3>
            <div className="bg-black rounded p-2">
              <canvas 
                width={400} 
                height={200} 
                className="w-full"
                ref={canvas => {
                  if (canvas && radarData) {
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.createImageData(400, 200);
                    
                    // 简化的Range-Doppler渲染
                    for (let i = 0; i < imageData.data.length; i += 4) {
                      const value = Math.random() * 50;
                      imageData.data[i] = 0;     // R
                      imageData.data[i + 1] = value; // G
                      imageData.data[i + 2] = value * 2; // B
                      imageData.data[i + 3] = 255;   // A
                    }
                    ctx.putImageData(imageData, 0, 0);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* 右侧 - 参数面板 */}
        <div className="space-y-4">
          {/* 雷达参数 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">雷达参数</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">工作频率</span>
                <span className="text-green-400">77 GHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">调制方式</span>
                <span className="text-green-400">FMCW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">带宽</span>
                <span className="text-green-400">4 GHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">最大探测距离</span>
                <span className="text-green-400">20 m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">距离分辨率</span>
                <span className="text-green-400">3.75 cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">速度分辨率</span>
                <span className="text-green-400">0.13 m/s</span>
              </div>
            </div>
          </div>

          {/* 实时指标 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">信号质量</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">信噪比</span>
                  <span className="text-green-400">{metrics.snr?.toFixed(1)} dB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (metrics.snr || 0) * 3)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">杂波抑制</span>
                  <span className="text-blue-400">{metrics.clutter?.toFixed(1)} dB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (metrics.clutter || 0) * 10)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 识别结果 */}
          {recognition && (
            <div className="bg-gray-800 rounded-lg p-4 border border-green-500/30">
              <h3 className="text-sm font-semibold mb-3 text-green-400">识别结果</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">身份</span>
                  <span className="text-white font-bold">{recognition.personId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">置信度</span>
                  <span className="text-green-400">{(recognition.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">步速</span>
                  <span className="text-white">{recognition.gaitFeatures.velocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">步频</span>
                  <span className="text-white">{recognition.gaitFeatures.cadence.toFixed(1)} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">距离</span>
                  <span className="text-white">{recognition.distance.toFixed(2)} m</span>
                </div>
              </div>
            </div>
          )}

          {/* 系统状态 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">系统状态</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 rounded p-2">
                <span className="text-gray-400 block">CPU</span>
                <span className="text-white font-bold">{metrics.processingLoad?.toFixed(0)}%</span>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <span className="text-gray-400 block">温度</span>
                <span className="text-white font-bold">{metrics.temperature?.toFixed(1)}°C</span>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <span className="text-gray-400 block">功耗</span>
                <span className="text-white font-bold">{metrics.powerConsumption?.toFixed(1)}W</span>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <span className="text-gray-400 block">目标数</span>
                <span className="text-white font-bold">{metrics.targetCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarMonitor;
