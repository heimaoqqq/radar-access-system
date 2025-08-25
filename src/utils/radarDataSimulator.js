// 毫米波雷达数据模拟器 - 基于77GHz FMCW雷达参数
class RadarDataSimulator {
  constructor() {
    // 雷达参数配置
    this.config = {
      frequency: 77, // GHz
      bandwidth: 4, // GHz
      chirpDuration: 50, // μs
      samplingRate: 2e6, // Hz
      maxRange: 20, // meters
      rangeResolution: 0.0375, // meters
      velocityResolution: 0.13, // m/s
      frameRate: 20, // Hz
      antennas: { tx: 2, rx: 4 }
    };

    // 步态特征库
    this.gaitPatterns = {
      '老人A': { stride: 0.6, cadence: 1.8, velocity: 0.8, harmonics: [1, 0.7, 0.4] },
      '老人B': { stride: 0.7, cadence: 2.0, velocity: 1.0, harmonics: [1, 0.6, 0.5] },
      '老人C': { stride: 0.5, cadence: 1.6, velocity: 0.7, harmonics: [1, 0.8, 0.3] },
      '护工': { stride: 0.8, cadence: 2.2, velocity: 1.3, harmonics: [1, 0.5, 0.3] }
    };
  }

  // 生成Range-Doppler图
  generateRangeDopplerMap() {
    const rangeSize = 128;
    const dopplerSize = 64;
    const map = [];

    for (let r = 0; r < rangeSize; r++) {
      const row = [];
      for (let d = 0; d < dopplerSize; d++) {
        // 模拟目标检测
        const range = r * this.config.rangeResolution;
        const doppler = (d - dopplerSize/2) * this.config.velocityResolution;
        
        // 在2.5m处添加人体目标
        const targetRange = 2.5;
        const targetDoppler = 0.8 + Math.sin(Date.now() / 1000) * 0.2;
        
        const rangeMatch = Math.exp(-Math.pow(range - targetRange, 2) / 0.1);
        const dopplerMatch = Math.exp(-Math.pow(doppler - targetDoppler, 2) / 0.05);
        
        const signal = rangeMatch * dopplerMatch * 100;
        const noise = Math.random() * 10;
        
        row.push(Math.min(60, signal + noise));
      }
      map.push(row);
    }
    
    return map;
  }

  // 生成微多普勒特征
  generateMicroDopplerSignature(personId = '老人A') {
    const pattern = this.gaitPatterns[personId] || this.gaitPatterns['老人A'];
    const samples = 256;
    const signature = [];
    
    for (let i = 0; i < samples; i++) {
      const t = i / samples * 3; // 3 seconds window
      let value = 0;
      
      // 主躯干分量
      value += pattern.harmonics[0] * Math.sin(2 * Math.PI * pattern.cadence * t);
      
      // 腿部摆动分量
      value += pattern.harmonics[1] * Math.sin(4 * Math.PI * pattern.cadence * t + Math.PI/4);
      
      // 手臂摆动分量
      value += pattern.harmonics[2] * Math.sin(2 * Math.PI * pattern.cadence * t + Math.PI/2);
      
      // 添加微弱噪声
      value += (Math.random() - 0.5) * 0.1;
      
      signature.push(value * pattern.velocity);
    }
    
    return signature;
  }

  // 获取实时雷达参数
  getRadarMetrics() {
    return {
      snr: 25 + Math.random() * 10, // dB
      clutter: 5 + Math.random() * 3, // dB
      targetCount: Math.floor(Math.random() * 3) + 1,
      processingLoad: 30 + Math.random() * 40, // %
      temperature: 35 + Math.random() * 5, // °C
      powerConsumption: 2.5 + Math.random() * 0.5 // W
    };
  }

  // 生成点云数据
  generatePointCloud() {
    const points = [];
    const numPoints = 20 + Math.floor(Math.random() * 30);
    
    for (let i = 0; i < numPoints; i++) {
      // 模拟人体点云分布
      const height = 0.5 + Math.random() * 1.5; // 0.5-2m 高度
      const distance = 2 + Math.random() * 1; // 2-3m 距离
      const angle = (Math.random() - 0.5) * 30; // ±15度
      
      points.push({
        x: distance * Math.sin(angle * Math.PI / 180),
        y: height,
        z: distance * Math.cos(angle * Math.PI / 180),
        intensity: 50 + Math.random() * 50,
        velocity: -0.5 + Math.random() * 2
      });
    }
    
    return points;
  }

  // 获取系统状态
  getSystemStatus() {
    return {
      radarStatus: 'ACTIVE',
      signalQuality: 'EXCELLENT',
      calibrationStatus: 'CALIBRATED',
      lastCalibration: new Date(Date.now() - 3600000).toISOString(),
      firmwareVersion: 'v2.1.0',
      uptime: Math.floor(Math.random() * 86400) // seconds
    };
  }

  // 生成识别结果
  generateRecognitionResult() {
    const persons = Object.keys(this.gaitPatterns);
    const selectedPerson = persons[Math.floor(Math.random() * persons.length)];
    
    return {
      timestamp: new Date().toISOString(),
      personId: selectedPerson,
      confidence: 0.85 + Math.random() * 0.14,
      gaitFeatures: {
        strideLength: this.gaitPatterns[selectedPerson].stride,
        cadence: this.gaitPatterns[selectedPerson].cadence,
        velocity: this.gaitPatterns[selectedPerson].velocity
      },
      distance: 2.5 + (Math.random() - 0.5) * 0.5,
      angle: (Math.random() - 0.5) * 20,
      height: 1.6 + (Math.random() - 0.5) * 0.2
    };
  }
}

export default RadarDataSimulator;
