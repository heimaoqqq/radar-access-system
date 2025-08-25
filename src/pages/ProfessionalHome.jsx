import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Database, BarChart3, Cpu, Zap } from 'lucide-react';

const ProfessionalHome = () => {
  const systemSpecs = [
    { label: '工作频率', value: '77 GHz', unit: 'FMCW' },
    { label: '探测距离', value: '0-20', unit: 'm' },
    { label: '距离分辨率', value: '3.75', unit: 'cm' },
    { label: '速度分辨率', value: '0.13', unit: 'm/s' },
    { label: '识别准确率', value: '98.5', unit: '%' },
    { label: '响应时间', value: '<200', unit: 'ms' }
  ];

  const modules = [
    {
      title: '雷达监控',
      path: '/dashboard',
      icon: Activity,
      description: '实时微多普勒频谱监测与Range-Doppler图显示',
      status: 'online',
      color: 'blue'
    },
    {
      title: '步态分析',
      path: '/analytics',
      icon: BarChart3,
      description: '基于GEV分布的步态特征提取与模式识别',
      status: 'online',
      color: 'green'
    },
    {
      title: '身份管理',
      path: '/management',
      icon: Database,
      description: '注册用户步态特征库管理与更新',
      status: 'online',
      color: 'purple'
    },
    {
      title: '性能统计',
      path: '/statistics',
      icon: Cpu,
      description: '系统性能指标实时监控与历史数据分析',
      status: 'online',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                毫米波雷达步态识别门禁系统
              </h1>
              <p className="text-gray-400">
                77GHz FMCW Millimeter-Wave Radar Based Gait Recognition Access Control System
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">系统运行正常</span>
                </div>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-400">Version 2.1.0</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">系统运行时间</div>
              <div className="text-2xl font-mono text-white">24:37:15</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* System Specifications */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">系统规格参数</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {systemSpecs.map((spec, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">{spec.label}</div>
                <div className="text-xl font-bold text-white">
                  {spec.value}
                  <span className="text-sm text-gray-400 ml-1">{spec.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">功能模块</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, idx) => (
              <Link
                key={idx}
                to={module.path}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${module.color}-900/20 border border-${module.color}-800/30`}>
                    <module.icon className={`w-6 h-6 text-${module.color}-400`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">在线</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">系统架构</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data Acquisition */}
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-4 mb-3">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">数据采集层</h3>
                <p className="text-xs text-gray-400">
                  77GHz FMCW雷达实时采集<br/>
                  原始I/Q数据流处理
                </p>
              </div>
              <div className="text-xs text-gray-500">
                采样率: 2 MHz | 帧率: 20 Hz
              </div>
            </div>

            {/* Signal Processing */}
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-4 mb-3">
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">信号处理层</h3>
                <p className="text-xs text-gray-400">
                  2D-FFT变换处理<br/>
                  微多普勒特征提取
                </p>
              </div>
              <div className="text-xs text-gray-500">
                STFT窗口: 256点 | 重叠: 50%
              </div>
            </div>

            {/* Recognition */}
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-4 mb-3">
                <Cpu className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">识别决策层</h3>
                <p className="text-xs text-gray-400">
                  GEV分布模型匹配<br/>
                  深度学习分类决策
                </p>
              </div>
              <div className="text-xs text-gray-500">
                模型: CNN-LSTM | 精度: 98.5%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            进入监控中心
          </Link>
          <Link
            to="/showcase"
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            查看项目展示
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalHome;
