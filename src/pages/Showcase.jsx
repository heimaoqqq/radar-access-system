import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar } from 'lucide-react';
import DataSimulator from '../utils/dataSimulator';

const Showcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    accuracy: 98.5,
    responseTime: 6.2,
    uptime: 99.9,
    dailyScans: 8542
  });

  const simulator = new DataSimulator();

  const features = [
    {
      title: '非接触式识别',
      description: '基于毫米波雷达的步态识别，无需物理接触或视觉图像',
      icon: <Radar className="w-8 h-8" />,
      benefits: ['保护隐私', '全天候工作', '无需配合']
    },
    {
      title: 'AI深度学习',
      description: '采用最新深度学习算法，持续优化识别精度',
      icon: '🧠',
      benefits: ['98.5%准确率', '自适应学习', '实时处理']
    },
    {
      title: '安全保障',
      description: '专为养老院设计的安全监护系统',
      icon: '🛡️',
      benefits: ['跌倒检测', '异常预警', '24/7监控']
    },
    {
      title: '智能管理',
      description: '完善的后台管理和数据分析功能',
      icon: '📊',
      benefits: ['实时数据', '趋势分析', '报表导出']
    }
  ];

  const achievements = [
    { label: '识别准确率', value: '98.5%', icon: '🎯' },
    { label: '平均响应时间', value: '6.2秒', icon: '⚡' },
    { label: '系统稳定性', value: '99.9%', icon: '💪' },
    { label: '日处理量', value: '8000+', icon: '📈' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
      
      // Update stats with slight variations
      setStats({
        accuracy: 98.5 + (Math.random() - 0.5) * 0.5,
        responseTime: 6.2 + (Math.random() - 0.5) * 0.4,
        uptime: 99.9,
        dailyScans: Math.floor(8000 + Math.random() * 1000)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
        </div>
        
        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-white mb-6">
              雷达步态识别
              <span className="block text-4xl mt-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                智能门禁系统
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              基于深度学习的非接触式身份识别技术，专为养老院场景优化设计，
              提供安全、便捷、智能的出入管理解决方案
            </p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
              {achievements.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-sm text-gray-300">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            核心技术优势
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Feature Selector */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`cursor-pointer p-6 rounded-xl transition-all ${
                    activeFeature === index
                      ? 'bg-white/20 shadow-2xl scale-105'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  whileHover={{ x: 10 }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{feature.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Details */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8"
            >
              <div className="text-5xl mb-6">{features[activeFeature].icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {features[activeFeature].title}
              </h3>
              <p className="text-gray-300 mb-6">
                {features[activeFeature].description}
              </p>
              <div className="space-y-3">
                {features[activeFeature].benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 bg-black/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            实时演示
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Radar Animation */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">雷达扫描</h3>
              <div className="relative h-48 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-green-500/30 rounded-full animate-ping"></div>
                  <div className="absolute w-24 h-24 border-2 border-green-500/50 rounded-full animate-ping animation-delay-200"></div>
                  <div className="absolute w-16 h-16 border-2 border-green-500/70 rounded-full animate-ping animation-delay-400"></div>
                  <div className="absolute w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-green-400 text-center mt-4">扫描进行中...</p>
            </div>

            {/* Recognition Status */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">识别状态</h3>
              <div className="space-y-3">
                <StatusItem label="信号强度" value="95%" status="high" />
                <StatusItem label="识别进度" value="100%" status="complete" />
                <StatusItem label="置信度" value="98.5%" status="high" />
                <StatusItem label="响应时间" value="6.2s" status="normal" />
              </div>
            </div>

            {/* System Health */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">系统健康</h3>
              <div className="space-y-3">
                <HealthIndicator label="CPU使用率" value={25} />
                <HealthIndicator label="内存使用" value={45} />
                <HealthIndicator label="网络延迟" value={12} />
                <HealthIndicator label="系统负载" value={35} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Ready Badge */}
      <section className="py-12 text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl">
            🏆 竞赛展示版 v2.0
          </div>
        </motion.div>
      </section>
    </div>
  );
};

// Status Item Component
const StatusItem = ({ label, value, status }) => {
  const colors = {
    high: 'text-green-400',
    normal: 'text-blue-400',
    low: 'text-yellow-400',
    complete: 'text-green-400'
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold ${colors[status]}`}>{value}</span>
    </div>
  );
};

// Health Indicator Component
const HealthIndicator = ({ label, value }) => {
  const getColor = (val) => {
    if (val < 30) return 'bg-green-500';
    if (val < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-full rounded-full transition-all ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default Showcase;
