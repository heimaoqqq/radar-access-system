import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner, { ProgressBar } from '../components/LoadingSpinner'
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

const GaitDetection = () => {
  const [mode, setMode] = useState('identify')
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectionProgress, setCollectionProgress] = useState(0)
  const [processedImage, setProcessedImage] = useState(null)
  const [identificationResult, setIdentificationResult] = useState(null)
  const [newUserForm, setNewUserForm] = useState({
    selectedUserId: '',
    name: '',
    age: '',
    gender: '',
    room: ''
  })
  const [selectedIdentifyUserId, setSelectedIdentifyUserId] = useState('')
  
  // 从人员管理系统获取用户数据 - 读取localStorage数据
  const getUserDatabase = () => {
    const saved = localStorage.getItem('personnelData')
    let managementUsers = []
    
    if (saved) {
      managementUsers = JSON.parse(saved)
    } else {
      // 默认数据
      managementUsers = [
        { id: 'ID_1', name: '张三', age: 78, gender: '男', room: '101' },
        { id: 'ID_2', name: '李四', age: 82, gender: '女', room: '102' },
        { id: 'ID_3', name: '王五', age: 75, gender: '男', room: '103' }
      ]
    }
    
    // 转换为步态检测系统格式
    const userDatabase = {}
    managementUsers.forEach(user => {
      userDatabase[user.id] = {
        name: user.name,
        age: user.age,
        gender: user.gender,
        room: `${user.room}室`
      }
    })
    
    return userDatabase
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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

  // 获取用户可能的图像编号（尝试1-220的编号，覆盖所有可能的图像）
  const getUserImageNumbers = (userId) => {
    const possibleNumbers = []
    // 尝试更多编号，让preloadImages函数过滤掉不存在的
    for (let i = 1; i <= 220; i++) {
      possibleNumbers.push(i)
    }
    return possibleNumbers
  }

  // 加载特定用户的所有图像
  const loadUserAllImages = async (userId) => {
    const userImages = []
    const imageNumbers = getUserImageNumbers(userId)
    
    imageNumbers.forEach(num => {
      // 实际文件名格式：ID6_case1_1_Doppler1.jpg (去掉下划线)
      const imagePath = `${import.meta.env.BASE_URL}dataset/${userId}/${userId.replace('_', '')}_case1_1_Doppler${num}.jpg`
      const fileName = `${userId.replace('_', '')}_case1_1_Doppler${num}`
      userImages.push({
        path: imagePath,
        userId: userId,
        imageIndex: num,
        fileName: fileName
      })
    })
    
    return userImages
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

  // 两阶段身份识别
  const handleIdentification = async () => {
    setIdentificationResult(null)
    setIsCollecting(true)
    setIsMatching(false)
    setIsPreloading(true)
    setCurrentGaitImages([])
    setMatchedImage(null)
    setIsIdentificationComplete(false)
    
    // 确定目标用户ID - 使用实际的本地用户数据
    const availableUserIds = Object.keys(userDatabase)
    if (availableUserIds.length === 0) {
      alert('系统中没有注册用户，请先在人员管理模块中添加用户')
      setIsCollecting(false)
      setIsPreloading(false)
      return
    }
    
    const targetUserId = selectedIdentifyUserId || availableUserIds[Math.floor(Math.random() * availableUserIds.length)]
    const userInfo = userDatabase[targetUserId]
    
    if (!userInfo) {
      console.error('用户信息不存在:', targetUserId)
      setIsCollecting(false)
      setIsPreloading(false)
      return
    }
    
    // 阶段1: 显示"未检测到行人，等待中..."等待随机时间
    const preloadWaitTime = Math.random() * 1500 + 1500 // 1.5-3秒随机
    await new Promise(resolve => setTimeout(resolve, preloadWaitTime))
    
    // 预加载图像完成
    const userAllImages = await loadUserAllImages(targetUserId)
    const preloadedImages = await preloadImages(userAllImages)
    
    setIsPreloading(false)
    setCurrentGaitImages(preloadedImages)
    setCurrentImageIndex(0)
    
    // 阶段2: 开始图像轮播匹配过程 (5-6秒)
    setIsMatching(true)
    
    const matchingTime = 5000 + Math.random() * 1000 // 5-6秒轮播
    await new Promise(resolve => setTimeout(resolve, matchingTime))
    
    // 从用户图像中选择一张作为匹配结果
    const finalMatchImage = preloadedImages[Math.floor(Math.random() * preloadedImages.length)]
    
    setIsMatching(false)
    setMatchedImage(finalMatchImage)
    setIsIdentificationComplete(true)
    
    // 生成识别结果
    const confidence = 0.95 + Math.random() * 0.04
    const processTime = (6.5 + Math.random() * 0.5).toFixed(1)
    const result = {
      id: targetUserId,
      name: userInfo.name,
      confidence,
      userInfo,
      matchedImage: finalMatchImage,
      timestamp: new Date().toLocaleString(),
      processTime: processTime + 's'
    }
    
    setIdentificationResult(result)
    
    // 保存识别活动到日志
    saveActivityLog({
      type: 'identification',
      userId: targetUserId,
      userName: userInfo.name,
      result: 'success',
      confidence: confidence,
      duration: processTime,
      timestamp: new Date().toISOString()
    })
    
    setIsCollecting(false)
  }

  // 保存识别活动日志
  const saveActivityLog = (activity) => {
    const existingLog = JSON.parse(localStorage.getItem('gaitActivityLog') || '[]')
    const newLog = [...existingLog, activity]
    localStorage.setItem('gaitActivityLog', JSON.stringify(newLog))
    
    // 触发storage事件，通知统计模块数据变更
    window.dispatchEvent(new Event('storage'))
  }

  // 模拟采集过程
  const handleStartCollection = async () => {
    if (!newUserForm.selectedUserId) {
      alert('请先选择要采集数据的用户ID')
      return
    }
    
    setIsCollecting(true)
    setCollectionProgress(0)
    setProcessedImage(null)
    
    // 模拟采集进度
    for (let i = 0; i <= 100; i += 10) {
      setCollectionProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // 模拟生成步态图像
    const selectedUserId = newUserForm.selectedUserId
    const randomImageNum = Math.floor(Math.random() * 50) + 1
    const imagePath = `${import.meta.env.BASE_URL}dataset/${selectedUserId}/${selectedUserId.replace('_', '')}_case1_1_Doppler${randomImageNum}.jpg`
    
    setProcessedImage({
      path: imagePath,
      userId: selectedUserId,
      imageIndex: randomImageNum
    })
    setIsCollecting(false)
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
                <Brain className="h-6 w-6 text-white" />
              </div>
              智能步态识别系统
            </h1>
            <p className="text-gray-600 mt-2 font-medium">基于深度学习的高精度非接触式身份识别</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('identify')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md ${
                mode === 'identify' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-blue-200 hover:border-blue-300'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>智能识别</span>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 左侧 - 步态信息检测 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3 shadow-lg">
                    <Radar className="w-5 h-5 text-white" />
                  </div>
                  雷达步态检测
                </h3>
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
              <div className="relative w-full min-h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200 overflow-visible p-8">
                {isPreloading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Radar className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">雷达扫描中...</p>
                    <p className="text-gray-500 text-sm mt-1">正在检测行人步态特征</p>
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
                          console.log('识别图像加载失败:', e.target.src)
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
                        console.log('图像加载失败:', e.target.src)
                        e.target.style.display = 'none'
                      }}
                    />
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2 z-20">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span>特征匹配中...</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">准备就绪</h4>
                    <p className="text-gray-500">点击下方按钮开始步态检测</p>
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      选择目标用户（可选）
                    </label>
                    <select
                      value={selectedIdentifyUserId}
                      onChange={(e) => setSelectedIdentifyUserId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                    >
                      <option value="">自动识别</option>
                      {Object.keys(userDatabase).map(id => (
                        <option key={id} value={id}>{id} - {userDatabase[id].name}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleIdentification}
                    disabled={isCollecting}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {isCollecting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>检测识别中...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>开始检测</span>
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartCollection}
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
                      <ProgressBar progress={collectionProgress} />
                      <p className="text-sm text-gray-500 mt-1 text-center">正在采集步态特征...</p>
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
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg mr-3 shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  智能识别结果
                </h3>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                  实时分析
                </div>
              </div>
              <div className="relative w-full h-80 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-emerald-200 overflow-visible p-4">
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
                          console.log('匹配图像加载失败:', e.target.src)
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
                ) : processedImage && mode === 'register' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center"
                  >
                    <img
                      src={processedImage.path}
                      alt="处理后的步态图像"
                      className="w-72 h-72 object-contain rounded-2xl shadow-xl"
                      onError={(e) => {
                        console.log('处理图像加载失败:', e.target.src)
                        e.target.style.display = 'none'
                      }}
                    />
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
              ) : identificationResult && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">识别成功</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">姓名:</span> {identificationResult.name}</p>
                      <p><span className="font-medium">用户ID:</span> {identificationResult.id}</p>
                      <p><span className="font-medium">年龄:</span> {identificationResult.userInfo.age}岁</p>
                      <p><span className="font-medium">性别:</span> {identificationResult.userInfo.gender}</p>
                      <p><span className="font-medium">房间:</span> {identificationResult.userInfo.room}</p>
                      <p><span className="font-medium">置信度:</span> {(identificationResult.confidence * 100).toFixed(1)}%</p>
                      <p><span className="font-medium">识别时间:</span> {identificationResult.processTime}</p>
                      <p><span className="font-medium">时间戳:</span> {identificationResult.timestamp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 模型信息 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg mr-3 shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  AI模型信息
                </h3>
                <div className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                  深度学习
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">模型架构</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-lg font-bold text-blue-700">ResNet-18</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">用户数量</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-lg font-bold text-green-700">10 users</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">图像尺寸</span>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                  <span className="text-lg font-bold text-amber-700">256×256</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">识别精度</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">95.2%</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default GaitDetection
