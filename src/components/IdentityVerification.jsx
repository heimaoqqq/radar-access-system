import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import modelManager from '../utils/modelManager'

const IdentityVerification = ({ onVerificationComplete, personnelData = [] }) => {
  const classifier = modelManager.getModel() // 使用全局单例模型
  const [modelLoaded, setModelLoaded] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('初始化...')
  const [downloadInfo, setDownloadInfo] = useState(null) // 存储下载详细信息
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const fileInputRef = useRef(null)

  // 检查模型加载状态
  useEffect(() => {
    const checkModel = async () => {
      // 检查模型是否已加载
      if (modelManager.isModelLoaded()) {
        setLoadingStatus('模型已准备就绪!')
        setLoadingProgress(100)
        setModelLoaded(true)
        console.log('✨ 使用预加载的模型')
      } else {
        try {
          setIsLoading(true)
          setLoadingStatus('连接模型服务器...')
          setLoadingProgress(5)
          
          // 进度回调函数
          const progressCallback = (info) => {
            if (info.fromCache) {
              setLoadingStatus('模型已准备就绪!')
              setLoadingProgress(100)
            } else {
              setDownloadInfo(info)
              // 直接使用实际进度
              const actualProgress = Math.min(99, info.progress || 0)
              setLoadingProgress(actualProgress)
              
              // 根据进度显示不同状态
              if (actualProgress < 10) {
                setLoadingStatus('正在连接服务器...')
              } else if (actualProgress < 90) {
                setLoadingStatus(`模型载入中: ${actualProgress.toFixed(0)}%`)
              } else {
                setLoadingStatus('正在初始化模型...')
              }
            }
          }
          
          // 使用modelManager来避免重复下载
          const success = await modelManager.preloadModel(progressCallback)
          
          if (success) {
            setLoadingStatus('模型加载成功!')
            setLoadingProgress(100)
          } else {
            setLoadingStatus('模型加载失败，使用模拟模式')
            setLoadingProgress(0)
          }
          
          setModelLoaded(success)
          if (!success) {
            console.warn('模型加载失败，将使用模拟模式')
          }
        } catch (error) {
          console.error('模型初始化失败:', error)
          setLoadingStatus('加载失败: ' + error.message)
          setLoadingProgress(0)
          setModelLoaded(false)
        } finally {
          setIsLoading(false)
        }
      }
    }
    checkModel()
  }, [])

  // 从数据集自动选择图像
  const autoSelectImages = async () => {
    setIsLoadingImages(true)
    setSelectedImages([])
    setVerificationResult(null)
    
    try {
      // 定义可用的ID列表
      const availableIds = ['ID_1', 'ID_2', 'ID_3', 'ID_4', 'ID_5', 'ID_6', 'ID_7', 'ID_8', 'ID_9', 'ID_10']
      
      // 随机选择一个主ID
      const primaryId = availableIds[Math.floor(Math.random() * availableIds.length)]
      console.log(`🎯 选中主ID: ${primaryId}`)
      
      // 获取该ID的所有图像
      const response = await fetch('/radar-access-system/dataset_index.json')
      let datasetIndex = {}
      
      if (response.ok) {
        datasetIndex = await response.json()
      } else {
        // 如果没有索引文件，手动构建
        const imagePatterns = {
          'ID_1': Array.from({length: 150}, (_, i) => `ID1_case1_1_Doppler${i+1}.jpg`),
          'ID_2': Array.from({length: 150}, (_, i) => `ID2_case1_1_Doppler${i+1}.jpg`),
          'ID_3': Array.from({length: 150}, (_, i) => `ID3_case1_1_Doppler${i+1}.jpg`),
          'ID_4': Array.from({length: 150}, (_, i) => `ID4_case1_1_Doppler${i+1}.jpg`),
          'ID_5': Array.from({length: 150}, (_, i) => `ID5_case1_1_Doppler${i+1}.jpg`),
          'ID_6': Array.from({length: 150}, (_, i) => `ID6_case1_1_Doppler${i+1}.jpg`),
          'ID_7': Array.from({length: 150}, (_, i) => `ID7_case1_1_Doppler${i+1}.jpg`),
          'ID_8': Array.from({length: 150}, (_, i) => `ID8_case1_1_Doppler${i+1}.jpg`),
          'ID_9': Array.from({length: 150}, (_, i) => `ID9_case1_1_Doppler${i+1}.jpg`),
          'ID_10': Array.from({length: 150}, (_, i) => `ID10_case1_1_Doppler${i+1}.jpg`)
        }
        datasetIndex = imagePatterns
      }
      
      const primaryImages = datasetIndex[primaryId] || []
      if (primaryImages.length < 2) {
        throw new Error(`${primaryId} 没有足够的图像`)
      }
      
      // 随机选择2张图像（不重复）
      const selectedIndices = new Set()
      while (selectedIndices.size < 2) {
        selectedIndices.add(Math.floor(Math.random() * primaryImages.length))
      }
      
      const selectedImagePaths = []
      const indices = Array.from(selectedIndices)
      selectedImagePaths.push(`/radar-access-system/dataset/${primaryId}/${primaryImages[indices[0]]}`)
      selectedImagePaths.push(`/radar-access-system/dataset/${primaryId}/${primaryImages[indices[1]]}`)
      
      // 第3张图像：50%概率同ID，50%概率不同ID
      const useSameId = Math.random() < 0.5
      
      if (useSameId) {
        // 从同一ID选择第3张（确保不重复）
        let thirdIndex
        do {
          thirdIndex = Math.floor(Math.random() * primaryImages.length)
        } while (selectedIndices.has(thirdIndex))
        
        selectedImagePaths.push(`/radar-access-system/dataset/${primaryId}/${primaryImages[thirdIndex]}`)
        console.log(`✅ 第3张图像来自同一ID: ${primaryId}`)
      } else {
        // 从不同ID选择第3张
        const otherIds = availableIds.filter(id => id !== primaryId)
        const otherId = otherIds[Math.floor(Math.random() * otherIds.length)]
        const otherImages = datasetIndex[otherId] || []
        
        if (otherImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * otherImages.length)
          selectedImagePaths.push(`/radar-access-system/dataset/${otherId}/${otherImages[randomIndex]}`)
          console.log(`❌ 第3张图像来自不同ID: ${otherId}`)
        } else {
          // 如果其他ID没有图像，还是用同一ID
          let thirdIndex
          do {
            thirdIndex = Math.floor(Math.random() * primaryImages.length)
          } while (selectedIndices.has(thirdIndex))
          selectedImagePaths.push(`/radar-access-system/dataset/${primaryId}/${primaryImages[thirdIndex]}`)
          console.log(`⚠️ 备选方案：第3张图像仍来自: ${primaryId}`)
        }
      }
      
      // 加载所有选中的图像
      console.log('📷 选中的图像路径:', selectedImagePaths)
      
      const imagePromises = selectedImagePaths.map((path, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            console.log(`✅ 图像${index + 1}加载成功: ${path}`)
            resolve({
              file: { name: path.split('/').pop() },
              imageElement: img,
              url: path
            })
          }
          img.onerror = () => {
            console.error(`❌ 图像${index + 1}加载失败: ${path}`)
            reject(new Error(`无法加载图像: ${path}`))
          }
          img.src = path
        })
      })
      
      const loadedImages = await Promise.all(imagePromises)
      setSelectedImages(loadedImages)
      console.log('🎉 所有图像加载完成')
      
    } catch (error) {
      console.error('自动选择图像失败:', error)
      alert('自动选择图像失败: ' + error.message)
    } finally {
      setIsLoadingImages(false)
    }
  }

  // 处理文件选择
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    if (files.length !== 3) {
      alert('请选择恰好3张图像文件')
      return
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      alert('请选择JPG或PNG格式的图像文件')
      return
    }

    // 读取文件为Image对象
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        const img = new Image()
        
        reader.onload = (e) => {
          img.onload = () => resolve({ file, imageElement: img, url: e.target.result })
          img.onerror = reject
          img.src = e.target.result
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises)
      .then(images => {
        setSelectedImages(images)
        setVerificationResult(null)
      })
      .catch(error => {
        console.error('图像加载失败:', error)
        alert('图像加载失败，请重试')
      })
  }

  // 开始身份验证
  const startVerification = async () => {
    if (selectedImages.length !== 3) {
      alert('请先选择3张图像')
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const imageElements = selectedImages.map(img => img.imageElement)
      let result

      if (modelLoaded) {
        // 使用真实模型
        result = await classifier.verifyIdentity(imageElements)
      } else {
        // 模拟模式（用于测试）
        await new Promise(resolve => setTimeout(resolve, 2000))
        const mockId = 'ID_' + Math.ceil(Math.random() * 10)
        result = {
          success: Math.random() > 0.3, // 70%成功率
          identifiedId: mockId,
          confidence: 0.85 + Math.random() * 0.1,
          timestamp: new Date().toISOString(),
          predictions: selectedImages.map((img, idx) => ({
            imageIndex: idx,
            predictedId: mockId,
            confidence: 0.8 + Math.random() * 0.2
          }))
        }
      }

      if (result.success) {
        // 查找对应人员信息
        const person = personnelData.find(p => p.id === result.identifiedId)
        
        if (person) {
          // 检查时间权限
          const timePermission = classifier.checkTimePermission(person.type)
          
          const finalResult = {
            success: true,
            identifiedId: result.identifiedId,
            person: person,
            confidence: result.confidence || 0.95,
            timePermission: timePermission,
            timestamp: result.timestamp || new Date().toISOString(),
            predictions: result.predictions || []
          }
          
          setVerificationResult(finalResult)
          onVerificationComplete?.(finalResult)
        } else {
          // 识别成功但找不到人员信息
          const errorResult = {
            success: false,
            error: `识别到${result.identifiedId}但系统中无此人员信息`,
            timestamp: result.timestamp
          }
          setVerificationResult(errorResult)
          onVerificationComplete?.(errorResult)
        }
      } else {
        // 验证失败
        const failResult = {
          success: false,
          error: result.error || '验证失败，三张图像识别结果不一致',
          timestamp: result.timestamp
        }
        setVerificationResult(failResult)
        onVerificationComplete?.(failResult)
      }
    } catch (error) {
      console.error('验证过程出错:', error)
      const errorResult = {
        success: false,
        error: '验证过程出错: ' + error.message,
        timestamp: new Date().toISOString()
      }
      setVerificationResult(errorResult)
      onVerificationComplete?.(errorResult)
    } finally {
      setIsVerifying(false)
    }
  }

  // 重置验证
  const resetVerification = () => {
    setSelectedImages([])
    setVerificationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">AI身份验证</h3>
        
        {/* 模型加载状态 */}
        <AnimatePresence mode="wait">
          {!modelLoaded ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* 状态指示器 */}
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-3 h-3 rounded-full ${
                    isLoading ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-yellow-500'
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {loadingStatus}
                </span>
              </div>
              
              {/* 进度条容器 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {/* 进度条 */}
                  <div className="relative">
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{
                          background: `linear-gradient(90deg, #3B82F6 0%, #2563EB ${loadingProgress}%, #1D4ED8 100%)`,
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.5)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {/* 动画光效 */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                          style={{ opacity: 0.4 }}
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        {/* 波纹效果 */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            width: '30%'
                          }}
                          animate={{ x: ['-30%', '130%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        />
                      </motion.div>
                    </div>
                    
                    {/* 进度百分比 */}
                    <motion.div
                      className="absolute -right-1 -top-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded-md shadow-lg"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: loadingProgress > 0 ? 1 : 0,
                        scale: loadingProgress > 0 ? 1 : 0
                      }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {loadingProgress.toFixed(0)}%
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-blue-700 rotate-45" />
                    </motion.div>
                  </div>
                  
                  {/* 下载信息 */}
                  {downloadInfo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between items-center mt-3 text-xs text-gray-600"
                    >
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span>{downloadInfo.downloadedMB} MB / {downloadInfo.totalMB} MB</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>下载中...</span>
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3"
            >
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
              <span className="text-sm font-medium text-green-800">
                ResNet18模型已就绪
              </span>
              <span className="text-xs text-green-600 ml-auto">
                准备进行身份验证
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 图像选择区域 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            身份验证图像
          </label>
          <div className="flex space-x-2">
            {/* 自动选择按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={autoSelectImages}
              disabled={isLoadingImages || !modelLoaded}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isLoadingImages || !modelLoaded
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md'}
              `}
            >
              {isLoadingImages ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  加载中...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  自动选择
                </span>
              )}
            </motion.button>
            
            {/* 手动选择按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={!modelLoaded}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${!modelLoaded
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
              `}
            >
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                手动上传
              </span>
            </motion.button>
          </div>
        </div>
        
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500">
          自动选择：智能抽取数据集图像 | 手动上传：选择3张JPG/PNG图像
        </p>
      </div>

      {/* 图像预览 */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="grid grid-cols-3 gap-4">
              {selectedImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.url}
                    alt={`验证图像 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    style={{ width: '256px', height: '256px' }}
                  />
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 操作按钮 */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={startVerification}
          disabled={selectedImages.length !== 3 || isVerifying || !modelLoaded}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              验证中...
            </div>
          ) : (
            '开始验证'
          )}
        </button>
        <button
          onClick={resetVerification}
          disabled={isVerifying}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
      </div>

      {/* 验证结果 */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-lg border-l-4 ${
              verificationResult.success 
                ? verificationResult.timePermission?.allowed 
                  ? 'bg-green-50 border-green-400' 
                  : 'bg-yellow-50 border-yellow-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            {verificationResult.success ? (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-green-800">身份验证成功</h4>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>识别ID:</strong> {verificationResult.identifiedId}</p>
                  <p><strong>姓名:</strong> {verificationResult.person?.name}</p>
                  <p><strong>类型:</strong> {verificationResult.person?.type === 'staff' ? '职工' : '住户'}</p>
                  <p><strong>置信度:</strong> {(verificationResult.confidence * 100).toFixed(1)}%</p>
                  
                  {/* 显示每张图片的识别结果 */}
                  <div className="mt-3 border-t pt-3">
                    <p className="font-medium text-gray-700 mb-2">图像识别详情:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedImages.map((img, index) => {
                        const prediction = verificationResult.predictions?.[index]
                        return (
                          <div key={index} className="text-center">
                            <div className="relative mb-2">
                              <img
                                src={img.url}
                                alt={`图像 ${index + 1}`}
                                className="w-20 h-20 object-cover rounded border-2 border-gray-300 mx-auto"
                              />
                              <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-1 rounded-tl">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-800">
                              {prediction?.predictedId || verificationResult.identifiedId}
                            </p>
                            <p className="text-xs text-gray-600">
                              {img.name ? img.name.split('/').pop() : `图像${index + 1}`}
                            </p>
                            {prediction?.confidence && (
                              <p className="text-xs text-gray-500">
                                置信度: {(prediction.confidence * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {verificationResult.timePermission?.allowed ? (
                    <div className="bg-green-100 p-2 rounded mt-2">
                      <p className="text-green-800 font-medium">✅ 允许通行</p>
                      <p className="text-green-700 text-xs">{verificationResult.timePermission.reason}</p>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 p-2 rounded mt-2">
                      <p className="text-yellow-800 font-medium">⚠️ 禁止通行</p>
                      <p className="text-yellow-700 text-xs">{verificationResult.timePermission?.reason}</p>
                      <p className="text-yellow-700 text-xs">如有紧急情况请联系工作人员</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-red-800">验证失败</h4>
                </div>
                <p className="text-sm text-red-700">{verificationResult.error}</p>
                <p className="text-xs text-red-600 mt-1">请重新选择图像重试</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default IdentityVerification
