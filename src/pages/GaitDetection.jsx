import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IdentityVerification from '../components/IdentityVerification'
import modelManager from '../utils/modelManager'
import { 
  User, 
  Radar, 
  Camera,
  CheckCircle,
  AlertCircle,
  Activity,
  Brain,
  Upload,
  Save,
  Loader
} from 'lucide-react'

// 演示场景数据
const getDemoScenarios = () => [
  {
    id: 'staff_success', 
    name: '职工识别成功',
    images: ['2024_0830_141020_004.jpg', '2024_0830_141023_005.jpg', '2024_0830_141026_006.jpg'],
    expectedResult: {
      success: true,
      userId: 'STAFF_1',
      userType: 'staff',
      confidence: 0.975
    }
  },
  {
    id: 'resident_success',
    name: '住户识别成功',
    images: ['2024_0830_140532_001.jpg', '2024_0830_140535_002.jpg', '2024_0830_140538_003.jpg'],
    expectedResult: {
      success: true,
      userId: 'ID_1',
      userType: 'resident',
      confidence: 0.981
    }
  },
  {
    id: 'resident_restricted',
    name: '住户夜间限制',
    images: ['2024_0830_140532_001.jpg', '2024_0830_140535_002.jpg', '2024_0830_140538_003.jpg'],
    expectedResult: {
      success: true,
      userId: 'ID_1',
      userType: 'resident',
      confidence: 0.979,
      forceRestrictedTime: true
    }
  },
  {
    id: 'recognition_fail',
    name: '识别失败',
    images: ['2024_0830_141512_007.jpg', '2024_0830_141515_008.jpg', '2024_0830_141518_009.jpg'],
    expectedResult: {
      success: false,
      userId: 'STRANGER',
      userType: 'stranger',
      confidence: 0.978
    }
  }
]

const GaitDetection = () => {
  const [mode, setMode] = useState('ai_verify')
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectionProgress, setCollectionProgress] = useState(0)
  const [processedImage, setProcessedImage] = useState(null)
  const [identificationResult, setIdentificationResult] = useState(null)
  const [aiVerificationResult, setAiVerificationResult] = useState(null)
  const [showAutoVerification, setShowAutoVerification] = useState(false)
  
  // identify模式的状态
  const [detectionPhase, setDetectionPhase] = useState('ready') // 'ready', 'waiting', 'collecting', 'analyzing'
  const [detectionMessage, setDetectionMessage] = useState('')
  const [collectedImages, setCollectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [recognitionImageIndex, setRecognitionImageIndex] = useState(0)
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0)
  const [newUserForm, setNewUserForm] = useState({
    selectedUserId: '',
    name: '',
    age: '',
    gender: '',
    room: ''
  })
  const [selectedIdentifyUserId, setSelectedIdentifyUserId] = useState('')
  
  // 演示模式相关状态
  const [demoMode, setDemoMode] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  
  // 从人员管理系统获取用户数据 - 读取localStorage数据
  const getUserDatabase = () => {
    const saved = localStorage.getItem('personnelData')
    let managementUsers = []
    
    if (saved) {
      managementUsers = JSON.parse(saved)
    } else {
      // 默认数据 - 演示模式扩展
      managementUsers = [
        { id: 'ID_1', name: '张三', age: 78, gender: '男', room: '101', type: 'resident' },
        { id: 'ID_2', name: '李四', age: 82, gender: '女', room: '102', type: 'resident' },
        { id: 'ID_3', name: '王五', age: 75, gender: '男', room: '103', type: 'resident' },
        { id: 'STAFF_1', name: '李护士', age: 35, gender: '女', room: '护士站', type: 'staff' }
      ]
    }
    
    // 转换为步态检测系统格式
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

  // 获取当前演示场景
  const getCurrentDemoScenario = () => {
    const scenarios = getDemoScenarios()
    return scenarios[demoStep % scenarios.length]
  }

  // 开始雷达检测和图像采集
  const startDetection = async () => {
    if (detectionPhase !== 'ready') return
    
    setDetectionPhase('detecting')
    setDetectionMessage('雷达检测中...')
    setCollectedImages([])
    setCurrentImageIndex(0)
    
    if (demoMode) {
      // 演示模式：按顺序循环四种场景
      const scenario = getCurrentDemoScenario()
      console.log(`演示模式第${demoStep + 1}次点击，场景:`, scenario.name)
      
      // 准备演示图像 - 使用时间格式命名
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      
      // 根据场景设置不同的时间
      let displayHour, displayMinute, displaySecond
      if (scenario.id === 'resident_restricted') {
        // 住户夜间限制 - 使用夜间时间（23:00左右）
        displayHour = '23'
        displayMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
        displaySecond = String(Math.floor(Math.random() * 60)).padStart(2, '0')
      } else if (scenario.id === 'recognition_fail') {
        // 陌生人检测 - 使用凌晨时间（02:00左右）
        displayHour = '02'
        displayMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
        displaySecond = String(Math.floor(Math.random() * 60)).padStart(2, '0')
      } else {
        // 正常时间（白天）
        displayHour = String(now.getHours()).padStart(2, '0')
        displayMinute = String(now.getMinutes()).padStart(2, '0')
        displaySecond = String(now.getSeconds()).padStart(2, '0')
      }
      
      const demoImages = scenario.images.map((fileName, index) => ({
        url: `/demo_images/${fileName}`,
        fileName: `${year}_${month}${day}_${displayHour}${displayMinute}${String(Number(displaySecond) + index).padStart(2, '0')}_${String(index + 1).padStart(3, '0')}.jpg`,
        userId: scenario.expectedResult.userId
      }))
      
      // 模拟采集过程
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCollectedImages(prev => [...prev, demoImages[i]])
        setCurrentImageIndex(i + 1)
        setDetectionMessage(`已采集 ${i + 1}/3 张步态图像 [${scenario.name}]`)
      }
      
      setDetectionPhase('analyzing')
      setDetectionMessage(`步态特征分析中... [${scenario.name}]`)
      
      // 模拟AI分析过程
      setTimeout(() => {
        const result = createDemoResult(scenario)
        console.log('演示结果创建完成:', result)
        setIdentificationResult(result)
        setShowAutoVerification(true)
        setDetectionPhase('ready')
        
        // 下一次点击使用下一个场景
        setDemoStep(prev => {
          const nextStep = prev + 1
          console.log(`下次将使用步骤 ${nextStep}, 场景: ${getDemoScenarios()[nextStep % 4].name}`)
          return nextStep
        })
      }, 2000)
    } else {
      // 正常模式
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 选择随机图像进行模拟
        const images = await selectRandomImages()
        setCollectedImages(prev => [...prev, images[i]])
        setCurrentImageIndex(i + 1)
        setDetectionMessage(`已采集 ${i + 1}/3 张步态图像`)
      }
      
      setDetectionPhase('analyzing')
      setDetectionMessage('步态特征分析中...')
      
      // 模拟AI分析过程
      setTimeout(() => {
        performIdentification()
      }, 2000)
    }
  }


  // 创建演示结果
  const createDemoResult = (scenario) => {
    const { expectedResult } = scenario
    
    // 创建识别详情（用于显示识别图像）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // 根据场景设置不同的时间
    let displayHour, displayMinute, displaySecond
    if (scenario.id === 'resident_restricted') {
      // 住户夜间限制 - 使用夜间时间（23:00左右）
      displayHour = '23'
      displayMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
      displaySecond = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    } else if (scenario.id === 'recognition_fail') {
      // 陌生人检测 - 使用凌晨时间（02:00左右）
      displayHour = '02'
      displayMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
      displaySecond = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    } else {
      // 正常时间（白天）
      displayHour = String(now.getHours()).padStart(2, '0')
      displayMinute = String(now.getMinutes()).padStart(2, '0')
      displaySecond = String(now.getSeconds()).padStart(2, '0')
    }
    
    const recognitionDetails = scenario.images.map((fileName, index) => ({
      url: `/demo_images/${fileName}`,
      fileName: `${year}_${month}${day}_${displayHour}${displayMinute}${String(Number(displaySecond) + index).padStart(2, '0')}_${String(index + 1).padStart(3, '0')}.jpg`,
      confidence: expectedResult.confidence + (Math.random() - 0.5) * 0.01, // 轻微变化
      userId: expectedResult.userId,
      features: `特征点${index + 1}`,
      matchScore: expectedResult.confidence * 0.95 + Math.random() * 0.05
    }))
    
    if (expectedResult.success) {
      const userData = getUserDatabase().find(user => user.id === expectedResult.userId)
      
      let accessGranted = true
      let message = '身份验证通过，允许通行'
      
      // 住户时间限制检查（包括强制限制模式）
      if (expectedResult.userType === 'resident') {
        if (expectedResult.forceRestrictedTime) {
          accessGranted = false
          message = '夜间时段（22:00-06:00），住户通行受限'
        } else {
          const currentTime = new Date()
          const hour = currentTime.getHours()
          const isNightTime = hour >= 22 || hour < 6
          if (isNightTime) {
            accessGranted = false
            message = '夜间时段（22:00-06:00），住户通行受限'
          }
        }
      }
      
      return {
        success: true,
        accessGranted,
        user: userData || {
          id: expectedResult.userId,
          name: expectedResult.userType === 'staff' ? '李护士' : '张三',
          type: expectedResult.userType,
          room: expectedResult.userType === 'resident' ? '201' : '工作间'
        },
        confidence: expectedResult.confidence,
        recognitionDetails: recognitionDetails,
        identifiedId: expectedResult.userId,
        message,
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        success: false,
        accessGranted: false,
        user: null,
        confidence: expectedResult.confidence,
        recognitionDetails: recognitionDetails,
        identifiedId: 'STRANGER',
        message: '检测到陌生人，高准确率确认非授权人员，访问被拒绝',
        timestamp: new Date().toISOString()
      }
    }
  }

  // 获取时间权限（针对演示场景）
  const getTimePermission = (user) => {
    if (!user || user.type === 'staff') {
      return {
        allowed: true,
        message: '职工全天候通行'
      }
    }

    const now = new Date()
    const hour = now.getHours()
    const isRestrictedTime = hour >= 22 || hour < 6

    if (user.type === 'resident' && isRestrictedTime) {
      return {
        allowed: false,
        message: '夜间限制时段，禁止外出'
      }
    }

    return {
      allowed: true,
      message: '允许进入'
    }
  }

  // 获取完整的人员数据（供AI验证组件使用）
  const getPersonnelData = () => {
    const saved = localStorage.getItem('personnelData')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      { id: 'ID_1', name: '张三', age: 78, gender: '男', room: '101', type: 'resident' },
      { id: 'ID_2', name: '李四', age: 82, gender: '女', room: '102', type: 'resident' },
      { id: 'ID_3', name: '王五', age: 75, gender: '男', room: '103', type: 'resident' }
    ]
  }
  
  const [userDatabase, setUserDatabase] = useState(getUserDatabase)

  // 监听localStorage变化以同步人员管理数据
  useEffect(() => {
    const handleStorageChange = () => {
      setUserDatabase(getUserDatabase())
    }
    
    window.addEventListener('storage', handleStorageChange)
    // 也监听页面焦点事件，确保数据同步
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  // 识别相关状态
  const [currentGaitImages, setCurrentGaitImages] = useState([])
  const [isMatching, setIsMatching] = useState(false)
  const [matchedImage, setMatchedImage] = useState(null)
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const [isIdentificationComplete, setIsIdentificationComplete] = useState(false)

  // 预加载图像函数
  const preloadImages = async (imageList) => {
    const loadPromises = imageList.map((imageInfo, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          setPreloadProgress(Math.round(((index + 1) / imageList.length) * 100))
          resolve(imageInfo) // 成功加载的图像
        }
        img.onerror = () => {
          setPreloadProgress(Math.round(((index + 1) / imageList.length) * 100))
          resolve(null) // 失败的图像返回null
        }
        img.src = imageInfo.path
      })
    })
    
    const loadedImages = await Promise.all(loadPromises)
    const validImages = loadedImages.filter(img => img !== null)
    
    // 返回所有成功加载的图像
    return validImages
  }

  // 获取用户存在的图像编号（根据实际文件系统）
  const getUserImageNumbers = (userId) => {
    // 生成更完整的图像编号范围，支持非连续序号
    const generateImageNumbers = (ranges) => {
      const numbers = []
      ranges.forEach(range => {
        if (Array.isArray(range)) {
          // 范围数组 [start, end]
          for (let i = range[0]; i <= range[1]; i++) {
            numbers.push(i)
          }
        } else {
          // 单个数字
          numbers.push(range)
        }
      })
      return numbers
    }
    
    // 根据实际数据集的图像编号分布 - 匹配真实文件
    const imageMap = {
      'ID_1': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,70,71,72,73,74,75,76,77,78,79,80,81,82,83,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,199,200,201,202,203,204,205,206,207,208,209],
      'ID_2': generateImageNumbers([[1, 50], [70, 120], [140, 180]]),
      'ID_3': generateImageNumbers([[1, 50], [70, 120], [140, 180]]),
      'ID_4': generateImageNumbers([[1, 50], [70, 120], [140, 180]]),
      'ID_5': generateImageNumbers([[1, 50], [70, 120], [140, 180]]),
      'ID_6': generateImageNumbers([[1, 50], [70, 120], [140, 180]])
    }
    
    // 返回指定用户的图像编号，如果不存在则返回通用编号
    return imageMap[userId] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  }

  // 真正预加载用户的所有图像
  const loadUserAllImages = async (userId) => {
    try {
      const userImages = []
      const imageNumbers = getUserImageNumbers(userId)
      const baseUrl = import.meta.env.BASE_URL || '/'
      
      // 使用Promise.all并发加载所有图像
      const loadPromises = imageNumbers.map(num => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          const imagePath = `${baseUrl}dataset/${userId}/${userId.replace('_', '')}_case1_1_Doppler${num}.jpg`
          const fileName = `${userId.replace('_', '')}_case1_1_Doppler${num}`
          
          img.onload = () => {
            resolve({
              path: imagePath,
              userId: userId,
              imageIndex: num,
              fileName: fileName,
              loaded: true
            })
          }
          
          img.onerror = () => {
            console.warn(`图像加载失败: ${imagePath}`)
            // 即使失败也返回，但标记为未加载
            resolve({
              path: imagePath,
              userId: userId,
              imageIndex: num,
              fileName: fileName,
              loaded: false
            })
          }
          
          img.src = imagePath
        })
      })
      
      const results = await Promise.all(loadPromises)
      // 只返回成功加载的图像
      const validImages = results.filter(img => img.loaded)
      
      if (validImages.length === 0) {
        throw new Error('没有成功加载任何图像')
      }
      
      return validImages
    } catch (error) {
      return []
    }
  }

  // 图像轮播效果
  useEffect(() => {
    if (isMatching && currentGaitImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % currentGaitImages.length)
      }, 50) // 快速轮播50ms
      return () => clearInterval(interval)
    }
  }, [isMatching, currentGaitImages])
  
  // 数据采集模式下的图像轮播 - 已禁用，使用手动轮播
  // useEffect(() => {
  //   // 只在正在采集时轮播，采集完成后停止
  //   if (mode === 'register' && collectedImages.length > 0 && isCollecting) {
  //     const interval = setInterval(() => {
  //       setCurrentImageIndex(prev => (prev + 1) % collectedImages.length)
  //     }, 100) // 每100ms切换一张图像
  //     return () => clearInterval(interval)
  //   }
  // }, [mode, isCollecting, collectedImages])

  // 三阶段检测流程
  const handleIdentification = async () => {
    setIdentificationResult(null)
    setCollectedImages([])
    setCurrentImageIndex(0)
    setRecognitionImageIndex(0)
    
    try {
      // 第一阶段：等待行人检测
      setDetectionPhase('waiting')
      setDetectionMessage('未检测到行人，请稍等')
      const waitTime = 1000 + Math.random() * 1500 // 1-2.5秒随机
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      // 第二阶段：数据采集
      setDetectionPhase('collecting')
      setDetectionMessage('正在采集数据')
      setCollectionProgress(0)
      const collectTime = 3000 + Math.random() * 1500 // 3-4.5秒随机
      
      // 模拟采集进度
      const collectInterval = setInterval(() => {
        setCollectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(collectInterval)
            return 100
          }
          return prev + (100 / (collectTime / 100))
        })
      }, 100)
      
      await new Promise(resolve => setTimeout(resolve, collectTime))
      clearInterval(collectInterval)
      
      // 数据采集完成，准备下一阶段
      const images = await selectRandomImages()
      if (!images || images.length === 0) {
        console.error('未能获取图像')
        setDetectionPhase('ready')
        return
      }
      
      // 第三阶段：步态分析
      setDetectionPhase('analyzing')
      setDetectionMessage('正在进行步态分析')
      setCollectionProgress(0)
      const analyzeTime = 3000 + Math.random() * 2000 // 3-5秒随机
      
      // 模拟分析进度
      const analyzeInterval = setInterval(() => {
        setCollectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(analyzeInterval)
            return 100
          }
          return prev + (100 / (analyzeTime / 100))
        })
      }, 100)
      
      await new Promise(resolve => setTimeout(resolve, analyzeTime))
      clearInterval(analyzeInterval)
      
      // 数据采集完成，设置识别成功结果
      setDetectionPhase('ready')
      
      // 设置识别结果 - 使用ResNet18模型进行真实预测
      const recognitionDetails = []
      const model = modelManager.getModel()
      
      // 如果模型已加载，使用真实预测；否则使用模拟值
      if (model && model.isLoaded) {
        // 预测每张图像
        for (const img of images) {
          try {
            // 创建图像元素
            const imageElement = new Image()
            imageElement.src = img.url
            await new Promise((resolve, reject) => {
              imageElement.onload = resolve
              imageElement.onerror = reject
            })
            
            // 使用ResNet18模型预测
            const prediction = await model.predictSingle(imageElement)
            // 只使用真实的模型置信度
            if (typeof prediction.confidence === 'number') {
              recognitionDetails.push({
                ...img,
                confidence: Math.min(Math.max(prediction.confidence, 0), 1.0), // 确保置信度在0-1之间
                predictedId: prediction.classId || img.userId
              })
            } else {
              console.warn(`图像 ${img.fileName} 预测未返回置信度`)
              // 如果模型没有返回置信度，跳过此图像或设为0
              recognitionDetails.push({
                ...img,
                confidence: 0, // 无置信度时设为0
                predictedId: img.userId
              })
            }
          } catch (error) {
            console.error(`预测图像 ${img.fileName} 失败:`, error)
            // 预测失败时置信度设为0，表示无法识别
            recognitionDetails.push({
              ...img,
              confidence: 0, // 预测失败时置信度为0
              predictedId: img.userId
            })
          }
        }
      } else {
        // 未启用模型时，无法提供真实置信度
        console.warn('ResNet18模型未加载，无法进行真实识别')
        images.forEach(img => {
          recognitionDetails.push({
            ...img,
            confidence: 0, // 无模型时置信度为0
            predictedId: img.userId
          })
        })
      }
      
      // 获取主要用户ID（应该是采集图像中最多的用户）
      const userIds = images.map(img => img.userId)
      const primaryId = userIds[0] // 使用第一张图像的用户ID作为主ID
      
      const isSuccess = recognitionDetails.every(detail => detail.predictedId === primaryId)
      
      const userDB = getUserDatabase()
      const matchedUser = userDB[primaryId]
      
      setIdentificationResult({
        success: isSuccess,
        person: matchedUser || { name: '未知用户', age: '--', gender: '--', room: '--' },
        identifiedId: primaryId,
        confidence: Math.min(recognitionDetails.reduce((sum, d) => sum + d.confidence, 0) / recognitionDetails.length, 1.0), // 确保平均置信度不超过1.0
        recognitionDetails: recognitionDetails,
        message: isSuccess ? '识别成功，身份验证通过' : '识别失败，未找到匹配的用户',
        timePermission: {
          allowed: true,
          message: '允许进入'
        }
      })
      setShowAutoVerification(true)
    } catch (error) {
      console.error('检测过程出错:', error)
      setDetectionPhase('ready')
    }
  }

  // 随机选择图像函数（用于模拟检测）
  const selectRandomImages = async () => {
    try {
      const personnelData = getPersonnelData()
      const availableIds = personnelData.map(person => person.id).filter(id => id)
      
      if (availableIds.length === 0) {
        throw new Error('没有可用的用户数据')
      }
      
      const primaryId = availableIds[Math.floor(Math.random() * availableIds.length)]
      
      // 加载数据集索引
      let datasetIndex = {}
      try {
        const response = await fetch(`${import.meta.env.BASE_URL || '/'}dataset/dataset_index.json`)
        if (response.ok) {
          datasetIndex = await response.json()
        }
      } catch (error) {
      }
      
      let primaryImages = datasetIndex[primaryId] || []
      if (primaryImages.length === 0) {
        // 构建图像文件名列表
        for (let i = 1; i <= 20; i++) {
          primaryImages.push(`${primaryId}_${i.toString().padStart(3, '0')}.jpg`)
        }
      }
      
      const selectedImages = []
      
      // 选择2张主用户图像
      for (let i = 0; i < 2 && i < primaryImages.length; i++) {
        const randomIndex = Math.floor(Math.random() * primaryImages.length)
        const fileName = primaryImages[randomIndex]
        const baseUrl = import.meta.env.BASE_URL || '/'
        const imagePath = `${baseUrl}dataset/${fileName}`
        selectedImages.push({
          url: imagePath,
          fileName: fileName,
          userId: primaryId
        })
        primaryImages.splice(randomIndex, 1)
      }
      
      // 选择第3张图像
      const usesSameUser = Math.random() < 0.7
      if (usesSameUser && primaryImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * primaryImages.length)
        const fileName = primaryImages[randomIndex]
        const baseUrl = import.meta.env.BASE_URL || '/'
        const imagePath = `${baseUrl}dataset/${fileName}`
        selectedImages.push({
          url: imagePath,
          fileName: fileName,
          userId: primaryId
        })
      } else {
        const otherIds = availableIds.filter(id => id !== primaryId)
        if (otherIds.length > 0) {
          const otherId = otherIds[Math.floor(Math.random() * otherIds.length)]
          let otherImages = datasetIndex[otherId] || []
          if (otherImages.length === 0) {
            for (let i = 1; i <= 20; i++) {
              otherImages.push(`${otherId}_${i.toString().padStart(3, '0')}.jpg`)
            }
          }
          const randomIndex = Math.floor(Math.random() * otherImages.length)
          const fileName = otherImages[randomIndex]
          const baseUrl = import.meta.env.BASE_URL || '/'
          const imagePath = `${baseUrl}dataset/${fileName}`
          selectedImages.push({
            url: imagePath,
            fileName: fileName,
            userId: otherId
          })
        }
      }
      
      return selectedImages
    } catch (error) {
      console.error('选择图像失败:', error)
      return null
    }
  }
  
  // 处理步态信息识别结果
  const handleAiVerification = (result) => {
    setAiVerificationResult(result)
    
    // 如果是identify模式的自动验证，关闭验证组件显示结果
    if (mode === 'identify' && showAutoVerification) {
      setShowAutoVerification(false)
      setIdentificationResult(result)
    }
    
    if (result.success) {
      // 记录访问日志
      const logEntry = {
        type: 'ai_verification',
        userId: result.identifiedId,
        userName: result.person.name,
        result: result.timePermission.allowed ? 'success' : 'time_restricted',
        confidence: result.confidence,
        timePermission: result.timePermission,
        duration: '2.5s',
        timestamp: new Date().toISOString(),
        sourceImageIds: result.sourceImageIds || []
      }
      
      saveActivityLog(logEntry)
    } else {
      // 验证失败时也记录日志，包含图片来源ID信息
      const logEntry = {
        type: 'ai_verification',
        userId: null,
        userName: '验证失败',
        result: 'failed',
        confidence: result.confidence || 0,
        duration: '2.5s',
        timestamp: new Date().toISOString(),
        sourceImageIds: result.sourceImageIds || [],
        error: result.error
      }
      
      saveActivityLog(logEntry)
    }
  }

  // 保存识别活动日志
  const saveActivityLog = (activity) => {
    const existingLog = JSON.parse(localStorage.getItem('gaitActivityLog') || '[]')
    const newLog = [...existingLog, activity]
    localStorage.setItem('gaitActivityLog', JSON.stringify(newLog))
    
    // 触发storage事件，通知统计模块数据变更
    window.dispatchEvent(new Event('storage'))
  }

  // 重构的采集过程
  const handleStartCollection = async () => {
    
    if (!newUserForm.selectedUserId) {
      alert('请先选择要采集数据的用户ID')
      return
    }
    
    try {
      // 立即显示加载状态
      setIsCollecting(true)
      setCollectedImages([])
      setCurrentImageIndex(0)
      setProcessedImage(null)
      setCollectionProgress(0)
      
      // 真正预加载图像
      const userImages = await loadUserAllImages(newUserForm.selectedUserId)
      
      if (!userImages || userImages.length === 0) {
        setIsCollecting(false)
        alert('未找到该用户的步态图像数据或图像加载失败')
        return
      }
      
      // 将预加载的图像转换为采集图像格式
      const formattedImages = userImages.map(img => ({
        url: img.path,
        fileName: img.fileName,
        userId: img.userId,
        imageIndex: img.imageIndex
      }))
      
      // 图像加载完成后设置状态
      setCollectedImages(formattedImages)
      setCurrentImageIndex(0)
      
      // 等待一下确保状态更新
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 开始图像轮播展示，每张图片展示200ms
      for (let i = 0; i < formattedImages.length; i++) {
        setCurrentImageIndex(i)
        setCollectionProgress(Math.round(((i + 1) / formattedImages.length) * 100))
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      
      // 选择最后一张图像作为处理结果，确保左右两侧显示相同
      const lastImageIndex = formattedImages.length - 1
      setCurrentImageIndex(lastImageIndex)
      setProcessedImage({
        path: formattedImages[lastImageIndex].url,
        userId: formattedImages[lastImageIndex].userId,
        imageIndex: formattedImages[lastImageIndex].imageIndex
      })
      
      // 确保进度条完成到100%
      setCollectionProgress(100)
      setIsCollecting(false)
    } catch (error) {
      setIsCollecting(false)
      setCollectedImages([])
      alert(`数据采集过程中发生错误: ${error.message}`)
    }
  }

  // 保存新用户步态数据
  const handleSaveUser = () => {
    if (!newUserForm.selectedUserId || !processedImage) {
      alert('请选择用户ID并采集步态数据')
      return
    }
    
    const userInfo = userDatabase[newUserForm.selectedUserId]
    if (!userInfo) {
      alert('用户信息不存在，请先在人员管理模块中添加该用户')
      return
    }
    
    // 保存步态数据采集记录
    saveActivityLog({
      type: 'registration',
      userId: newUserForm.selectedUserId,
      userName: userInfo.name,
      result: 'success',
      confidence: 1.0,
      duration: '3.2',
      timestamp: new Date().toISOString()
    })
    
    alert(`用户 ${userInfo.name} (${newUserForm.selectedUserId}) 的步态数据采集完成！`)
    setNewUserForm({ selectedUserId: '', name: '', age: '', gender: '', room: '' })
    setProcessedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Radar className="h-6 w-6 text-white" />
              </div>
              智能步态识别系统
            </h1>
            <p className="text-gray-600 mt-2 font-medium">基于深度学习的高精度非接触式身份识别</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('ai_verify')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md ${
                mode === 'ai_verify' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-purple-200 hover:border-purple-300'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span>步态识别</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('register')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md ${
                mode === 'register' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>数据采集</span>
            </motion.button>
          </div>
        </motion.div>

        {mode === 'ai_verify' ? (
          // 步态信息识别模式 - 单列布局
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <IdentityVerification 
              onVerificationComplete={handleAiVerification}
              personnelData={getPersonnelData()}
              demoMode={demoMode}
              demoStep={demoStep}
              onDemoStepChange={setDemoStep}
              demoScenarios={getDemoScenarios()}
            />
            
            {/* 隐蔽的演示模式激活区域 - 双击页面标题激活 */}
            <div 
              className="fixed top-16 left-6 w-20 h-8 opacity-0 cursor-pointer z-50"
              onDoubleClick={() => {
                setDemoMode(!demoMode)
                if (!demoMode) {
                  setDemoStep(0)
                  console.log('🎯 演示模式已激活')
                } else {
                  console.log('❌ 演示模式已关闭')
                }
              }}
              title={demoMode ? "演示模式已激活" : "双击激活演示模式"}
            />
          </motion.div>
        ) : (
          <>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[800px]">
            {/* 左侧 - 步态信息检测 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col h-full"
            >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3 shadow-lg">
                    <div className="w-5 h-5 rounded-full border-2 border-white relative">
                      <div className="absolute inset-1 rounded-full border border-white opacity-60"></div>
                      <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-white origin-bottom -translate-x-0.5 -translate-y-2"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    雷达步态检测
                  </h3>
                </div>
                {mode === 'identify' && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    识别模式
                  </div>
                )}
                {mode === 'register' && (
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                    采集模式
                  </div>
                )}
              </div>
              <div className="relative w-full flex-1 min-h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200 overflow-visible p-8">
                {isPreloading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-600 relative animate-pulse">
                          <div className="absolute inset-1 rounded-full border border-blue-600 opacity-60"></div>
                          <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-blue-600 origin-bottom -translate-x-0.5 -translate-y-3"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">雷达扫描中...</p>
                    <p className="text-gray-500 text-sm mt-1">未检测到行人</p>
                  </motion.div>
                ) : isIdentificationComplete && matchedImage ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <div className="relative inline-block">
                      <img
                        src={matchedImage.path}
                        alt="识别成功的步态图像"
                        className="rounded-2xl shadow-2xl"
                        style={{width: '256px', height: '256px', objectFit: 'contain'}}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -top-12 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2 z-20 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>识别成功</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : mode === 'register' && isCollecting ? (
                  // 数据采集模式 - 轮播展示用户的所有图像
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                    style={{ minHeight: '400px' }}
                  >
                    {(() => {
                      return collectedImages.length > 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="relative">
                            <img
                              src={collectedImages[currentImageIndex]?.url}
                              alt={`采集图像 ${currentImageIndex + 1}`}
                              className="w-64 h-64 object-contain rounded-2xl shadow-xl"
                              style={{width: '256px', height: '256px', objectFit: 'contain'}}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute -top-12 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2 z-20 whitespace-nowrap"
                          >
                            <Camera className="w-4 h-4 animate-pulse" />
                            <span>数据采集中...</span>
                          </motion.div>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border shadow-lg">
                            {collectedImages[currentImageIndex]?.fileName || '加载中...'}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            扫描图像 {currentImageIndex + 1} / {collectedImages.length || '...'}
                          </p>
                        </div>
                      </div>
                      ) : (
                        // 正在加载图像时显示加载状态
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-24 h-24 mb-6">
                            {/* 外圈旋转 */}
                            <motion.div
                              className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-green-500"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                            {/* 内圈反向旋转 */}
                            <motion.div
                              className="absolute inset-2 rounded-full border-4 border-transparent border-b-green-400 border-l-emerald-400"
                              animate={{ rotate: -360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            {/* 中心图标 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <Loader className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">准备采集</h4>
                          <p className="text-gray-500">正常检测步态信息</p>
                        </div>
                      )
                    })()}
                  </motion.div>
                ) : mode === 'identify' ? (
                  // identify模式 - 左侧检测可视化
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full flex flex-col items-center justify-center py-8"
                  >
                    {(() => {
                      // 根据检测阶段显示不同内容
                      if (detectionPhase === 'waiting') {
                        // 等待行人检测 - 使用圆形循环动画
                        return (
                          <div className="flex flex-col items-center justify-center w-full h-full text-center">
                            <div className="relative w-24 h-24 mb-6">
                              {/* 外圈旋转动画 */}
                              <motion.div
                                className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-500 border-r-orange-500"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                              {/* 内圈反向旋转动画 */}
                              <motion.div
                                className="absolute inset-2 rounded-full border-4 border-transparent border-b-orange-400 border-l-yellow-400"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                              {/* 中心图标 */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Radar className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">{detectionMessage}</h4>
                            <p className="text-gray-500">正在等待行人进入检测区域...</p>
                          </div>
                        )
                      } else if (detectionPhase === 'collecting' || detectionPhase === 'analyzing') {
                        // 数据采集或分析中
                        return (
                          <div className="flex flex-col items-center justify-center w-full h-full text-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl mx-auto">
                              <Radar className="w-10 h-10 text-white animate-pulse" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-4">{detectionMessage}</h4>
                            <div className="w-full max-w-xs mx-auto mb-4">
                              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${collectionProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <p className="text-sm text-gray-500 mt-2 text-center">{Math.round(collectionProgress)}%</p>
                            </div>
                          </div>
                        )
                      } else if (collectedImages.length > 0 && !isCollecting) {
                        // 显示采集完成的图像轮播
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="relative">
                              <img
                                src={collectedImages[currentImageIndex]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='}
                                alt={`采集图像 ${currentImageIndex + 1}`}
                                className="w-64 h-64 object-contain rounded-2xl shadow-xl"
                                style={{width: '256px', height: '256px', objectFit: 'contain'}}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                }}
                              />
                              {/* 左右切换按钮 */}
                              {collectedImages.length > 1 && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setCurrentImageIndex(prev => 
                                      prev === 0 ? collectedImages.length - 1 : prev - 1
                                    )}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setCurrentImageIndex(prev => 
                                      prev === collectedImages.length - 1 ? 0 : prev + 1
                                    )}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </motion.button>
                                </>
                              )}
                            </div>
                            {/* 显示图像信息 */}
                            <div className="mt-4 text-center">
                              <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border shadow-lg">
                                {collectedImages[currentImageIndex]?.fileName}
                              </div>
                              <div className="mt-3 flex items-center justify-center space-x-1">
                                {collectedImages.map((_, idx) => (
                                  <motion.div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                                      idx === currentImageIndex ? 'bg-blue-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                采集图像 {currentImageIndex + 1} / {collectedImages.length}
                              </p>
                            </div>
                          </div>
                        )
                      } else {
                        // 准备就绪状态
                        return (
                          <div className="text-center">
                            <motion.button 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleIdentification}
                            >
                              <Radar className="w-10 h-10 text-white" />
                            </motion.button>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2 text-center">准备就绪</h4>
                            <p className="text-gray-500 text-center">点击开始检测步态信息</p>
                          </div>
                        )
                      }
                    })()}
                  </motion.div>
                ) : isMatching && currentGaitImages.length > 0 ? (
                  <motion.div 
                    className="relative w-full h-full flex items-center justify-center"
                    key={currentImageIndex}
                  >
                    <motion.img
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={currentGaitImages[currentImageIndex]?.path}
                      alt={`步态图像 ${currentImageIndex + 1}`}
                      className="rounded-2xl shadow-xl"
                      style={{width: '256px', height: '256px', objectFit: 'contain'}}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2 z-20">
                      <Radar className="w-4 h-4 animate-pulse" />
                      <span>特征匹配中...</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl cursor-pointer hover:shadow-3xl hover:scale-125 transition-all duration-300"
                      whileHover={{ scale: 1.50 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (mode === 'identify') {
                          handleIdentification()
                        } else {
                          handleStartCollection()
                        }
                      }}
                    >
                      <Radar className="w-10 h-10 text-white" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2 text-center">准备就绪</h4>
                    <p className="text-gray-500 text-center">
                      {mode === 'register' ? '点击开始采集步态数据' : '点击即可开始检测步态信息'}
                    </p>
                  </motion.div>
                )}
                {/* 背景装饰效果 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-16 h-16 border-2 border-blue-200 rounded-full opacity-30"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-indigo-200 rounded-full opacity-20"></div>
                  <div className="absolute top-1/2 right-8 w-8 h-8 border-2 border-blue-300 rounded-full opacity-25"></div>
                </div>
              </div>

              {mode === 'identify' ? (
                showAutoVerification ? (
                  // 隐藏在后台进行自动验证
                  <div style={{display: 'none'}}>
                    <IdentityVerification 
                      onVerificationComplete={handleAiVerification}
                      personnelData={getPersonnelData()}
                      autoMode={true}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleIdentification}
                      disabled={detectionPhase !== 'ready'}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      {detectionPhase !== 'ready' ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>检测中...</span>
                        </>
                      ) : (
                        <>
                          <Radar className="w-5 h-5" />
                          <span>开始检测</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleStartCollection()
                    }}
                    disabled={isCollecting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {isCollecting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>数据采集中... {collectionProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>开始数据采集</span>
                      </>
                    )}
                  </motion.button>
                  
                  {/* Progress bar for collection */}
                  {isCollecting && (
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${collectionProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 text-center">正在采集步态特征... {collectionProgress}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* 右侧 - 用户步态信息 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col h-full"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg mr-3 shadow-lg">
                    <Radar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    智能识别结果
                  </h3>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                  实时分析
                </div>
              </div>
              <div className="relative w-full flex-1 min-h-80 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-emerald-200 overflow-visible p-4">
                {matchedImage ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <div className="relative inline-block">
                      <img
                        src={matchedImage.path}
                        alt="匹配的步态图像"
                        className="rounded-2xl shadow-2xl"
                        style={{width: '256px', height: '256px', objectFit: 'contain'}}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -top-12 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2 z-20 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>识别成功</span>
                      </motion.div>
                      <div className="absolute -bottom-12 left-0 right-0 mx-auto w-fit bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border shadow-lg z-20">
                        {matchedImage.fileName}
                      </div>
                    </div>
                  </motion.div>
                ) : processedImage && mode === 'register' && collectedImages.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center"
                  >
                    {/* 左箭头按钮 - 移到图像外侧 */}
                    {collectedImages.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? collectedImages.length - 1 : prev - 1
                        )}
                        className="mr-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </motion.button>
                    )}
                    
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={collectedImages[currentImageIndex]?.url}
                          alt={`步态图像 ${currentImageIndex + 1}`}
                          className="w-72 h-72 object-contain rounded-2xl shadow-xl"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                      {/* 显示图像信息 */}
                      <div className="mt-4 text-center">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border shadow-lg">
                          {collectedImages[currentImageIndex]?.fileName}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          图像 {currentImageIndex + 1} / {collectedImages.length}
                        </p>
                      </div>
                    </div>
                    
                    {/* 右箭头按钮 - 移到图像外侧 */}
                    {collectedImages.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === collectedImages.length - 1 ? 0 : prev + 1
                        )}
                        className="ml-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    )}
                  </motion.div>
                ) : mode === 'identify' ? (
                  // identify模式 - 右侧识别结果区域
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full"
                  >
                    {(() => {
                      if (!identificationResult && detectionPhase === 'analyzing') {
                        // 分析中 - 显示处理状态
                        return (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                              <Loader className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">识别处理中...</h4>
                            <p className="text-gray-500">正在匹配步态数据</p>
                          </div>
                        )
                      } else if (!identificationResult) {
                        // 未开始识别或其他状态 - 显示等待
                        return (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                              <User className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">等待识别</h4>
                            <p className="text-gray-500">将在识别成功后显示结果</p>
                          </div>
                        )
                      } else if (identificationResult.success) {
                        // 识别成功 - 显示识别详情
                        return (
                          <div className="w-full h-full flex flex-col">
                            {/* 识别结果图像展示 */}
                            <div className="flex-1 flex items-center justify-center py-4">
                              <div className="relative">
                                <img
                                  src={(() => {
                                    const detail = identificationResult.recognitionDetails?.[currentRecognitionIndex]
                                    if (!detail) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                    // 直接使用detail.url，该路径已经在autoSelectImages中正确构造
                                    return detail.url
                                  })()}
                                  alt={`识别图像 ${currentRecognitionIndex + 1}`}
                                  className="w-64 h-64 object-contain rounded-2xl shadow-xl"
                                  style={{width: '256px', height: '256px', objectFit: 'contain'}}
                                  onError={(e) => {
                                    console.log('识别图像加载失败:', e.target.src)
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                  }}
                                />
                                {/* 左右切换按钮 */}
                                {identificationResult.recognitionDetails && identificationResult.recognitionDetails.length > 1 && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setCurrentRecognitionIndex(prev => 
                                        prev === 0 ? identificationResult.recognitionDetails.length - 1 : prev - 1
                                      )}
                                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setCurrentRecognitionIndex(prev => 
                                        prev === identificationResult.recognitionDetails.length - 1 ? 0 : prev + 1
                                      )}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </motion.button>
                                  </>
                                )}
                                {/* 成功标记 */}
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute -top-8 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1.5"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>识别成功</span>
                                </motion.div>
                                {/* 置信度显示 */}
                                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                  {(() => {
                                    const detail = identificationResult.recognitionDetails?.[currentRecognitionIndex]
                                    if (!detail || typeof detail.confidence !== 'number') return '0.0%'
                                    // 置信度已经是0-1的小数，直接乘以100
                                    const confidence = Math.min(detail.confidence * 100, 100)
                                    return `${confidence.toFixed(1)}%`
                                  })()}
                                </div>
                              </div>
                            </div>
                            {/* 图像信息和指示器 */}
                            <div className="text-center pb-4">
                              <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border shadow-lg inline-block">
                                {identificationResult.recognitionDetails?.[currentRecognitionIndex]?.fileName || '未知文件'}
                              </div>
                              {identificationResult.recognitionDetails && identificationResult.recognitionDetails.length > 1 && (
                                <div className="mt-3 flex items-center justify-center space-x-1">
                                  {identificationResult.recognitionDetails.map((_, idx) => (
                                    <motion.div
                                      key={idx}
                                      className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                                        idx === currentRecognitionIndex ? 'bg-green-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                                      }`}
                                      onClick={() => setCurrentRecognitionIndex(idx)}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      } else {
                        // 识别失败 - 显示失败的图像
                        return (
                          <div className="w-full h-full flex flex-col">
                            {/* 识别失败图像展示 */}
                            <div className="flex-1 flex items-center justify-center py-4">
                              <div className="relative">
                                <img
                                  src={(() => {
                                    const detail = identificationResult.recognitionDetails[currentRecognitionIndex]
                                    if (!detail) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                    return detail.url
                                  })()}
                                  alt={`识别图像 ${currentRecognitionIndex + 1}`}
                                  className="w-64 h-64 object-contain rounded-2xl shadow-xl"
                                  style={{width: '256px', height: '256px', objectFit: 'contain'}}
                                  onError={(e) => {
                                    console.log('识别图像加载失败:', e.target.src)
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                  }}
                                />
                                {/* 左右切换按钮 */}
                                {identificationResult.recognitionDetails && identificationResult.recognitionDetails.length > 1 && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setCurrentRecognitionIndex(prev => 
                                        prev === 0 ? identificationResult.recognitionDetails.length - 1 : prev - 1
                                      )}
                                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setCurrentRecognitionIndex(prev => 
                                        prev === identificationResult.recognitionDetails.length - 1 ? 0 : prev + 1
                                      )}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-200"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </motion.button>
                                  </>
                                )}
                                {/* 失败标记 */}
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute -top-8 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1.5"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  <span>识别失败</span>
                                </motion.div>
                                {/* 置信度显示 */}
                                <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                  {(() => {
                                    const detail = identificationResult.recognitionDetails?.[currentRecognitionIndex]
                                    if (!detail || typeof detail.confidence !== 'number') return '0.0%'
                                    // 置信度已经是0-1的小数，直接乘以100
                                    const confidence = Math.min(detail.confidence * 100, 100)
                                    return `${confidence.toFixed(1)}%`
                                  })()}
                                </div>
                              </div>
                            </div>
                            {/* 图像信息和指示器 */}
                            <div className="text-center pb-4">
                              <p className="text-red-600 font-medium mb-2">{identificationResult.message || '未找到匹配的用户'}</p>
                              <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border shadow-lg inline-block">
                                {identificationResult.recognitionDetails?.[currentRecognitionIndex]?.fileName || '未知文件'}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                共 {identificationResult.recognitionDetails?.length || 0} 张识别图像 
                                {identificationResult.recognitionDetails?.length > 0 && `(当前 ${currentRecognitionIndex + 1}/${identificationResult.recognitionDetails.length})`}
                              </p>
                              {identificationResult.recognitionDetails && identificationResult.recognitionDetails.length > 1 && (
                                <div className="mt-3 flex items-center justify-center space-x-1">
                                  {identificationResult.recognitionDetails.map((_, idx) => (
                                    <motion.div
                                      key={idx}
                                      className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                                        idx === currentRecognitionIndex ? 'bg-red-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                                      }`}
                                      onClick={() => setCurrentRecognitionIndex(idx)}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    />
                                  ))}
                                </div>
                              )}
                              <div className="mt-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleIdentification}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                  重新检测
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    })()}
                  </motion.div>
                ) : (isPreloading || isMatching) ? (
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>正在识别用户信息</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">等待识别</h4>
                    <p className="text-gray-500">将在识别成功后显示结果</p>
                  </div>
                )}
              </div>

              {mode === 'register' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择用户ID
                    </label>
                    <select
                      value={newUserForm.selectedUserId}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        setNewUserForm({
                          ...newUserForm,
                          selectedUserId: selectedId,
                          name: userDatabase[selectedId]?.name || '',
                          age: userDatabase[selectedId]?.age || '',
                          gender: userDatabase[selectedId]?.gender || '',
                          room: userDatabase[selectedId]?.room || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">请选择用户ID</option>
                      {Object.keys(userDatabase).map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                      <input
                        type="text"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="输入姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                      <input
                        type="number"
                        value={newUserForm.age}
                        onChange={(e) => setNewUserForm({...newUserForm, age: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="输入年龄"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                      <select
                        value={newUserForm.gender}
                        onChange={(e) => setNewUserForm({...newUserForm, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">选择性别</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">房间号</label>
                      <input
                        type="text"
                        value={newUserForm.room}
                        onChange={(e) => setNewUserForm({...newUserForm, room: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="如：A栋101室"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveUser}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="inline w-4 h-4 mr-2" />
                    保存用户信息
                  </button>
                </div>
              ) : mode === 'identify' ? (
                // identify模式 - 右侧识别结果区域
                <div className="space-y-3">
                  {(() => {
                    // 根据状态显示不同的识别结果
                    if (!identificationResult) {
                      // 没有识别结果时显示等待或处理中状态
                      if (detectionPhase === 'ready' && collectedImages.length === 0) {
                        // 等待开始检测
                        return (
                          <div className="text-center py-8">
                            <div className="bg-gradient-to-r from-gray-400 to-gray-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Radar className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">等待识别</h4>
                            <p className="text-gray-500">请点击左侧按钮开始检测</p>
                          </div>
                        )
                      } else {
                        // 正在处理中
                        return (
                          <div className="text-center py-8">
                            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Loader className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">正在处理</h4>
                            <p className="text-gray-500">请稍候，正在进行步态识别分析</p>
                          </div>
                        )
                      }
                    } else if (identificationResult.success) {
                      // 识别成功
                      return (
                        <>
                          <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl ${
                            identificationResult.timePermission?.allowed
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              identificationResult.timePermission?.allowed
                                ? 'bg-green-100'
                                : 'bg-yellow-100'
                            }`}>
                              {identificationResult.timePermission?.allowed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 flex items-center">
                                {identificationResult.timePermission?.allowed ? '识别成功' : '时间受限'}
                                <span className="ml-2 text-xs text-gray-500">({new Date().toLocaleTimeString()})</span>
                              </h4>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">识别ID：</span>
                                  <span className="font-medium text-gray-800">{identificationResult.identifiedId}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">姓名：</span>
                                  <span className="font-medium text-gray-800">{identificationResult.person?.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">置信度：</span>
                                  <span className="font-medium text-green-600">{Math.min(identificationResult.confidence * 100, 100).toFixed(1)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">用时：</span>
                                  <span className="font-medium text-gray-800">2.5s</span>
                                </div>
                                {!identificationResult.timePermission?.allowed && (
                                  <div className="col-span-2">
                                    <span className="text-yellow-600 text-sm">⚠ {identificationResult.timePermission?.message}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        {identificationResult.recognitionDetails && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">识别详情</h5>
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <img 
                                  src={(() => {
                                    const detail = identificationResult.recognitionDetails[recognitionImageIndex]
                                    if (!detail) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                    const baseUrl = import.meta.env.BASE_URL || '/'
                                    return detail.url || `${baseUrl}dataset/${detail.fileName}`
                                  })()} 
                                  alt={`识别图像${recognitionImageIndex + 1}`}
                                  className="rounded-lg border border-gray-200"
                                  style={{width: '200px', height: '200px', objectFit: 'cover'}}
                                  onError={(e) => {
                                    console.log('识别图像加载失败:', e.target.src)
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                  }}
                                />
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                                  {identificationResult.recognitionDetails[recognitionImageIndex]?.predictedId}
                                </div>
                                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                  置信度: {(() => {
                                    const detail = identificationResult.recognitionDetails?.[recognitionImageIndex]
                                    if (!detail || typeof detail.confidence !== 'number') return '0.0'
                                    // 置信度已经是0-1的小数，直接乘以100
                                    const confidence = Math.min(detail.confidence * 100, 100)
                                    return confidence.toFixed(1)
                                  })()}%
                                </div>
                                {/* 左右切换按钮 */}
                                {identificationResult.recognitionDetails.length > 1 && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setRecognitionImageIndex(prev => 
                                        prev === 0 ? identificationResult.recognitionDetails.length - 1 : prev - 1
                                      )}
                                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all duration-200"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setRecognitionImageIndex(prev => 
                                        prev === identificationResult.recognitionDetails.length - 1 ? 0 : prev + 1
                                      )}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all duration-200"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </motion.button>
                                  </>
                                )}
                              </div>
                              {/* 显示图像信息 */}
                              <div className="mt-3 text-center">
                                <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded text-xs font-medium border shadow">
                                  {identificationResult.recognitionDetails[recognitionImageIndex]?.fileName || `图像${recognitionImageIndex + 1}`}
                                </div>
                                <div className="mt-2 flex items-center justify-center space-x-1">
                                  {identificationResult.recognitionDetails.map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 cursor-pointer ${
                                        idx === recognitionImageIndex ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'
                                      }`}
                                      onClick={() => setRecognitionImageIndex(idx)}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {recognitionImageIndex + 1} / {identificationResult.recognitionDetails.length}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </>
                      )
                    } else {
                      // 识别失败
                      return (
                        <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-800">识别失败</h4>
                            <p className="text-sm text-red-600 mt-1">
                              {identificationResult.message || '未找到匹配的身份信息'}
                            </p>
                            {identificationResult.recognitionDetails && (
                              <div className="mt-3 flex flex-col items-center">
                                <div className="relative">
                                  <img 
                                    src={identificationResult.recognitionDetails[recognitionImageIndex]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='}
                                    alt={`识别图像${recognitionImageIndex + 1}`}
                                    className="rounded-lg border border-red-200"
                                    style={{width: '200px', height: '200px', objectFit: 'cover'}}
                                    onError={(e) => {
                                      console.log('失败图像加载失败:', e.target.src)
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEyOCIgeT0iMTI4IiBzdHlslZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1fYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MjU2eDI1NjwvdGV4dD48L3N2Zz4='
                                    }}
                                  />
                                  <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                                    {identificationResult.recognitionDetails[recognitionImageIndex]?.predictedId}
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                    置信度: {Math.min(identificationResult.recognitionDetails[recognitionImageIndex]?.confidence * 100, 100).toFixed(1)}%
                                  </div>
                                  {/* 左右切换按钮 */}
                                  {identificationResult.recognitionDetails.length > 1 && (
                                    <>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setRecognitionImageIndex(prev => 
                                          prev === 0 ? identificationResult.recognitionDetails.length - 1 : prev - 1
                                        )}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all duration-200"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setRecognitionImageIndex(prev => 
                                          prev === identificationResult.recognitionDetails.length - 1 ? 0 : prev + 1
                                        )}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all duration-200"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </motion.button>
                                    </>
                                  )}
                                </div>
                                {/* 显示图像信息 */}
                                <div className="mt-3 text-center">
                                  <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded text-xs font-medium border shadow">
                                    {identificationResult.recognitionDetails[recognitionImageIndex]?.fileName || `图像${recognitionImageIndex + 1}`}
                                  </div>
                                  <div className="mt-2 flex items-center justify-center space-x-1">
                                    {identificationResult.recognitionDetails.map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 cursor-pointer ${
                                          idx === recognitionImageIndex ? 'bg-red-500' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        onClick={() => setRecognitionImageIndex(idx)}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {recognitionImageIndex + 1} / {identificationResult.recognitionDetails.length}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        </motion.div>
                      )
                    }
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  {aiVerificationResult && (
                    // AI验证结果显示（保留ai_verify模式的显示）
                    <div>AI验证结果</div>
                  )}
                </div>
              )}
            </div>

          </motion.div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default GaitDetection
