import * as tf from '@tensorflow/tfjs'

class ResNet18Classifier {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.classNames = ['ID_1', 'ID_2', 'ID_3', 'ID_4', 'ID_5', 'ID_6', 'ID_7', 'ID_8', 'ID_9', 'ID_10']
  }

  // 加载ResNet18模型
  async loadModel(modelUrl = '/models/resnet18_identity/model.json') {
    try {
      console.log('正在加载ResNet18身份识别模型...')
      this.model = await tf.loadLayersModel(modelUrl)
      this.isLoaded = true
      console.log('ResNet18模型加载成功')
      return true
    } catch (error) {
      console.error('模型加载失败:', error)
      return false
    }
  }

  // 预处理图像：256x256 → 224x224 (ResNet18标准输入)
  preprocessImage(imageElement) {
    return tf.tidy(() => {
      // 从图像元素创建tensor
      let tensor = tf.browser.fromPixels(imageElement)
      
      // 调整尺寸从256x256到224x224
      tensor = tf.image.resizeBilinear(tensor, [224, 224])
      
      // 归一化到[0,1]
      tensor = tensor.div(255.0)
      
      // 标准化 (ImageNet标准)
      const mean = tf.tensor([0.485, 0.456, 0.406])
      const std = tf.tensor([0.229, 0.224, 0.225])
      tensor = tensor.sub(mean).div(std)
      
      // 添加batch维度 [224, 224, 3] → [1, 224, 224, 3]
      tensor = tensor.expandDims(0)
      
      return tensor
    })
  }

  // 单张图像识别 - 返回最高概率的类别ID
  async predictSingle(imageElement) {
    if (!this.isLoaded || !this.model) {
      throw new Error('模型未加载')
    }

    try {
      // 预处理图像
      const inputTensor = this.preprocessImage(imageElement)
      
      // 模型预测
      const predictions = await this.model.predict(inputTensor).data()
      
      // 清理内存
      inputTensor.dispose()
      
      // 找到最高概率的类别索引
      const maxIndex = predictions.indexOf(Math.max(...predictions))
      const confidence = predictions[maxIndex]
      const predictedClass = this.classNames[maxIndex]
      
      return {
        classId: predictedClass,
        confidence: confidence,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('图像识别失败:', error)
      throw error
    }
  }

  // 三张图像验证 - 严格一致性检查
  async verifyIdentity(imageElements) {
    if (imageElements.length !== 3) {
      throw new Error('必须提供3张图像')
    }

    try {
      console.log('开始三张图像身份验证...')
      
      // 并行处理3张图像
      const predictions = await Promise.all([
        this.predictSingle(imageElements[0]),
        this.predictSingle(imageElements[1]),
        this.predictSingle(imageElements[2])
      ])

      console.log('识别结果:', predictions.map(p => `${p.classId}(${(p.confidence*100).toFixed(1)}%)`))

      // 严格一致性检查
      const classIds = predictions.map(p => p.classId)
      const isConsistent = classIds[0] === classIds[1] && classIds[1] === classIds[2]
      
      // 计算平均置信度
      const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / 3

      return {
        success: isConsistent,
        identifiedId: isConsistent ? classIds[0] : null,
        confidence: avgConfidence,
        individualResults: predictions,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('身份验证过程出错:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // 检查时间权限
  checkTimePermission(personType, currentTime = new Date()) {
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    const timeInMinutes = hour * 60 + minute

    if (personType === 'staff') {
      // 职工：24小时随时进出
      return {
        allowed: true,
        reason: '职工可24小时进出'
      }
    } else if (personType === 'resident') {
      // 住户：06:30-20:30 (390分钟到1230分钟)
      const startTime = 6 * 60 + 30  // 06:30 = 390分钟
      const endTime = 20 * 60 + 30   // 20:30 = 1230分钟
      
      if (timeInMinutes >= startTime && timeInMinutes <= endTime) {
        return {
          allowed: true,
          reason: '在允许时间内'
        }
      } else {
        return {
          allowed: false,
          reason: '住户仅可在06:30-20:30期间进出'
        }
      }
    }

    return {
      allowed: false,
      reason: '未知人员类型'
    }
  }

  // 释放模型资源
  dispose() {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.isLoaded = false
    }
  }
}

export default ResNet18Classifier
