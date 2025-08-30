import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar } from 'lucide-react'
import modelManager from '../utils/modelManager'

const IdentityVerification = ({ onVerificationComplete, personnelData = [], autoMode = false, demoMode = false, demoStep = 0, onDemoStepChange, demoScenarios = [] }) => {
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
  const [collectionProgress, setCollectionProgress] = useState(0)
  const [isCollecting, setIsCollecting] = useState(false)
  
  // 新增：检测阶段状态
  const [detectionPhase, setDetectionPhase] = useState(null) // null, 'detecting', 'collecting', 'analyzing', 'identifying'
  const [detectionProgress, setDetectionProgress] = useState(0)
  const [detectionMessage, setDetectionMessage] = useState('')

  // 检查模型加载状态
  useEffect(() => {
    // 使用全局进度管理系统
    const progressCallback = (globalProgress) => {
      setDownloadInfo(globalProgress)
      setLoadingProgress(globalProgress.progress || 0)
      setLoadingStatus(globalProgress.status || '初始化...')
      setIsLoading(globalProgress.isLoading || false)
      
      if (globalProgress.progress >= 100 || globalProgress.fromCache) {
        setModelLoaded(true)
      }
    }
    
    // 添加进度监听器
    modelManager.addProgressCallback(progressCallback)
    
    // 检查当前状态
    const currentProgress = modelManager.getGlobalProgress()
    progressCallback(currentProgress)
    
    // 如果模型还没开始加载，就启动加载
    if (!modelManager.isModelLoaded() && !modelManager.isPreloadingModel()) {
      console.log('🚀 IdentityVerification: 启动模型加载')
      modelManager.preloadModel().catch(error => {
        console.error('IdentityVerification 模型加载失败:', error)
      })
    }
    
    // 清理函数
    return () => {
      modelManager.removeProgressCallback(progressCallback)
    }
  }, [])

  // 移除自动模式相关逻辑

  // 创建演示结果
  const createDemoResult = (scenario) => {
    const { expectedResult } = scenario
    
    // 获取用户数据库
    const getUserDatabase = () => {
      const saved = localStorage.getItem('personnelData')
      let managementUsers = []
      
      if (saved) {
        managementUsers = JSON.parse(saved)
      } else {
        managementUsers = [
          { id: 'ID_1', name: '张三', age: 78, gender: '男', room: '101', type: 'resident' },
          { id: 'ID_2', name: '李四', age: 82, gender: '女', room: '102', type: 'resident' },
          { id: 'ID_3', name: '王五', age: 75, gender: '男', room: '103', type: 'resident' },
          { id: 'STAFF_1', name: '李护士', age: 35, gender: '女', room: '护士站', type: 'staff' }
        ]
      }
      
      const userDatabase = {}
      managementUsers.forEach(user => {
        userDatabase[user.id] = {
          name: user.name,
          age: user.age,
          gender: user.gender,
          room: user.type === 'staff' ? user.room : `${user.room}室`,
          type: user.type || 'resident'
        }
      })
      
      return userDatabase
    }
    
    // 创建识别详情
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // 根据场景设置不同的时间
    let displayHour, displayMinute, displaySecond
    if (scenario.expectedResult.forceRestrictedTime) {
      // 强制夜间时间显示
      displayHour = '02'
      displayMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
      displaySecond = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    } else if (scenario.id === 'recognition_fail' || scenario.id === 'resident_restricted') {
      displayHour = '02'
      displayMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
      displaySecond = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    } else {
      displayHour = String(now.getHours()).padStart(2, '0')
      displayMinute = String(now.getMinutes()).padStart(2, '0')
      displaySecond = String(now.getSeconds()).padStart(2, '0')
    }
    
    const baseUrl = import.meta.env.BASE_URL || '/'
    const recognitionDetails = scenario.images.map((fileName, index) => ({
      url: `${baseUrl}demo_images/${fileName}`,
      fileName: `${year}_${month}${day}_${displayHour}${displayMinute}${String(Number(displaySecond) + index).padStart(2, '0')}_${String(index + 1).padStart(3, '0')}.jpg`,
      confidence: expectedResult.confidence + (Math.random() - 0.5) * 0.01,
      userId: expectedResult.userId,
      features: `特征点${index + 1}`,
      matchScore: expectedResult.confidence * 0.95 + Math.random() * 0.05
    }))
    
    if (expectedResult.success) {
      const userDatabase = getUserDatabase()
      const userData = userDatabase[expectedResult.userId]
      // 检查时间权限
      let accessGranted = true
      let message = '验证通过，允许进入'
      
      if (expectedResult.userType === 'resident') {
        const now = new Date()
        const hour = now.getHours()
        const isNightTime = hour >= 22 || hour < 6
        
        if (scenario.expectedResult.forceRestrictedTime || isNightTime) {
          // 检查是否强制夜间时间或实际夜间时间
          if (isNightTime || scenario.expectedResult.forceRestrictedTime) {
            accessGranted = false
            message = '夜间时段（22:00-06:00），住户通行受限'
          }
        }
      }
      
      return {
        success: true,
        accessGranted,
        person: userData || (() => {
          // 根据userId和userType返回正确的默认信息
          if (expectedResult.userId === 'ID_1' && expectedResult.userType === 'staff') {
            return { id: 'ID_1', name: '李护士', age: 28, gender: '女', room: '护士站', type: 'staff' }
          } else if (expectedResult.userId === 'ID_2') {
            return { id: 'ID_2', name: '李四', age: 82, gender: '女', room: '102室', type: 'resident' }
          } else if (expectedResult.userId === 'ID_3') {
            return { id: 'ID_3', name: '王五', age: 75, gender: '男', room: '103室', type: 'resident' }
          } else {
            return { 
              id: expectedResult.userId, 
              name: expectedResult.userType === 'staff' ? '李护士' : '张三', 
              type: expectedResult.userType, 
              room: expectedResult.userType === 'resident' ? '201室' : '护士站' 
            }
          }
        })(),
        confidence: expectedResult.confidence,
        recognitionDetails: recognitionDetails,
        identifiedId: expectedResult.userId,
        message,
        timestamp: new Date().toISOString(),
        timePermission: {
          allowed: accessGranted,
          message: accessGranted ? '允许进入' : message
        },
        // 添加演示模式所需的图像信息
        selectedImages: recognitionDetails.map(detail => ({
          url: detail.url,
          fileName: detail.fileName,
          imageElement: null // 演示模式不需要实际的imageElement
        }))
      }
    } else {
      return {
        success: false,
        accessGranted: false,
        person: null,
        confidence: expectedResult.confidence,
        recognitionDetails: recognitionDetails,
        identifiedId: 'STRANGER',
        message: '验证失败，步态信息不匹配！',
        timestamp: new Date().toISOString(),
        timePermission: {
          allowed: false,
          message: '陌生人访问被拒绝'
        }
      }
    }
  }

  // 新增：开始检测流程（支持演示模式）
  const startDetection = async () => {
    setVerificationResult(null)
    setSelectedImages([])
    
    if (demoMode && demoScenarios.length > 0) {
      // 演示模式
      const scenario = demoScenarios[demoStep % demoScenarios.length]
      console.log(`演示模式第${demoStep + 1}次点击`)
      
      // 阶段1：检测行人
      setDetectionPhase('detecting')
      setDetectionMessage('雷达检测中...')
      setDetectionProgress(0)
      
      const detectingDuration = 1000 + Math.random() * 500
      await animateProgress(detectingDuration, (progress) => setDetectionProgress(progress))
      
      // 阶段2：采集数据
      setDetectionPhase('collecting')
      setDetectionMessage('已采集步态图像')
      setDetectionProgress(0)
      
      const collectingDuration = 2000
      await animateProgress(collectingDuration, (progress) => setDetectionProgress(progress))
      
      // 阶段3：步态分析
      setDetectionPhase('analyzing')
      setDetectionMessage('步态特征分析中...')
      setDetectionProgress(0)
      
      const analyzingDuration = 2000
      await animateProgress(analyzingDuration, (progress) => setDetectionProgress(progress))
      
      // 阶段4：识别身份
      setDetectionPhase('identifying')
      setDetectionMessage('正在识别身份...')
      
      // 创建演示结果
      const result = createDemoResult(scenario)
      console.log('演示结果创建完成:', result)
      
      // 设置演示模式的图像用于显示
      const baseUrl = import.meta.env.BASE_URL || '/'
      const demoImages = scenario.images.map((fileName, index) => ({
        url: `${baseUrl}demo_images/${fileName}`,
        fileName: `${result.recognitionDetails[index].fileName}`,
        imageElement: null, // 演示模式不需要实际的imageElement
        name: `${result.recognitionDetails[index].fileName}`
      }))
      
      setSelectedImages(demoImages)
      setVerificationResult(result)
      onVerificationComplete?.(result)
      
      // 更新演示步骤
      if (onDemoStepChange) {
        onDemoStepChange(prev => {
          const nextStep = prev + 1
          console.log(`下次将使用步骤 ${nextStep}`)
          return nextStep
        })
      }
      
      setDetectionPhase(null)
    } else {
      // 正常模式
      // 阶段1：检测行人 (1-2.5秒)
      setDetectionPhase('detecting')
      setDetectionMessage('未检测到行人，请稍等...')
      setDetectionProgress(0)
      
      const detectingDuration = 1000 + Math.random() * 1500 // 1-2.5秒
      await animateProgress(detectingDuration, (progress) => setDetectionProgress(progress))
      
      // 阶段2：采集数据 (3-4.5秒)
      setDetectionPhase('collecting')
      setDetectionMessage('正在采集数据...')
      setDetectionProgress(0)
      
      const collectingDuration = 3000 + Math.random() * 1500 // 3-4.5秒
      await animateProgress(collectingDuration, (progress) => setDetectionProgress(progress))
      
      // 阶段3：步态分析 (3-5秒)
      setDetectionPhase('analyzing')
      setDetectionMessage('正在进行步态分析...')
      setDetectionProgress(0)
      
      const analyzingDuration = 3000 + Math.random() * 2000 // 3-5秒
      await animateProgress(analyzingDuration, (progress) => setDetectionProgress(progress))
      
      // 阶段4：识别身份
      setDetectionPhase('identifying')
      setDetectionMessage('正在识别身份...')
      
      // 选择随机图像并进行验证
      const images = await selectRandomImagesForVerification()
      if (images && images.length > 0) {
        await startVerificationWithImages(images)
      }
      
      setDetectionPhase(null)
    }
  }
  
  // 进度动画辅助函数（非匀速）
  const animateProgress = (duration, onProgress) => {
    return new Promise((resolve) => {
      const interval = 50 // 每50ms更新一次
      const steps = duration / interval
      let currentStep = 0
      
      const timer = setInterval(() => {
        currentStep++
        // 使用缓动函数实现非匀速进度
        const t = currentStep / steps
        // 使用ease-in-out曲线
        const eased = t < 0.5 
          ? 2 * t * t 
          : -1 + (4 - 2 * t) * t
        
        // 添加随机波动使进度更自然
        const randomFactor = 0.95 + Math.random() * 0.1
        const progress = Math.min(eased * 100 * randomFactor, 100)
        
        onProgress(Math.round(progress))
        
        if (currentStep >= steps) {
          onProgress(100) // 确保最后达到100%
          clearInterval(timer)
          resolve()
        }
      }, interval)
    })
  }

  // 使用指定图像进行验证
  const startVerificationWithImages = async (images) => {
    if (!images || images.length === 0) {
      console.log('没有图像，跳过验证')
      return
    }
    
    if (images.length > 5) {
      alert('最多支持5张图像验证')
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const imageElements = images.map(img => img.imageElement)
      let result

      if (modelLoaded) {
        // 使用真实模型
        result = await classifier.verifyIdentity(imageElements)
      } else {
        // 模拟模式（用于测试）
        await new Promise(resolve => setTimeout(resolve, 2000))
        const mockId = 'ID_' + Math.ceil(Math.random() * 4)
        // 为每张图像生成独立的置信度
        const predictions = images.map((img, idx) => ({
          imageIndex: idx,
          predictedId: mockId,
          confidence: (0.8 + Math.random() * 0.15) // 限制在0.8-0.95之间
        }))
        // 计算平均置信度
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
        result = {
          success: Math.random() > 0.3, // 70%成功率
          identifiedId: mockId,
          confidence: avgConfidence, // 使用平均置信度
          timestamp: new Date().toISOString(),
          predictions: predictions
        }
      }

      if (result.success) {
        // 查找对应人员信息
        const person = personnelData.find(p => p.id === result.identifiedId)
        
        if (person) {
          // 检查时间权限
          const timePermission = classifier.checkTimePermission(person.type)
          
          const finalResult = {
            ...result,
            person: person,
            timePermission: timePermission,
            usedImages: images.map(img => {
              if (img.name) return img.name
              if (img.url && typeof img.url === 'string') return img.url.split('/').pop()
              return '未知图片'
            }).filter(Boolean)
          }
          setVerificationResult(finalResult)
          onVerificationComplete?.(finalResult)
        } else {
          // 未找到对应人员
          const unknownResult = {
            ...result,
            success: false,
            error: '未找到对应人员信息'
          }
          setVerificationResult(unknownResult)
          onVerificationComplete?.(unknownResult)
        }
      } else {
        // 验证失败
        // 从selectedImages中提取源图像的ID（基于文件路径）
        const imageIds = images.map(img => {
          if (img.url && img.url.includes('/dataset/')) {
            const match = img.url.match(/\/dataset\/(ID_\d+)\//)
            if (match) return match[1]
          }
          if (img.url && img.url.includes('/')) {
            const pathParts = img.url.split('/')
            if (pathParts.length >= 4) return pathParts[3] // 提取ID部分
          }
          return null
        }).filter(Boolean)
        
        const failResult = {
          success: false,
          error: result.error || '验证失败，步态信息不匹配！',
          timestamp: result.timestamp,
          usedImages: images.map(img => {
            if (img.name) return img.name
            if (img.url && typeof img.url === 'string') return img.url.split('/').pop()
            return '未知图片'
          }).filter(Boolean),
          sourceImageIds: imageIds
        }
        setVerificationResult(failResult)
        onVerificationComplete?.({...failResult, 
          message: '验证失败，步态信息不匹配！',
          predictions: result.predictions
        })
      }
    } catch (error) {
      console.error('验证过程出错:', error)
      const errorResult = {
        success: false,
        error: error.message || '验证过程出错',
        timestamp: new Date().toISOString()
      }
      setVerificationResult(errorResult)
      onVerificationComplete?.(errorResult)
    } finally {
      setIsVerifying(false)
    }
  }

  // 为验证过程选择随机图像
  const selectRandomImagesForVerification = async () => {
    setIsLoadingImages(true)
    setSelectedImages([])
    
    try {
      // 根据人员管理中的数据动态确定可用ID
      const availableIds = personnelData.map(person => person.id).filter(id => id)
      
      if (availableIds.length === 0) {
        throw new Error('系统中没有可用的人员数据')
      }
      
      // 随机选择一个主ID
      const primaryId = availableIds[Math.floor(Math.random() * availableIds.length)]
      console.log(`🎯 选中主ID: ${primaryId}`)
      
      // 获取该ID的所有图像
      const response = await fetch('/radar-access-system/dataset_index.json')
      let datasetIndex = {}
      
      if (response.ok) {
        datasetIndex = await response.json()
      } else {
        // 如果没有索引文件，根据人员数据动态构建
        const imagePatterns = {}
        personnelData.forEach(person => {
          if (person.id) {
            const idNum = person.id.replace('ID_', '')
            imagePatterns[person.id] = Array.from(
              {length: 150}, 
              (_, i) => `ID${idNum}_case1_1_Doppler${i+1}.jpg`
            )
          }
        })
        
        // 如果没有人员数据，使用默认的前4个ID
        if (Object.keys(imagePatterns).length === 0) {
          imagePatterns['ID_1'] = Array.from({length: 150}, (_, i) => `ID1_case1_1_Doppler${i+1}.jpg`)
          imagePatterns['ID_2'] = Array.from({length: 150}, (_, i) => `ID2_case1_1_Doppler${i+1}.jpg`)
          imagePatterns['ID_3'] = Array.from({length: 150}, (_, i) => `ID3_case1_1_Doppler${i+1}.jpg`)
          imagePatterns['ID_4'] = Array.from({length: 150}, (_, i) => `ID4_case1_1_Doppler${i+1}.jpg`)
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
      
      // 第3张图像：70%概率同ID，30%概率不同ID
      const useSameId = Math.random() < 0.7
      
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
      
      const loadImage = (id, filename) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          const url = `/radar-access-system/dataset/${id}/${filename}`
          
          img.onload = () => {
            console.log(`✅ 成功加载: ${filename}`)
            // 提取完整的文件名（去掉扩展名）
            const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")
            resolve({
              url: url,
              imageElement: img,
              name: nameWithoutExt  // 存储完整的文件名（不含扩展名）
            })
          }
          
          img.onerror = () => {
            console.error(`❌ 加载失败: ${filename}`)
            reject(new Error(`Failed to load ${filename}`))
          }
          
          img.src = url
        })
      }
      
      const imagePromises = selectedImagePaths.map((path, index) => {
        const id = path.split('/')[3]
        const filename = path.split('/').pop()
        return loadImage(id, filename)
      })
      
      const loadedImages = await Promise.all(imagePromises)
      setSelectedImages(loadedImages)
      console.log('🎉 所有图像加载完成')
      return loadedImages // 返回加载的图像
      
    } catch (error) {
      console.error('选择图像失败:', error)
      alert('选择图像失败: ' + error.message)
      return null // 返回null表示失败
    } finally {
      setIsLoadingImages(false)
    }
  }

  // 移除手动文件选择
  /*
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) {
      return
    }
    
    if (files.length > 5) {
      alert('最多选择5张图像进行验证')
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
    const imagePromises = files.map((file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        const img = new Image()
        
        reader.onload = (e) => {
          img.onload = () => {
            // 提取文件名（去掉扩展名）
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
            resolve({
              url: e.target.result,
              imageElement: img,
              name: nameWithoutExt  // 存储完整的文件名（不含扩展名）
            })
          }
          img.src = e.target.result
        }
        
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises)
      .then(images => {
        // 追加新图片而不是替换
        setSelectedImages(prevImages => {
          const combined = [...prevImages, ...images]
          // 限制最多5张
          return combined.slice(0, 5)
        })
        setVerificationResult(null)
      })
      .catch(error => {
        console.error('图像加载失败:', error)
        alert('图像加载失败，请重试')
      })
  }
  */

  // 开始身份验证
  const startVerification = async () => {
    // 不需要检查图像，因为startDetection会自动选择图像
    if (selectedImages.length === 0) {
      console.log('没有选择的图像，跳过验证')
      return
    }
    
    if (selectedImages.length > 5) {
      alert('最多支持5张图像验证')
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
        const mockId = 'ID_' + Math.ceil(Math.random() * 4)
        // 为每张图像生成独立的置信度
        const predictions = selectedImages.map((img, idx) => ({
          imageIndex: idx,
          predictedId: mockId,
          confidence: (0.8 + Math.random() * 0.15) // 限制在0.8-0.95之间
        }))
        // 计算平均置信度
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
        result = {
          success: Math.random() > 0.3, // 70%成功率
          identifiedId: mockId,
          confidence: avgConfidence, // 使用平均置信度
          timestamp: new Date().toISOString(),
          predictions: predictions
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
            confidence: result.predictions && result.predictions.length > 0
              ? Math.min(1, result.predictions.reduce((sum, p) => sum + Math.min(1, p.confidence), 0) / result.predictions.length)
              : Math.min(1, result.confidence || 0.95),
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
            timestamp: result.timestamp,
            usedImages: selectedImages.map(img => {
              if (img.name) return img.name
              if (img.url && typeof img.url === 'string') return img.url.split('/').pop()
              return '未知图片'
            }).filter(Boolean)
          }
          setVerificationResult(errorResult)
          onVerificationComplete?.(errorResult)
        }
      } else {
        // 验证失败
        // 提取使用的图片ID信息用于准确率计算
        const imageIds = selectedImages.map(img => {
          if (img.name && img.name.includes('_')) {
            return img.name.split('_')[0] // 提取ID部分
          }
          if (img.url && img.url.includes('/')) {
            const pathParts = img.url.split('/')
            if (pathParts.length >= 4) return pathParts[3] // 提取ID部分
          }
          return null
        }).filter(Boolean)
        
        const failResult = {
          success: false,
          error: result.error || '验证失败，步态信息不匹配！',
          timestamp: result.timestamp,
          usedImages: selectedImages.map(img => {
            if (img.name) return img.name
            if (img.url && typeof img.url === 'string') return img.url.split('/').pop()
            return '未知图片'
          }).filter(Boolean),
          sourceImageIds: imageIds
        }
        setVerificationResult(failResult)
        onVerificationComplete?.({...failResult, 
          usedImages: selectedImages.map(img => {
            if (img.name) return img.name
            if (img.url && typeof img.url === 'string') return img.url.split('/').pop()
            return '未知图片'
          }).filter(Boolean),
          sourceImageIds: imageIds
        })
      }
    } catch (error) {
      console.error('验证过程出错:', error)
      // 提取使用的图片ID信息用于准确率计算
      const imageIds = selectedImages.map(img => {
        if (img.name && img.name.includes('_')) {
          return img.name.split('_')[0] // 提取ID部分
        }
        if (img.url && img.url.includes('/')) {
          const pathParts = img.url.split('/')
          if (pathParts.length >= 4) return pathParts[3] // 提取ID部分
        }
        return null
      }).filter(Boolean)
      
      const errorResult = {
        success: false,
        error: '验证过程出错: ' + error.message,
        timestamp: new Date().toISOString(),
        usedImages: selectedImages.map(img => {
          if (img.name) return img.name
          if (img.url && typeof img.url === 'string') return img.url.split('/').pop()
          return '未知图片'
        }).filter(Boolean),
        sourceImageIds: imageIds
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
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">步态信息识别</h3>
        
        {/* 自动模式下的数据采集进度 */}
        {autoMode && isCollecting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">正在采集步态数据...</span>
              <span className="text-sm font-bold text-blue-600">{collectionProgress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${collectionProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">系统正在分析您的步态特征，请稍候...</p>
          </motion.div>
        )}

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
                        <span>模型载入中...</span>
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
              <motion.span 
                className="text-sm font-medium text-green-800"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ 智能模型已成功加载
              </motion.span>
              <motion.span 
                className="text-xs text-green-600 ml-auto"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                准备进行步态识别
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 检测阶段UI */}
      {detectionPhase && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
        >
          {detectionPhase === 'detecting' ? (
            // 检测行人阶段 - 使用圆形动画
            <div className="flex flex-col items-center justify-center py-4">
              {/* 圆形旋转动画 */}
              <div className="relative w-20 h-20 mb-4">
                {/* 外圈旋转 */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* 内圈反向旋转 */}
                <motion.div
                  className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-400 border-l-indigo-400"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* 中心图标 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Radar className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">{detectionMessage}</span>
                <p className="text-xs text-gray-500 mt-2">系统正在扫描行人特征...</p>
              </div>
            </div>
          ) : (
            // 其他阶段 - 使用进度条
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{detectionMessage}</span>
                <span className="text-sm font-bold text-blue-600">{detectionProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${detectionProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {detectionPhase === 'collecting' && '系统正在采集步态数据...'}
                {detectionPhase === 'analyzing' && '系统正在分析步态特征...'}
                {detectionPhase === 'identifying' && '系统正在识别身份信息...'}
              </p>
            </div>
          )}
        </motion.div>
      )}

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
          onClick={startDetection}
          disabled={isVerifying || !modelLoaded || detectionPhase !== null}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isVerifying || detectionPhase ? (
            <motion.div 
              className="flex items-center justify-center"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <motion.div 
                className="relative mr-3"
              >
                <motion.div
                  className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ 
                    scale: { duration: 1.5, repeat: Infinity }
                  }}
                >
                  <Radar className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-blue-300"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.1, 0.5]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -inset-3 rounded-full border border-blue-200"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.05, 0.3]
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
              <motion.div
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 relative">
                    <div className="absolute inset-1 rounded-full border border-blue-500 opacity-60"></div>
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-blue-500 origin-bottom -translate-x-0.5 -translate-y-2"></div>
                  </div>
                </motion.div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  {detectionPhase === 'detecting' && '检测行人中...'}
                  {detectionPhase === 'collecting' && '采集数据中...'}
                  {detectionPhase === 'analyzing' && '分析步态中...'}
                  {detectionPhase === 'identifying' && '识别身份中...'}
                  {!detectionPhase && '雷达扫描识别中...'}
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2"
            >
              <Radar className="w-5 h-5" />
              开始检测
            </motion.span>
          )}
        </button>
        {selectedImages.length > 0 && (
          <button
            onClick={resetVerification}
            disabled={isVerifying || detectionPhase !== null}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
          >
            重置
          </button>
        )}
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
                  <p><strong>置信度:</strong> {Math.min((verificationResult.confidence * 100), 100).toFixed(1)}%</p>
                  
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
                                className="w-64 h-64 object-cover rounded border-2 border-gray-300 mx-auto"
                              />
                              <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-1 rounded-tl">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-800">
                              {prediction?.predictedId || verificationResult.identifiedId}
                            </p>
                            <p className="text-xs text-gray-600" title={img.name || `图像${index + 1}`}>
                              {img.name || `图像${index + 1}`}
                            </p>
                            {prediction?.confidence && (
                              <p className="text-xs text-gray-500">
                                置信度: {Math.min((prediction.confidence * 100), 100).toFixed(1)}%
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
                
                {/* 图像识别详情 */}
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
                              alt={`验证图像 ${index + 1}`}
                              className="w-64 h-64 object-cover rounded border-2 border-red-200"
                            />
                            <span className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1 rounded-tl">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-800">
                            {prediction?.predictedId || '识别失败'}
                          </p>
                          <p className="text-xs text-gray-600" title={img.name || `图像${index + 1}`}>
                            {img.name || `图像${index + 1}`}
                          </p>
                          {prediction?.confidence && (
                            <p className="text-xs text-gray-500">
                              置信度: {Math.min((prediction.confidence * 100), 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default IdentityVerification
