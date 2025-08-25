import React, { useState, useEffect } from 'react';
import RadarDataSimulator from '../utils/radarDataSimulator';

const GaitAnalysis = () => {
  const [selectedPerson, setSelectedPerson] = useState('老人A');
  const [analysisData, setAnalysisData] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const simulator = new RadarDataSimulator();

  const personDatabase = [
    { id: '老人A', registered: '2024-01-15', samples: 1245, accuracy: 98.2 },
    { id: '老人B', registered: '2024-01-20', samples: 987, accuracy: 97.8 },
    { id: '老人C', registered: '2024-02-01', samples: 856, accuracy: 96.5 },
    { id: '护工', registered: '2024-01-10', samples: 2156, accuracy: 99.1 }
  ];

  useEffect(() => {
    const updateAnalysis = () => {
      const signature = simulator.generateMicroDopplerSignature(selectedPerson);
      const result = simulator.generateRecognitionResult();
      
      setAnalysisData({
        signature,
        features: result.gaitFeatures,
        metrics: {
          mainFrequency: result.gaitFeatures.cadence,
          harmonics: [1.0, 0.65, 0.42, 0.28],
          snr: 25 + Math.random() * 10,
          variance: 0.05 + Math.random() * 0.03
        }
      });
    };

    updateAnalysis();
    const interval = setInterval(updateAnalysis, 3000);
    return () => clearInterval(interval);
  }, [selectedPerson]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">步态特征分析系统</h1>
        <p className="text-gray-600">基于微多普勒频谱的步态模式识别与分析</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 人员选择和信息 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">数据库人员</h3>
            <div className="space-y-2">
              {personDatabase.map(person => (
                <button
                  key={person.id}
                  onClick={() => setSelectedPerson(person.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedPerson === person.id 
                      ? 'bg-blue-50 border border-blue-500 text-blue-900' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{person.id}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        注册: {person.registered}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">{person.accuracy}%</div>
                      <div className="text-xs text-gray-500">{person.samples} 样本</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">特征参数</h3>
            {analysisData && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">步频</span>
                  <span className="text-gray-900 font-medium">{analysisData.features.cadence.toFixed(2)} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">步长</span>
                  <span className="text-gray-900 font-medium">{analysisData.features.stride.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">步速</span>
                  <span className="text-gray-900 font-medium">{analysisData.features.velocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">信噪比</span>
                  <span className="text-gray-900 font-medium">{analysisData.metrics.snr.toFixed(1)} dB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 中间 - 频谱分析 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 微多普勒时频图 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">微多普勒时频分析</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`px-3 py-1 text-xs rounded ${
                    comparisonMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  对比模式
                </button>
              </div>
            </div>
            
            <div className="bg-black rounded p-4">
              <canvas
                width={600}
                height={250}
                className="w-full"
                ref={canvas => {
                  if (canvas && analysisData) {
                    const ctx = canvas.getContext('2d');
                    const width = canvas.width;
                    const height = canvas.height;
                    
                    // 清空画布
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, width, height);
                    
                    // 绘制频谱图
                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradient.addColorStop(0, '#ff0000');
                    gradient.addColorStop(0.3, '#ffff00');
                    gradient.addColorStop(0.5, '#00ff00');
                    gradient.addColorStop(0.7, '#00ffff');
                    gradient.addColorStop(1, '#0000ff');
                    
                    // 模拟微多普勒模式
                    for (let t = 0; t < width; t++) {
                      for (let f = 0; f < height; f++) {
                        const time = t / width * 3;
                        const freq = (f / height - 0.5) * 4;
                        
                        // 躯干分量
                        const torso = Math.sin(2 * Math.PI * analysisData.features.cadence * time);
                        const torsoMatch = Math.exp(-Math.pow(freq - torso, 2) / 0.1);
                        
                        // 腿部分量（二次谐波）
                        const leg = Math.sin(4 * Math.PI * analysisData.features.cadence * time);
                        const legMatch = Math.exp(-Math.pow(freq - leg * 1.5, 2) / 0.05) * 0.7;
                        
                        // 手臂分量
                        const arm = Math.sin(2 * Math.PI * analysisData.features.cadence * time + Math.PI/2);
                        const armMatch = Math.exp(-Math.pow(freq - arm * 0.5, 2) / 0.08) * 0.5;
                        
                        const intensity = (torsoMatch + legMatch + armMatch) * 255;
                        
                        if (intensity > 20) {
                          const alpha = Math.min(1, intensity / 255);
                          ctx.fillStyle = `rgba(0, ${Math.floor(intensity)}, ${Math.floor(intensity * 0.8)}, ${alpha})`;
                          ctx.fillRect(t, height - f, 1, 1);
                        }
                      }
                    }
                    
                    // 添加网格
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 0.5;
                    for (let i = 0; i <= 5; i++) {
                      const x = (width / 5) * i;
                      ctx.beginPath();
                      ctx.moveTo(x, 0);
                      ctx.lineTo(x, height);
                      ctx.stroke();
                    }
                    
                    // 标签
                    ctx.fillStyle = '#666';
                    ctx.font = '10px Arial';
                    ctx.fillText('0s', 5, height - 5);
                    ctx.fillText('3s', width - 20, height - 5);
                    ctx.fillText('2 kHz', 5, 15);
                    ctx.fillText('-2 kHz', 5, height - 15);
                  }
                }}
              />
            </div>
            
            {/* 频谱参数 */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {analysisData?.metrics.harmonics.map((harmonic, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xs text-gray-500">{idx + 1}次谐波</div>
                  <div className="text-sm font-bold text-gray-900">{(harmonic * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* 特征向量可视化 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">特征向量分布</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-600 mb-2">主成分分析 (PCA)</div>
                <div className="h-32 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    {/* 模拟PCA散点图 */}
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
                        style={{
                          left: `${45 + Math.random() * 10}%`,
                          top: `${45 + Math.random() * 10}%`
                        }}
                      />
                    ))}
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full"
                         style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-600 mb-2">GEV分布拟合</div>
                <div className="h-32 flex items-end justify-around px-2">
                  {[0.2, 0.5, 0.8, 0.9, 1.0, 0.9, 0.7, 0.4, 0.2].map((height, i) => (
                    <div
                      key={i}
                      className="bg-blue-500 w-3 rounded-t"
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 - 识别历史 */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">最近识别记录</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-700 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">
                  {new Date(Date.now() - i * 3600000).toLocaleTimeString('zh-CN')}
                </span>
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                  匹配成功
                </span>
              </div>
              <div className="text-sm font-medium text-white mb-1">{selectedPerson}</div>
              <div className="text-xs text-gray-400">
                置信度: {(95 + Math.random() * 4).toFixed(1)}% | 
                距离: {(2.3 + Math.random() * 0.4).toFixed(1)}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GaitAnalysis;
