import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Radar,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
  Activity,
  Zap
} from 'lucide-react'
import Radar3D from '../components/Radar3D'
import DataSimulator from '../utils/dataSimulator'

const Detection = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState(null)
  const [detectionLog, setDetectionLog] = useState([])
  const [radarData, setRadarData] = useState(null)
  const simulator = new DataSimulator()

  // Update radar data continuously
  useEffect(() => {
    const radarInterval = setInterval(() => {
      setRadarData(simulator.generateRadarData())
    }, 100)
    
    return () => clearInterval(radarInterval)
  }, [])

  const startScan = () => {
    setIsScanning(true)
    setScanProgress(0)
    setScanResult(null)

    // Simulate scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          completeScanner()
          return 100
        }
        return prev + 100/70 // Complete in ~7 seconds
      })
    }, 100)
  }

  const completeScanner = () => {
    setTimeout(() => {
      const mockResults = [
        { name: '张三', id: 'R001', confidence: 98, authorized: true },
        { name: '李四', id: 'R002', confidence: 95, authorized: true },
        { name: '未知人员', id: null, confidence: 45, authorized: false }
      ]
      const result = mockResults[Math.floor(Math.random() * mockResults.length)]
      
      setScanResult(result)
      setIsScanning(false)
      
      // Add to log
      setDetectionLog(prev => [{
        ...result,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      }, ...prev].slice(0, 10))
    }, 500)
  }

  const resetScanner = () => {
    setScanResult(null)
    setScanProgress(0)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">雷达步态检测系统</h1>
        <p className="text-gray-600">基于深度学习的非接触式身份识别</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Radar Display */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Radar className="h-6 w-6 text-primary-600" />
                雷达检测区
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600">系统就绪</span>
              </div>
            </div>

            {/* 3D Radar Visualization */}
            <div className="relative h-96 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden">
              <Radar3D data={radarData} />

              {/* Status overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur rounded-lg p-4">
                  <div className="flex justify-between items-center text-green-400 text-sm font-mono">
                    <span>状态: {isScanning ? '扫描中' : '待机'}</span>
                    <span>信号强度: {isScanning ? Math.floor(scanProgress) : 0}%</span>
                  </div>
                  {isScanning && (
                    <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={startScan}
                disabled={isScanning}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isScanning 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    检测中 ({Math.floor(scanProgress)}%)
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    开始检测
                  </>
                )}
              </button>
              
              {scanResult && (
                <button
                  onClick={resetScanner}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  重置
                </button>
              )}
            </div>
          </motion.div>

          {/* Result Display */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <div className={`card border-2 ${
                  scanResult.authorized 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {scanResult.authorized ? (
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      ) : (
                        <XCircle className="h-12 w-12 text-red-600" />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold">
                          {scanResult.authorized ? '身份验证成功' : '身份验证失败'}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {scanResult.name} {scanResult.id && `(${scanResult.id})`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">置信度</p>
                      <p className="text-3xl font-bold text-gray-800">{scanResult.confidence}%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* System Status */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              系统状态
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">雷达模块</span>
                <span className="text-green-600 font-medium">正常</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">AI引擎</span>
                <span className="text-green-600 font-medium">就绪</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">数据库连接</span>
                <span className="text-green-600 font-medium">已连接</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">检测时间</span>
                <span className="font-medium">6-7秒</span>
              </div>
            </div>
          </motion.div>

          {/* Detection Log */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              最近检测记录
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detectionLog.length > 0 ? (
                detectionLog.map((log, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {log.authorized ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{log.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{log.time}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      置信度: {log.confidence}%
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">暂无检测记录</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Detection
