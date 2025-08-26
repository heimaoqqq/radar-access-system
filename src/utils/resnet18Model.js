// 切换到ONNX.js以避免TensorFlow转换问题
import * as ort from 'onnxruntime-web';

class ResNet18Classifier {
  constructor() {
    this.session = null
    this.isLoaded = false
    this.classNames = ['ID_1', 'ID_2', 'ID_3', 'ID_4', 'ID_5', 'ID_6', 'ID_7', 'ID_8', 'ID_9', 'ID_10']
  }

  // 加载ResNet18 ONNX模型 - 使用外部CDN避免GitHub大文件限制
  async loadModel(modelUrl = 'https://huggingface.co/heimaoqqq/resnet18-gait-recognition/resolve/main/resnet18_identity.onnx') {
    try {
      console.log('正在加载ResNet18 ONNX身份识别模型...')
      this.session = await ort.InferenceSession.create(modelUrl)
      this.isLoaded = true
      console.log('ResNet18 ONNX模型加载成功')
      console.log('模型输入:', this.session.inputNames)
      console.log('模型输出:', this.session.outputNames)
      return true
    } catch (error) {
      console.error('ONNX模型加载失败:', error)
      return false
    }
  }

  // 预处理图像：转换为ONNX格式输入 [1, 3, 224, 224]
  preprocessImage(imageElement) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 224
    canvas.height = 224
    
    // 调整图像大小到224x224
    ctx.drawImage(imageElement, 0, 0, 224, 224)
    
    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, 224, 224)
    const data = imageData.data
    
    // 转换为ONNX格式: [1, 3, 224, 224] (NCHW)
    const input = new Float32Array(1 * 3 * 224 * 224)
    
    // ImageNet归一化参数
    const mean = [0.485, 0.456, 0.406]
    const std = [0.229, 0.224, 0.225]
    
    for (let i = 0; i < 224 * 224; i++) {
      const pixelIndex = i * 4
      
      // RGB像素值归一化到[0,1]，然后标准化
      input[i] = (data[pixelIndex] / 255.0 - mean[0]) / std[0]         // R
      input[224 * 224 + i] = (data[pixelIndex + 1] / 255.0 - mean[1]) / std[1]  // G
      input[224 * 224 * 2 + i] = (data[pixelIndex + 2] / 255.0 - mean[2]) / std[2]  // B
    }
    
    return input
  }

  // 单张图像识别 - 返回最高概率的类别ID
  async predictSingle(imageElement) {
    if (!this.isLoaded || !this.session) {
      throw new Error('ONNX模型未加载')
    }

    try {
      // 预处理图像
      const inputData = this.preprocessImage(imageElement)
      
      // 创建ONNX输入tensor
      const inputTensor = new ort.Tensor('float32', inputData, [1, 3, 224, 224])
      const feeds = { input: inputTensor }
      
      // 模型推理
      const results = await this.session.run(feeds)
      const outputTensor = results.output
      const predictions = outputTensor.data
      
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
      console.error('ONNX图像识别失败:', error)
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
    if (this.session) {
      this.session.release()
      this.session = null
      this.isLoaded = false
    }
  }
}

export default ResNet18Classifier
