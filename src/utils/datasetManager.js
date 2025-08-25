// Dataset管理器 - 模拟从dataset文件夹读取图像
class DatasetManager {
  constructor() {
    // 每个用户的图像数量（基于实际文件夹内容）
    this.userImageCounts = {
      'ID_1': 150,
      'ID_2': 150,
      'ID_3': 153,
      'ID_4': 154,
      'ID_5': 160,
      'ID_6': 172,
      'ID_7': 159,
      'ID_8': 156,
      'ID_9': 170,
      'ID_10': 171
    }
    
    // 用户信息映射
    this.userInfo = {
      'ID_1': { name: '张三', age: 65, gender: '男', department: '康复科' },
      'ID_2': { name: '李四', age: 72, gender: '女', department: '内科' },
      'ID_3': { name: '王五', age: 68, gender: '男', department: '外科' },
      'ID_4': { name: '赵六', age: 70, gender: '女', department: '康复科' },
      'ID_5': { name: '陈七', age: 75, gender: '男', department: '内科' },
      'ID_6': { name: '刘八', age: 66, gender: '女', department: '外科' },
      'ID_7': { name: '周九', age: 73, gender: '男', department: '康复科' },
      'ID_8': { name: '吴十', age: 69, gender: '女', department: '内科' },
      'ID_9': { name: '郑十一', age: 71, gender: '男', department: '外科' },
      'ID_10': { name: '孙十二', age: 67, gender: '女', department: '康复科' }
    }
  }

  // 获取随机用户ID
  getRandomUserId() {
    const userIds = Object.keys(this.userImageCounts)
    return userIds[Math.floor(Math.random() * userIds.length)]
  }

  // 获取用户的随机图像索引
  getRandomImageIndex(userId) {
    const maxCount = this.userImageCounts[userId] || 150
    return Math.floor(Math.random() * maxCount) + 1
  }

  // 生成模拟的微多普勒时频图数据
  generateSpectrogramData() {
    const width = 224
    const height = 224
    const data = []
    
    // 生成模拟的时频图模式
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // 创建步态的谐波模式
        const harmonic1 = Math.sin(x * 0.05) * Math.cos(y * 0.02)
        const harmonic2 = Math.sin(x * 0.1) * Math.cos(y * 0.04)
        const harmonic3 = Math.sin(x * 0.15) * Math.cos(y * 0.06)
        
        // 添加噪声
        const noise = (Math.random() - 0.5) * 0.2
        
        // 组合信号
        const signal = (harmonic1 * 0.5 + harmonic2 * 0.3 + harmonic3 * 0.2 + noise)
        
        // 归一化到0-255
        const value = Math.floor((signal + 1) * 127.5)
        data.push(Math.max(0, Math.min(255, value)))
      }
    }
    
    return data
  }

  // 模拟ResNet-18识别过程
  async performIdentification(spectrogramData) {
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 随机选择一个用户作为识别结果
    const userId = this.getRandomUserId()
    const confidence = 0.85 + Math.random() * 0.14 // 85%-99%的置信度
    
    return {
      userId,
      userInfo: this.userInfo[userId],
      confidence,
      processTime: (1 + Math.random()).toFixed(2) + 's',
      features: {
        gaitCycle: (0.8 + Math.random() * 0.4).toFixed(2) + 's',
        stepLength: (60 + Math.random() * 20).toFixed(1) + 'cm',
        cadence: (100 + Math.random() * 20).toFixed(0) + ' steps/min',
        velocity: (0.8 + Math.random() * 0.4).toFixed(2) + ' m/s'
      }
    }
  }

  // 模拟数据采集过程
  async collectGaitData(duration = 5000) {
    const startTime = Date.now()
    const frames = []
    
    while (Date.now() - startTime < duration) {
      // 生成一帧数据
      frames.push({
        timestamp: Date.now() - startTime,
        data: this.generateSpectrogramData()
      })
      
      // 模拟采集频率
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return frames
  }

  // 获取所有用户列表
  getAllUsers() {
    return Object.keys(this.userInfo).map(id => ({
      id,
      ...this.userInfo[id],
      imageCount: this.userImageCounts[id]
    }))
  }
}

export default DatasetManager
