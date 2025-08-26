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

  // 应用启动时自动预加载模型
  useEffect(() => {
    const preloadModel = async () => {
      try {
        setModelLoadStatus('loading')
        console.log('🚀 应用启动，开始预加载AI模型...')
        
        await modelManager.preloadModel((progress) => {
          if (progress.fromCache) {
            console.log('✨ 使用缓存的模型，无需重新下载')
            setModelLoadStatus('cached')
          } else {
            setLoadProgress(progress.progress || 0)
          }
        })
        
        setModelLoadStatus('loaded')
        console.log('✅ AI模型预加载完成，可在所有页面使用')
      } catch (error) {
        console.error('❌ 模型预加载失败:', error)
        setModelLoadStatus('error')
      }
    }

    // 检查模型是否已加载
    if (!modelManager.isModelLoaded()) {
      preloadModel()
    } else {
      console.log('✨ 模型已在缓存中')
      setModelLoadStatus('cached')
    }
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
