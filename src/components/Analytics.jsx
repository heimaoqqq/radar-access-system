import React, { useState, useEffect } from 'react';
import DataSimulator from '../utils/dataSimulator';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartData, setChartData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const simulator = new DataSimulator();

  useEffect(() => {
    // 生成图表数据
    const generateChartData = () => {
      const data = [];
      const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
      
      for (let i = 0; i < points; i++) {
        data.push({
          time: i,
          access: Math.floor(Math.random() * 100 + 50),
          alerts: Math.floor(Math.random() * 10),
          accuracy: Math.random() * 5 + 95
        });
      }
      setChartData(data);
    };

    // 生成统计数据
    const generateStatistics = () => {
      setStatistics({
        totalAccess: Math.floor(Math.random() * 1000 + 5000),
        successRate: (Math.random() * 3 + 97).toFixed(1),
        avgResponseTime: (Math.random() * 2 + 5).toFixed(1),
        peakHour: Math.floor(Math.random() * 12) + 8,
        totalAlerts: Math.floor(Math.random() * 50 + 10),
        resolvedAlerts: Math.floor(Math.random() * 40 + 8),
        systemScore: (Math.random() * 10 + 90).toFixed(1)
      });
    };

    generateChartData();
    generateStatistics();

    const interval = setInterval(() => {
      generateChartData();
      generateStatistics();
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📊 数据分析中心</h1>
        <p className="text-gray-300">实时监控和分析系统性能指标</p>
      </div>

      {/* 时间范围选择器 */}
      <div className="mb-6 flex gap-2">
        {['24h', '7d', '30d'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {range === '24h' ? '24小时' : range === '7d' ? '7天' : '30天'}
          </button>
        ))}
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总访问次数"
          value={statistics?.totalAccess || '--'}
          change="+12.5%"
          icon="🚪"
          positive={true}
        />
        <StatCard
          title="成功率"
          value={statistics?.successRate ? `${statistics.successRate}%` : '--'}
          change="+2.3%"
          icon="✅"
          positive={true}
        />
        <StatCard
          title="平均响应时间"
          value={statistics?.avgResponseTime ? `${statistics.avgResponseTime}ms` : '--'}
          change="-15%"
          icon="⚡"
          positive={true}
        />
        <StatCard
          title="系统评分"
          value={statistics?.systemScore || '--'}
          change="+5.2"
          icon="⭐"
          positive={true}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 访问趋势图 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-4">访问趋势</h3>
          <div className="h-64 relative">
            <svg className="w-full h-full">
              {/* Y轴网格线 */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={`${100 - y}%`}
                  x2="100%"
                  y2={`${100 - y}%`}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="5,5"
                />
              ))}
              
              {/* 折线图 */}
              <polyline
                points={chartData.map((d, i) => 
                  `${(i / (chartData.length - 1)) * 100}%,${100 - d.access}%`
                ).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              
              {/* 数据点 */}
              {chartData.map((d, i) => (
                <circle
                  key={i}
                  cx={`${(i / (chartData.length - 1)) * 100}%`}
                  cy={`${100 - d.access}%`}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* 准确率分布 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-4">识别准确率分布</h3>
          <div className="h-64 flex items-end justify-around">
            {chartData.slice(0, 12).map((d, i) => (
              <div
                key={i}
                className="w-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:opacity-80"
                style={{ height: `${d.accuracy}%` }}
              >
                <div className="text-xs text-white text-center mt-1">
                  {d.accuracy.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细分析面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 高峰时段分析 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-4">🕐 高峰时段分析</h3>
          <div className="space-y-3">
            <TimeSlot time="08:00-10:00" traffic={85} />
            <TimeSlot time="12:00-14:00" traffic={92} />
            <TimeSlot time="17:00-19:00" traffic={78} />
            <TimeSlot time="20:00-22:00" traffic={45} />
          </div>
        </div>

        {/* 异常事件统计 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-4">⚠️ 异常事件</h3>
          <div className="space-y-4">
            <EventStat type="跌倒检测" count={3} severity="high" />
            <EventStat type="未授权访问" count={7} severity="medium" />
            <EventStat type="系统异常" count={1} severity="low" />
            <EventStat type="紧急呼叫" count={2} severity="critical" />
          </div>
        </div>

        {/* 居民活动分析 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-4">👥 居民活动统计</h3>
          <div className="space-y-3">
            {simulator.residents.slice(0, 4).map(resident => (
              <div key={resident.id} className="flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{resident.name}</p>
                  <p className="text-gray-400 text-xs">ID: {resident.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{Math.floor(Math.random() * 20 + 10)}次</p>
                  <p className="text-gray-400 text-xs">今日活动</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ title, value, change, icon, positive }) => (
  <div className="bg-gray-800 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className={`text-sm font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </span>
    </div>
    <p className="text-gray-400 text-sm">{title}</p>
    <p className="text-white text-2xl font-bold mt-1">{value}</p>
  </div>
);

// 时间段组件
const TimeSlot = ({ time, traffic }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300 text-sm">{time}</span>
    <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
        style={{ width: `${traffic}%` }}
      />
    </div>
    <span className="text-white font-semibold text-sm">{traffic}%</span>
  </div>
);

// 事件统计组件
const EventStat = ({ type, count, severity }) => {
  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full ${severityColors[severity]} mr-3`} />
        <span className="text-gray-300">{type}</span>
      </div>
      <span className="text-white font-bold">{count}</span>
    </div>
  );
};

export default Analytics;
