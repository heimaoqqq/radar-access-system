import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import GaitDetection from './pages/GaitDetection'
import Management from './pages/Management'
import Statistics from './pages/Statistics'
import About from './pages/About'
import modelManager from './utils/modelManager'

// 滚动到顶部组件
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const [modelLoadStatus, setModelLoadStatus] = useState('idle')
  const [loadProgress, setLoadProgress] = useState(0)

  // 应用启动时立即开始下载模型
  useEffect(() => {
    console.log('🚀 App 组件启动，立即开始模型下载...')
    
    // 直接启动下载，不等待任何检查
    const startDownload = async () => {
      try {
        setModelLoadStatus('loading')
        const result = await modelManager.preloadModel()
        if (result) {
          setModelLoadStatus('loaded')
          console.log('✅ 模型加载成功')
        } else {
          setModelLoadStatus('error')
        }
      } catch (error) {
        console.error('❌ 模型加载失败:', error)
        setModelLoadStatus('error')
      }
    }
    
    // 不管是否已加载，都立即启动
    startDownload()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ScrollToTop />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detection" element={<GaitDetection />} />
          <Route path="/management" element={<Management />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
