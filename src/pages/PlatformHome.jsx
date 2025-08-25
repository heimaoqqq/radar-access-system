import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Database, BarChart3, Users, Radar, Info } from 'lucide-react';

const PlatformHome = () => {
  const features = [
    {
      title: '步态分析',
      path: '/analytics',
      icon: Activity,
      description: '基于微多普勒频谱的步态特征提取与识别',
      color: 'blue'
    },
    {
      title: '信号处理',
      path: '/signal',
      icon: Radar,
      description: '毫米波雷达信号采集与处理系统',
      color: 'green'
    },
    {
      title: '身份管理',
      path: '/management',
      icon: Users,
      description: '用户身份信息与步态特征管理',
      color: 'purple'
    },
    {
      title: '数据统计',
      path: '/statistics',
      icon: BarChart3,
      description: '系统运行数据统计与分析',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            智能步态识别平台
          </h1>
          <p className="text-lg text-gray-600">
            基于77GHz毫米波雷达的非接触式身份识别系统
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Platform Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">平台简介</h2>
            <p className="text-gray-600 leading-relaxed">
              本平台采用先进的毫米波雷达技术，通过分析人体行走时产生的微多普勒特征，
              实现非接触式的身份识别。系统具有高精度、全天候工作、保护隐私等优势，
              特别适用于养老院、医院等特殊场景的身份管理需求。
            </p>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98.5%</div>
                <div className="text-sm text-gray-500 mt-1">识别准确率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">&lt;200ms</div>
                <div className="text-sm text-gray-500 mt-1">响应时间</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-500 mt-1">全天候运行</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.path}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-${feature.color}-50`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Technical Specifications */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">技术参数</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500">工作频率</div>
              <div className="text-lg font-medium text-gray-900 mt-1">77 GHz</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">调制方式</div>
              <div className="text-lg font-medium text-gray-900 mt-1">FMCW</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">探测距离</div>
              <div className="text-lg font-medium text-gray-900 mt-1">0-20m</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">距离分辨率</div>
              <div className="text-lg font-medium text-gray-900 mt-1">3.75cm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformHome;
