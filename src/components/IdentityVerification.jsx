import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ResNet18Classifier from '../utils/resnet18Model'

const IdentityVerification = ({ onVerificationComplete, personnelData = [] }) => {
  const [classifier] = useState(() => new ResNet18Classifier())
  const [modelLoaded, setModelLoaded] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const fileInputRef = useRef(null)

  // 初始化加载模型
  useEffect(() => {
    const initModel = async () => {
      try {
        setLoadingProgress(30)
        const success = await classifier.loadModel()
        setLoadingProgress(100)
        setModelLoaded(success)
        if (!success) {
          console.warn('模型加载失败，将使用模拟模式')
        }
      } catch (error) {
        console.error('模型初始化失败:', error)
        setModelLoaded(false)
      }
    }
    initModel()
  }, [classifier])

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
          timestamp: new Date().toISOString()
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
            confidence: result.confidence,
            timePermission: timePermission,
            timestamp: result.timestamp
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
        <h3 className="text-xl font-bold text-gray-800 mb-2">AI身份验证</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${modelLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="text-sm text-gray-600">
            {modelLoaded ? 'ResNet18模型已就绪' : '模型加载中...'}
          </span>
          {!modelLoaded && (
            <div className="w-20 bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                   style={{ width: `${loadingProgress}%` }}></div>
            </div>
          )}
        </div>
      </div>

      {/* 文件选择区域 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择3张身份图像 (JPG/PNG)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">请选择恰好3张图像，系统将验证一致性</p>
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
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
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
