import React from 'react'
import { motion } from 'framer-motion'
import { 
  Info,
  Target,
  Cpu,
  Database,
  Zap,
  Shield,
  Award,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Heart,
  Lock,
  Activity,
  Brain,
  Sparkles,
  Eye,
  UserCheck
} from 'lucide-react'

const About = () => {
  const techStack = [
    { name: 'ResNet-18', desc: '深度学习网络架构', icon: Cpu },
    { name: '毫米波雷达', desc: '77GHz FMCW雷达', icon: Zap },
    { name: '域适应算法', desc: '半监督学习技术', icon: Brain },
    { name: 'React', desc: '前端框架', icon: Shield }
  ]

  const advantages = [
    {
      icon: Heart,
      title: '无感交互',
      desc: '老人只要走到门前，门就能自动识别并开启，无需任何操作'
    },
    {
      icon: Lock,
      title: '隐私安全',
      desc: '不同于人脸识别，不涉及图像存储，充分保护用户隐私'
    },
    {
      icon: Shield,
      title: '鲁棒性强',
      desc: '步态特征不易伪造，不受衣着、发型变化影响'
    },
    {
      icon: Activity,
      title: '适老化设计',
      desc: '专为养老院场景优化，充分考虑老年人行动特点'
    }
  ]

  const projectFeatures = [
    {
      title: '养老场景深度结合',
      icon: Heart,
      points: [
        '针对老年人步态特征优化算法',
        '支持助行器、拐杖等辅助设备',
        '考虑老年人行动缓慢特点',
        '紧急情况自动报警'
      ]
    },
    {
      title: '先进的域适应技术',
      icon: Brain,
      points: [
        '解决人工标注困难问题',
        '利用未标记数据提升性能',
        '相比纯监督学习降低成本',
        '持续自适应优化'
      ]
    },
    {
      title: '真实场景数据',
      icon: Database,
      points: [
        '非受控环境数据采集',
        '支持自由行走模式',
        '适应户外复杂环境',
        '更符合实际落地要求'
      ]
    }
  ]

  const milestones = [
    { date: '2024.01', title: '项目立项', desc: '确定技术方案和实施路径' },
    { date: '2024.03', title: '数据采集', desc: '完成10类不同步态数据收集' },
    { date: '2024.06', title: '模型训练', desc: 'ResNet-18网络训练，准确率达95%' },
    { date: '2024.09', title: '域适应优化', desc: '引入半监督学习提升泛化能力' },
    { date: '2024.12', title: '部署上线', desc: '养老院试点运行' }
  ]

  const comparisonData = [
    { method: '人脸识别', privacy: '低', robust: '中', elderly: '低', cost: '高' },
    { method: '指纹识别', privacy: '中', robust: '高', elderly: '低', cost: '中' },
    { method: '虹膜识别', privacy: '中', robust: '高', elderly: '低', cost: '高' },
    { method: '步态识别', privacy: '高', robust: '高', elderly: '高', cost: '中' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center py-16 px-8 bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20"
          >
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600 font-semibold">智能门禁系统</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
            关于项目
          </h1>
          
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            基于<span className="font-semibold text-blue-600">雷达步态识别</span>的养老院智能门禁系统，
            运用<span className="font-semibold text-indigo-600">深度学习</span>和<span className="font-semibold text-purple-600">域适应技术</span>，
            为养老院提供安全、便捷、人性化的智能化解决方案
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 mt-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              95%+ 识别准确率
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              隐私安全保护
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              <Heart className="h-4 w-4" />
              适老化设计
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Project Vision */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-3xl p-10 overflow-hidden shadow-2xl"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Target className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold">项目愿景</h2>
          </div>
          <p className="text-xl leading-relaxed mb-6">
            让科技服务老年人生活，通过<span className="font-bold text-blue-200">非侵入式</span>的智能识别技术，
            为养老院创造更安全、更便捷的生活环境。我们致力于用<span className="font-bold text-indigo-200">AI技术</span>解决养老场景中的实际问题，
            让每一位老人都能享受到科技带来的<span className="font-bold text-purple-200">温暖关怀</span>。
          </p>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Eye className="h-5 w-5" />
              <span className="font-medium">智能识别</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <UserCheck className="h-5 w-5" />
              <span className="font-medium">精准验证</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Heart className="h-5 w-5" />
              <span className="font-medium">人文关怀</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advantages */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            核心优势
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            四大核心优势，构建全面的智能门禁解决方案
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
              
              {/* Decorative element */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary-400 rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">识别方式对比</h3>
          <p className="text-gray-600">全方位对比不同识别技术的特点与优势</p>
        </div>
        
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-lg font-bold text-gray-800">识别方式</th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-800">隐私保护</th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-800">鲁棒性</th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-800">适老性</th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-800">成本</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <motion.tr 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      item.method === '步态识别' ? 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200' : ''
                    }`}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-800">{item.method}</span>
                        {item.method === '步态识别' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-bold rounded-full shadow-lg">
                            <Award className="h-3 w-3" />
                            推荐
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                        item.privacy === '高' ? 'bg-green-100 text-green-800 border border-green-200' :
                        item.privacy === '中' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {item.privacy}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                        item.robust === '高' ? 'bg-green-100 text-green-800 border border-green-200' :
                        item.robust === '中' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :  
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {item.robust}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                        item.elderly === '高' ? 'bg-green-100 text-green-800 border border-green-200' :
                        item.elderly === '中' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {item.elderly}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                        item.cost === '低' ? 'bg-green-100 text-green-800 border border-green-200' :
                        item.cost === '中' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {item.cost}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Project Features */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            项目特色
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            三大核心特色，打造专业的步态识别解决方案
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {projectFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.15 }}
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-primary-200/30 to-blue-200/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>
                
                <ul className="space-y-4">
                  {feature.points.map((point, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.15 + idx * 0.05 }}
                      className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                        {point}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">核心技术栈</h3>
          <p className="text-gray-600">基于前沿技术构建的智能识别系统</p>
        </div>
        
        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="group relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <tech.icon className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-primary-700 transition-colors">
                    {tech.name}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
                
                {/* Decorative element */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-primary-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">项目里程碑</h3>
          <p className="text-gray-600">见证项目发展的每一个重要时刻</p>
        </div>
        
        <div className="p-8">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 via-primary-500 to-primary-600 rounded-full"></div>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + 0.1 * index }}
                className="relative flex items-start mb-10 last:mb-0 group"
              >
                <div className="absolute left-8 w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full transform -translate-x-1/2 shadow-lg border-4 border-white group-hover:scale-125 transition-transform duration-300">
                  <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-30"></div>
                </div>
                
                <div className="ml-20 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 border border-gray-100 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-full shadow-sm">
                      {milestone.date}
                    </span>
                    <h4 className="text-xl font-bold text-gray-800 group-hover:text-primary-700 transition-colors">
                      {milestone.title}
                    </h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-3xl p-12 overflow-hidden shadow-2xl"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg border border-white/20"
          >
            <Users className="h-6 w-6" />
            <span className="font-semibold">专业团队</span>
          </motion.div>
          
          <h3 className="text-4xl font-bold mb-6">项目团队</h3>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="flex justify-center items-center gap-8 mb-8"
          >
            <div className="group flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Users className="h-10 w-10" />
              </div>
              <span className="text-sm font-medium opacity-90">AI研究员</span>
            </div>
            
            <div className="group flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <GraduationCap className="h-10 w-10" />
              </div>
              <span className="text-sm font-medium opacity-90">技术专家</span>
            </div>
            
            <div className="group flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Briefcase className="h-10 w-10" />
              </div>
              <span className="text-sm font-medium opacity-90">行业顾问</span>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
            className="text-xl leading-relaxed max-w-4xl mx-auto mb-6"
          >
            由<span className="font-bold text-blue-200">资深AI研究人员</span>、<span className="font-bold text-indigo-200">软件工程师</span>和<span className="font-bold text-purple-200">养老行业专家</span>组成的跨学科团队，
            致力于将前沿技术应用于养老服务领域，创造更美好的老年生活。
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Brain className="h-5 w-5" />
              <span className="font-medium">深度学习</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Activity className="h-5 w-5" />
              <span className="font-medium">信号处理</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Heart className="h-5 w-5" />
              <span className="font-medium">适老化设计</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default About
