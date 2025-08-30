import React, { useState, useEffect } from 'react';
import { Radar } from 'lucide-react';
import DataSimulator from '../utils/dataSimulator';

const Dashboard = () => {
  const [radarData, setRadarData] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLive, setIsLive] = useState(true);
  
  const simulator = new DataSimulator();

  useEffect(() => {
    if (!isLive) return;

    // 更新雷达数据
    const radarInterval = setInterval(() => {
      setRadarData(simulator.generateRadarData());
    }, 100);

    // 更新访问日志
    const logInterval = setInterval(() => {
      const newLog = simulator.generateAccessLog();
      setAccessLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 3000);

    // 更新系统指标
    const metricsInterval = setInterval(() => {
      setMetrics(simulator.generatePerformanceMetrics());
    }, 1000);

    // 生成随机警报
    const alertInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        const newAlert = simulator.generateAlert();
        setAlerts(prev => [newAlert, ...prev].slice(0, 5));
      }
    }, 5000);

    return () => {
      clearInterval(radarInterval);
      clearInterval(logInterval);
      clearInterval(metricsInterval);
      clearInterval(alertInterval);
    };
  }, [isLive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* 顶部控制栏 */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <span className="mr-3">🚨</span>
          智能门禁实时监控中心
        </h1>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isLive 
              ? 'bg-green-500 text-white animate-pulse' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          {isLive ? '🔴 实时监控中' : '⏸️ 已暂停'}
        </button>
      </div>

      {/* 主要指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="系统运行时间"
          value={metrics ? `${Math.floor(metrics.systemUptime / 86400)}天` : '--'}
          icon="⏱️"
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="识别准确率"
          value={metrics ? `${metrics.recognitionAccuracy.toFixed(1)}%` : '--'}
          icon="🎯"
          color="from-green-500 to-green-600"
        />
        <MetricCard
          title="今日扫描"
          value={metrics ? metrics.totalScans.toLocaleString() : '--'}
          icon={<Radar className="w-5 h-5" />}
          color="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="响应时间"
          value={metrics ? `${metrics.averageResponseTime.toFixed(1)}ms` : '--'}
          icon="⚡"
          color="from-yellow-500 to-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 雷达扫描显示 */}
        <div className="lg:col-span-1">
          <RadarDisplay data={radarData} />
        </div>

        {/* 访问日志 */}
        <div className="lg:col-span-1">
          <AccessLogPanel logs={accessLogs} />
        </div>

        {/* 警报面板 */}
        <div className="lg:col-span-1">
          <AlertPanel alerts={alerts} />
        </div>
      </div>

      {/* 步态特征分析 */}
      <div className="mt-6">
        <GaitAnalysis simulator={simulator} />
      </div>
    </div>
  );
};

// 指标卡片组件
const MetricCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-r ${color} rounded-xl p-4 text-white shadow-xl transform hover:scale-105 transition-transform`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

// 雷达显示组件
const RadarDisplay = ({ data }) => {
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (data && data.targetDetected) {
      setTrail(prev => [...prev.slice(-20), data]);
    }
  }, [data]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
      <h3 className="text-white font-bold mb-4 flex items-center">
        <Radar className="w-4 h-4 mr-2" /> 雷达扫描
      </h3>
      <div className="relative h-64 bg-black rounded-lg overflow-hidden">
        {/* 雷达网格 */}
        <svg className="absolute inset-0 w-full h-full">
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="green" strokeOpacity="0.3" />
          <circle cx="50%" cy="50%" r="60%" fill="none" stroke="green" strokeOpacity="0.3" />
          <circle cx="50%" cy="50%" r="90%" fill="none" stroke="green" strokeOpacity="0.3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="green" strokeOpacity="0.3" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="green" strokeOpacity="0.3" />
        </svg>
        
        {/* 扫描线 */}
        {data && (
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-1/2 bg-green-400 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${data.angle}deg)`,
              boxShadow: '0 0 20px rgba(74, 222, 128, 0.6)'
            }}
          />
        )}
        
        {/* 检测点 */}
        {trail.map((point, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"
            style={{
              left: `${50 + Math.cos(point.angle * Math.PI / 180) * point.distance * 15}%`,
              top: `${50 + Math.sin(point.angle * Math.PI / 180) * point.distance * 15}%`,
              opacity: 1 - (i / trail.length)
            }}
          />
        ))}
      </div>
      
      {data && (
        <div className="mt-4 text-green-400 text-sm font-mono">
          <p>信号强度: {(data.signalStrength * 100).toFixed(0)}%</p>
          <p>检测状态: {data.targetDetected ? '目标检测' : '扫描中...'}</p>
        </div>
      )}
    </div>
  );
};

// 访问日志面板
const AccessLogPanel = ({ logs }) => (
  <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
    <h3 className="text-white font-bold mb-4 flex items-center">
      <span className="mr-2">📋</span> 访问记录
    </h3>
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {logs.length === 0 ? (
        <p className="text-gray-400 text-center py-8">等待访问记录...</p>
      ) : (
        logs.map((log, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              log.status === 'authorized' 
                ? 'bg-green-900/30 border border-green-500/30' 
                : 'bg-red-900/30 border border-red-500/30'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-semibold">{log.residentName}</p>
                <p className="text-gray-400 text-xs">{log.accessPoint}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                log.status === 'authorized' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {log.status === 'authorized' ? '✓ 通过' : '✗ 拒绝'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              <span>识别时间: {log.recognitionTime}</span>
              <span className="ml-3">置信度: {log.confidence}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// 警报面板
const AlertPanel = ({ alerts }) => (
  <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
    <h3 className="text-white font-bold mb-4 flex items-center">
      <span className="mr-2 animate-pulse">🚨</span> 实时警报
    </h3>
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {alerts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">系统正常运行</p>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${
              alert.priority === 'critical' 
                ? 'bg-red-900/50 border-red-500 animate-pulse' 
                : alert.priority === 'high'
                ? 'bg-orange-900/30 border-orange-500'
                : 'bg-yellow-900/20 border-yellow-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="text-white font-semibold text-sm">{alert.description}</p>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                alert.priority === 'critical' ? 'bg-red-600' :
                alert.priority === 'high' ? 'bg-orange-600' :
                'bg-yellow-600'
              } text-white`}>
                {alert.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">📍 {alert.location}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

// 步态分析组件
const GaitAnalysis = ({ simulator }) => {
  const [selectedResident, setSelectedResident] = useState('R001');
  const [gaitData, setGaitData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const features = simulator.generateGaitFeatures(selectedResident);
      if (features) {
        setGaitData(prev => [...prev.slice(-30), features]);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [selectedResident, simulator]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg flex items-center">
          <span className="mr-2">👣</span> 步态特征分析
        </h3>
        <select
          value={selectedResident}
          onChange={(e) => setSelectedResident(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
        >
          {simulator.residents.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {gaitData.length > 0 && (
          <>
            <GaitMetric label="步速" value={`${gaitData[gaitData.length - 1].speed.toFixed(2)} m/s`} />
            <GaitMetric label="步长" value={`${gaitData[gaitData.length - 1].stepLength.toFixed(2)} m`} />
            <GaitMetric label="步频" value={`${Math.round(gaitData[gaitData.length - 1].cadence)} 步/分`} />
            <GaitMetric label="对称性" value={`${(gaitData[gaitData.length - 1].gaitSymmetry * 100).toFixed(0)}%`} />
            <GaitMetric label="识别置信度" value={`${(gaitData[gaitData.length - 1].confidence * 100).toFixed(0)}%`} />
          </>
        )}
      </div>
    </div>
  );
};

const GaitMetric = ({ label, value }) => (
  <div className="bg-gray-700 rounded-lg p-3">
    <p className="text-gray-400 text-xs">{label}</p>
    <p className="text-white font-bold text-lg">{value}</p>
  </div>
);

export default Dashboard;
