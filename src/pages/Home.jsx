import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Radar, 
  Users, 
  BarChart3, 
  CheckCircle,
  Clock,
  Lock,
  Activity,
  Brain,
  Heart,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  Star
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: '无感交互',
      description: '老人只要走到门前，门就能识别并开启，适合养老场景',
      color: 'text-pink-600',
      gradient: 'from-pink-500/10 to-rose-500/10',
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600'
    },
    {
      icon: Eye,
      title: '隐私安全',
      description: '不同于人脸识别，不涉及图像存储，充分保护用户隐私',
      color: 'text-blue-600',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      icon: Shield,
      title: '鲁棒性强',
      description: '步态特征不易伪造，不受衣着、发型变化影响',
      color: 'text-purple-600',
      gradient: 'from-purple-500/10 to-indigo-500/10',
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600'
    },
    {
      icon: Activity,
      title: '真实环境',
      description: '非受控自由行走，户外环境测试，更贴近真实使用场景',
      color: 'text-emerald-600',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    }
  ]

  const advantages = [
    { icon: Brain, text: '域适应算法', desc: '无需大量人工标注，部分未标记数据即可精确识别', color: 'from-violet-500 to-purple-600' },
    { icon: Sparkles, text: '养老场景优化', desc: '专为养老院老人行动特点设计，支持辅助器械', color: 'from-pink-500 to-rose-600' },
    { icon: Zap, text: '高效学习', desc: '相较于有监督学习，解决人工标注困难问题', color: 'from-green-500 to-emerald-600' },
    { icon: CheckCircle, text: '真实数据', desc: '基于非受控环境数据训练，更贴近实际使用场景', color: 'from-blue-500 to-indigo-600' }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-16 shadow-2xl"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm font-medium">新一代智能门禁解决方案</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-8 leading-tight">
              基于<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">雷达步态识别</span>的<br />
              养老院智能门禁系统
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-10 text-slate-200 max-w-3xl leading-relaxed"
          >
            运用先进的毫米波雷达技术和深度学习算法，为养老院提供
            <span className="text-cyan-300 font-semibold"> 安全、便捷、人性化 </span>
            的智能门禁解决方案
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-6"
          >
            <Link to="/management" className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-300">
              <span className="flex items-center gap-3">
                <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                进入系统
              </span>
            </Link>
            <Link to="/about" className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <span className="flex items-center gap-3">
                了解更多 
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </div>
        
        {/* Enhanced Animated Elements */}
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-20">
          <div className="relative w-80 h-80">
            <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-cyan-400 to-blue-500 animate-ping"></div>
            <div className="absolute inset-6 rounded-full border-4 border-gradient-to-r from-blue-400 to-indigo-500 animate-ping" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute inset-12 rounded-full border-4 border-gradient-to-r from-indigo-400 to-purple-500 animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute inset-20 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-600/30 animate-pulse"></div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-40 right-40 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-40 w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </motion.section>

      {/* Features Grid */}
      <section>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-semibold">核心功能</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            领先的技术特点
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            集成最新的人工智能技术，为养老院提供全方位的智能化管理解决方案
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-100/50 hover:scale-105 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" 
                   style={{background: `linear-gradient(135deg, ${feature.gradient.replace('from-', '').replace('to-', '').replace('/10', '/5').split(' ').join(', ')})`}}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">{feature.description}</p>
              </div>
              
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Star className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Advantages */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 rounded-3xl p-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative z-10"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            技术优势
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {advantages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group flex flex-col items-center text-center p-6 hover:bg-white/80 rounded-2xl transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <item.icon className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-lg text-gray-800 group-hover:text-gray-900 mb-2">{item.text}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-12 text-gray-800"
        >
          快速开始
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/detection" className="group block">
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-8 text-white hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <Radar className="h-12 w-12 mb-6 group-hover:rotate-12 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-3">步态检测</h3>
                <p className="text-blue-100 mb-6 leading-relaxed">启动雷达检测系统进行身份验证</p>
                <span className="inline-flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                  进入检测 <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/management" className="group block">
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white hover:shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <Users className="h-12 w-12 mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-3">人员管理</h3>
                <p className="text-emerald-100 mb-6 leading-relaxed">管理住户信息和访问权限</p>
                <span className="inline-flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                  管理人员 <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/statistics" className="group block">
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 text-white hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <BarChart3 className="h-12 w-12 mb-6 group-hover:rotate-6 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-3">数据统计</h3>
                <p className="text-purple-100 mb-6 leading-relaxed">查看访问记录和统计分析</p>
                <span className="inline-flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                  查看统计 <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
