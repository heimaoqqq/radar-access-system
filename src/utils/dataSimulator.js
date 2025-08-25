// 实时数据模拟器
class DataSimulator {
  constructor() {
    this.residents = [
      { id: 'R001', name: '张三', age: 72, gaitPattern: 'normal', risk: 'low' },
      { id: 'R002', name: '李四', age: 68, gaitPattern: 'slow', risk: 'medium' },
      { id: 'R003', name: '王五', age: 75, gaitPattern: 'assisted', risk: 'high' },
      { id: 'R004', name: '赵六', age: 70, gaitPattern: 'normal', risk: 'low' },
      { id: 'R005', name: '孙七', age: 82, gaitPattern: 'slow', risk: 'medium' }
    ];
    
    this.gaitPatterns = {
      normal: { speed: 1.2, stepLength: 0.6, cadence: 110 },
      slow: { speed: 0.8, stepLength: 0.4, cadence: 90 },
      assisted: { speed: 0.5, stepLength: 0.3, cadence: 70 }
    };
  }

  // 生成实时雷达数据
  generateRadarData() {
    const angle = (Date.now() / 50) % 360;
    const distance = 2 + Math.sin(Date.now() / 1000) * 0.5;
    const strength = 0.7 + Math.random() * 0.3;
    
    return {
      timestamp: new Date().toISOString(),
      angle,
      distance,
      signalStrength: strength,
      targetDetected: Math.random() > 0.3
    };
  }

  // 生成步态特征数据
  generateGaitFeatures(residentId) {
    const resident = this.residents.find(r => r.id === residentId);
    if (!resident) return null;
    
    const pattern = this.gaitPatterns[resident.gaitPattern];
    const variance = 0.1;
    
    return {
      timestamp: new Date().toISOString(),
      residentId,
      speed: pattern.speed + (Math.random() - 0.5) * variance,
      stepLength: pattern.stepLength + (Math.random() - 0.5) * variance * 0.5,
      cadence: pattern.cadence + (Math.random() - 0.5) * 10,
      gaitSymmetry: 0.85 + Math.random() * 0.15,
      confidence: 0.90 + Math.random() * 0.09
    };
  }

  // 生成访问日志
  generateAccessLog() {
    const resident = this.residents[Math.floor(Math.random() * this.residents.length)];
    const status = Math.random() > 0.05 ? 'authorized' : 'denied';
    
    return {
      timestamp: new Date().toISOString(),
      residentId: resident.id,
      residentName: resident.name,
      accessPoint: ['主门', '后门', '侧门'][Math.floor(Math.random() * 3)],
      status,
      recognitionTime: (Math.random() * 2 + 5).toFixed(2) + 's',
      confidence: (Math.random() * 0.15 + 0.85).toFixed(2)
    };
  }

  // 生成系统性能指标
  generatePerformanceMetrics() {
    return {
      timestamp: new Date().toISOString(),
      cpuUsage: Math.random() * 30 + 20,
      memoryUsage: Math.random() * 20 + 60,
      recognitionAccuracy: Math.random() * 5 + 95,
      averageResponseTime: Math.random() * 1 + 5,
      systemUptime: Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 1000),
      totalScans: Math.floor(Math.random() * 1000 + 5000),
      successRate: Math.random() * 3 + 97
    };
  }

  // 生成异常事件
  generateAlert() {
    const types = ['fall_detected', 'unauthorized_access', 'system_anomaly', 'emergency'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    return {
      id: `ALERT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: types[Math.floor(Math.random() * types.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      location: ['主楼入口', '花园区', '食堂', '活动室'][Math.floor(Math.random() * 4)],
      description: '检测到异常步态模式，可能存在跌倒风险',
      status: 'active'
    };
  }
}

export default DataSimulator;
