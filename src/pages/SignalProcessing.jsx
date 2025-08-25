import React, { useState, useEffect } from 'react';
import MicroDopplerSpectrogram from '../components/MicroDopplerSpectrogram';
import RadarDataSimulator from '../utils/radarDataSimulator';

const SignalProcessing = () => {
  const [signalData, setSignalData] = useState(null);
  const [processingMode, setProcessingMode] = useState('realtime');
  const [signalParams, setSignalParams] = useState({
    fftSize: 256,
    overlap: 50,
    windowType: 'hamming'
  });
  
  const simulator = new RadarDataSimulator();

  useEffect(() => {
    const updateSignal = () => {
      setSignalData({
        rangeDoppler: simulator.generateRangeDopplerMap(),
        microDoppler: simulator.generateMicroDopplerSignature(),
        metrics: simulator.getRadarMetrics()
      });
    };

    updateSignal();
    const interval = setInterval(updateSignal, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">信号处理中心</h1>
          <p className="text-gray-600">毫米波雷达信号采集、处理与特征提取</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Signal Parameters */}
          <div className="space-y-4">
            {/* Processing Mode */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">处理模式</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={processingMode === 'realtime'}
                    onChange={() => setProcessingMode('realtime')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">实时处理</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={processingMode === 'batch'}
                    onChange={() => setProcessingMode('batch')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">批处理</span>
                </label>
              </div>
            </div>

            {/* Signal Parameters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">信号参数</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">FFT点数</label>
                  <select 
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={signalParams.fftSize}
                    onChange={(e) => setSignalParams({...signalParams, fftSize: e.target.value})}
                  >
                    <option value="128">128</option>
                    <option value="256">256</option>
                    <option value="512">512</option>
                    <option value="1024">1024</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">重叠率 (%)</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={signalParams.overlap}
                    onChange={(e) => setSignalParams({...signalParams, overlap: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">窗函数</label>
                  <select 
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={signalParams.windowType}
                    onChange={(e) => setSignalParams({...signalParams, windowType: e.target.value})}
                  >
                    <option value="hamming">Hamming</option>
                    <option value="hanning">Hanning</option>
                    <option value="blackman">Blackman</option>
                    <option value="kaiser">Kaiser</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Signal Quality */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">信号质量</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">信噪比</span>
                  <span className="text-gray-900 font-medium">{signalData?.metrics.snr.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">杂波水平</span>
                  <span className="text-gray-900 font-medium">{signalData?.metrics.clutter.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">目标数量</span>
                  <span className="text-gray-900 font-medium">{signalData?.metrics.targetCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <MicroDopplerSpectrogram data={signalData} />
            </div>

            {/* Processing Pipeline */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">处理流程</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">1</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">数据采集</div>
                    <div className="text-xs text-gray-500">77GHz FMCW雷达原始I/Q数据</div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">完成</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">2</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">预处理</div>
                    <div className="text-xs text-gray-500">去噪、滤波、窗函数处理</div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">完成</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white">3</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">特征提取</div>
                    <div className="text-xs text-gray-500">2D-FFT、STFT时频分析</div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">处理中</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-400">4</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-400">输出结果</div>
                    <div className="text-xs text-gray-400">微多普勒特征向量</div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">等待</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalProcessing;
