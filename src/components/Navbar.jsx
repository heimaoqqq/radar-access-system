import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  Radar, 
  Users, 
  BarChart3, 
  Info, 
  Menu, 
  X,
  Shield,
  Activity,
  TrendingUp,
  Trophy
} from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/detection', label: '步态检测', icon: Radar },
    { path: '/management', label: '人员管理', icon: Users },
    { path: '/statistics', label: '数据统计', icon: BarChart3 },
    { path: '/about', label: '关于', icon: Info },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary-600" />
              <div className="absolute inset-0 animate-pulse">
                <Shield className="h-8 w-8 text-primary-400 opacity-50" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">智能门禁系统</h1>
              <p className="text-xs text-gray-500">雷达步态识别技术</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === path 
                    ? 'bg-primary-50 shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`flex items-center space-x-2 ${
                  location.pathname === path 
                    ? 'text-primary-600' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}>
                  <Icon className={`h-4 w-4 transition-transform duration-200 ${
                    location.pathname === path ? 'scale-110' : ''
                  }`} />
                  <span className="font-medium">{label}</span>
                </div>
                {location.pathname === path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t"
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  location.pathname === path 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
