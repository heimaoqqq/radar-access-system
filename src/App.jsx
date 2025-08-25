import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import GaitDetection from './pages/GaitDetection'
import Management from './pages/Management'
import Statistics from './pages/Statistics'
import About from './pages/About'

// 滚动到顶部组件
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {

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
