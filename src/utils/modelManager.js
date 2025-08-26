// 全局模型管理器 - 单例模式确保模型只加载一次
import ResNet18Classifier from './resnet18Model'

class ModelManager {
  constructor() {
    this.resnet18Model = null
    this.isPreloading = false
    this.preloadPromise = null
    this.downloadPromise = null // 追踪下载Promise，防止重复下载
  }

  // 获取模型实例（单例）
  getModel() {
    if (!this.resnet18Model) {
      this.resnet18Model = new ResNet18Classifier()
    }
    return this.resnet18Model
  }

  // 预加载模型
  async preloadModel(progressCallback = null) {
    // 如果已经在下载，返回现有的Promise
    if (this.downloadPromise) {
      console.log('⏳ 模型正在载入中，等待现有下载完成...')
      return this.downloadPromise
    }

    // 如果模型已加载，直接返回
    const model = this.getModel()
    if (model.isLoaded) {
      console.log('🎯 模型已在缓存中，无需重新加载')
      if (progressCallback) {
        progressCallback({
          progress: 100,
          status: '模型已准备就绪',
          fromCache: true
        })
      }
      return true
    }

    // 开始预加载
    console.log('🚀 开始预加载ResNet18模型...')
    this.isPreloading = true
    
    // 保存下载Promise，防止重复下载
    this.downloadPromise = model.loadModel(progressCallback)
      .then(result => {
        console.log('✅ 模型预加载成功')
        this.isPreloading = false
        // 保留Promise，因为模型已成功加载
        return result
      })
      .catch(error => {
        console.error('❌ 模型预加载失败:', error)
        this.isPreloading = false
        this.downloadPromise = null // 清除Promise以便重试
        throw error
      })

    return this.downloadPromise
  }

  // 检查模型是否已加载
  isModelLoaded() {
    return this.resnet18Model && this.resnet18Model.isLoaded
  }

  // 检查是否正在预加载
  isPreloadingModel() {
    return this.isPreloading
  }
}

// 创建全局单例实例
const modelManager = new ModelManager()

// 导出全局实例
export default modelManager
