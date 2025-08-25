import React, { useState, useEffect } from 'react';
import RadarMonitor from './RadarMonitor';
import RadarDataSimulator from '../utils/radarDataSimulator';

const ProfessionalDashboard = () => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const simulator = new RadarDataSimulator();

  useEffect(() => {
    // 生成初始访问记录
    const generateAccessLog = () => {
      const result = simulator.generateRecognitionResult();
      return {
        id: Date.now(),
        time: new Date().toLocaleTimeString('zh-CN'),
        personId: result.personId,
        confidence: result.confidence,
        status: result.confidence > 0.9 ? 'AUTHORIZED' : 'PENDING',
        distance: result.distance,
        velocity: result.gaitFeatures.velocity
      };
    };

    // 初始化日志
    const initialLogs = [];
    for (let i = 0; i < 5; i++) {
      initialLogs.push(generateAccessLog());
    }
    setAccessLogs(initialLogs);

    // 定时更新
    const interval = setInterval(() => {
      setAccessLogs(prev => {
        const newLog = generateAccessLog();
        return [newLog, ...prev.slice(0, 9)];
      });
      
      setSystemMetrics(simulator.getSystemStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white">毫米波雷达步态识别系统</h1>
              <p className="text-xs text-gray-400">77GHz FMCW Radar Gait Recognition System</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">系统运行中</span>
              </div>
              <span className="text-gray-500">{new Date().toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Radar Monitor Section */}
        <div className="mb-6">
          <RadarMonitor />
        </div>

        {/* Bottom Section - Access Logs and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Access Logs */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">访问记录</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2">时间</th>
                    <th className="text-left py-2">身份</th>
                    <th className="text-left py-2">置信度</th>
                    <th className="text-left py-2">距离(m)</th>
                    <th className="text-left py-2">速度(m/s)</th>
                    <th className="text-left py-2">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-800 text-gray-300">
                      <td className="py-2">{log.time}</td>
                      <td className="py-2 font-medium text-white">{log.personId}</td>
                      <td className="py-2">
                        <span className={log.confidence > 0.9 ? 'text-green-400' : 'text-yellow-400'}>
                          {(log.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2">{log.distance.toFixed(2)}</td>
                      <td className="py-2">{log.velocity.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'AUTHORIZED' 
                            ? 'bg-green-900/50 text-green-400 border border-green-800' 
                            : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                        }`}>
                          {log.status === 'AUTHORIZED' ? '已授权' : '待验证'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            {/* Daily Statistics */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">今日统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">总识别次数</span>
                  <span className="text-lg font-bold text-white">847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">识别成功率</span>
                  <span className="text-lg font-bold text-green-400">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">平均置信度</span>
                  <span className="text-lg font-bold text-blue-400">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">异常事件</span>
                  <span className="text-lg font-bold text-yellow-400">3</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">性能指标</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">处理延迟</span>
                    <span className="text-green-400">125ms</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">数据吞吐量</span>
                    <span className="text-blue-400">2.4GB/h</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">存储使用</span>
                    <span className="text-yellow-400">45.2GB</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
