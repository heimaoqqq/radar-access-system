// 全局模型管理器 - 单例模式确保模型只加载一次
import ResNet18Classifier from './resnet18Model'

class ModelManager {
  constructor() {
    this.resnet18Model = null
    this.isPreloading = false
    this.preloadPromise = null
    this.downloadPromise = null // 追踪下载Promise，防止重复下载
    
    // 全局进度状态管理
    this.globalProgress = {
      progress: 0,
      status: '初始化...',
      downloadedMB: '0',
      totalMB: '45.2',
      isLoading: false,
      fromCache: false
    }
    this.progressCallbacks = new Set() // 存储所有进度回调
  }

  // 获取模型实例（单例）
  getModel() {
    if (!this.resnet18Model) {
      this.resnet18Model = new ResNet18Classifier()
    }
    return this.resnet18Model
  }

  // 添加进度回调监听器
  addProgressCallback(callback) {
    this.progressCallbacks.add(callback)
    // 立即发送当前状态
    callback(this.globalProgress)
  }

  // 移除进度回调监听器
  removeProgressCallback(callback) {
    this.progressCallbacks.delete(callback)
  }

  // 更新全局进度并通知所有监听器
  updateGlobalProgress(progressInfo) {
    this.globalProgress = { ...this.globalProgress, ...progressInfo }
    // 通知所有监听器
    this.progressCallbacks.forEach(callback => {
      try {
        callback(this.globalProgress)
      } catch (error) {
        console.error('进度回调错误:', error)
      }
    })
  }

  // 预加载模型
  async preloadModel(progressCallback = null) {
    // 添加进度监听器
    if (progressCallback) {
      this.addProgressCallback(progressCallback)
    }

    // 如枟已经在下载，返回现有的Promise
    if (this.downloadPromise) {
      console.log('⏳ 模型正在载入中，等待现有下载完成...')
      return this.downloadPromise
    }

    // 如果模型已加载，直接返回
    const model = this.getModel()
    if (model.isLoaded) {
      console.log('🎯 模型已在缓存中，无需重新加载')
      this.updateGlobalProgress({
        progress: 100,
        status: '模型已准备就绪',
        fromCache: true,
        isLoading: false
      })
      return true
    }

    // 开始预加载
    console.log('🚀 开始预加载ResNet18模型...')
    this.isPreloading = true
    this.updateGlobalProgress({
      isLoading: true,
      progress: 0,
      status: '连接服务器...',
      fromCache: false
    })
    
    // 创建统一的进度回调
    const unifiedProgressCallback = (info) => {
      this.updateGlobalProgress(info)
    }
    
    // 保存下载Promise，防止重复下载
    this.downloadPromise = model.loadModel(unifiedProgressCallback)
      .then(result => {
        console.log('✅ 模型预加载成功')
        this.isPreloading = false
        this.updateGlobalProgress({
          progress: 100,
          status: '模型加载成功!',
          isLoading: false
        })
        return result
      })
      .catch(error => {
        console.error('❌ 模型预加载失败:', error)
        this.isPreloading = false
        this.downloadPromise = null // 清除Promise以便重试
        this.updateGlobalProgress({
          progress: 0,
          status: '加载失败: ' + error.message,
          isLoading: false
        })
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

  // 获取当前全局进度
  getGlobalProgress() {
    return this.globalProgress
  }
}

// 创建全局单例实例
const modelManager = new ModelManager()

// 导出全局实例
export default modelManager
