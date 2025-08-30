import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('visits')
  const [realTimeData, setRealTimeData] = useState({
    totalUsers: 0,
    todayVisits: 0,
    successRate: 0,
    averageTime: 0
  })
  const [activityLog, setActivityLog] = useState([])
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [chartData, setChartData] = useState({
    visitTrend: { labels: [], datasets: [] },
    hourly: { labels: [], datasets: [] },
    accuracy: { labels: [], datasets: [] }
  })

  // 动态加载数据
  useEffect(() => {
    loadRealTimeData()
    loadActivityLog()
    loadChartData()
    
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        loadRealTimeData()
        loadActivityLog()
        loadChartData()
      }, 30000) // 30秒刷新一次
      
      return () => clearInterval(interval)
    }
  }, [isAutoRefresh, timeRange])

  const loadRealTimeData = () => {
    // 从localStorage加载人员数据
    const personnelData = JSON.parse(localStorage.getItem('personnelData') || '[]')
    const activityData = JSON.parse(localStorage.getItem('gaitActivityLog') || '[]')
    
    const today = new Date().toDateString()
    const todayActivities = activityData.filter(activity => 
      new Date(activity.timestamp).toDateString() === today
    )
    
    // 重新定义准确率计算：验证失败但使用同一ID图像时为判断失败，其他情况为成功
    const correctRecognitions = todayActivities.filter(activity => {
      // 成功验证的情况
      if (activity.result === 'success' || activity.result === 'time_restricted') {
        return true
      }
      
      // 验证失败的情况：检查是否使用的是同一ID的图像
      if (activity.result === 'failed' && activity.sourceImageIds && activity.sourceImageIds.length > 0) {
        // 如果使用的图像来自同一个ID，且验证失败，则认为是判断错误
        const uniqueImageIds = [...new Set(activity.sourceImageIds)]
        if (uniqueImageIds.length === 1) {
          // 使用的是同一ID的图像但验证失败，这是判断错误
          return false
        }
      }
      
      // 其他情况（包括使用不同 ID 图像的失败）都认为是正确的
      return true
    })
    
    const successRate = todayActivities.length > 0 
      ? (correctRecognitions.length / todayActivities.length * 100).toFixed(1)
      : 0
    
    const avgTime = todayActivities.length > 0
      ? (todayActivities.reduce((sum, activity) => sum + parseFloat(activity.duration || 6.5), 0) / todayActivities.length).toFixed(1)
      : 6.5

    setRealTimeData({
      totalUsers: personnelData.length,
      todayVisits: todayActivities.length,
      successRate: parseFloat(successRate),
      averageTime: parseFloat(avgTime)
    })
  }

  const loadActivityLog = () => {
    const activityData = JSON.parse(localStorage.getItem('gaitActivityLog') || '[]')
    const personnelData = JSON.parse(localStorage.getItem('personnelData') || '[]')
    const validUserNames = personnelData.map(user => user.name)
    
    // 过滤掉不存在于人员管理中的用户记录
    const validActivities = activityData.filter(activity => 
      validUserNames.includes(activity.userName) || activity.userName === '未知'
    )
    
    setActivityLog(validActivities.slice(0, 10)) // 显示最近10条有效记录
  }

  const loadChartData = () => {
    const activityData = JSON.parse(localStorage.getItem('gaitActivityLog') || '[]')
    const personnelData = JSON.parse(localStorage.getItem('personnelData') || '[]')
    const validUserNames = personnelData.map(user => user.name)
    
    // 过滤有效活动
    const validActivities = activityData.filter(activity => 
      validUserNames.includes(activity.userName) || activity.userName === '未知'
    )

    // 生成访问趋势数据
    const generateVisitTrendData = () => {
      const now = new Date()
      let labels = []
      let successData = []
      let failureData = []

      if (timeRange === 'week') {
        // 过去7天的数据
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const dateStr = date.toDateString()
          
          labels.push(date.toLocaleDateString('zh-CN', { weekday: 'short' }))
          
          const dayActivities = validActivities.filter(activity => 
            new Date(activity.timestamp).toDateString() === dateStr
          )
          
          const successful = dayActivities.filter(activity => activity.result === 'success').length
          const failed = dayActivities.filter(activity => activity.result === 'failure').length
          
          successData.push(successful)
          failureData.push(failed)
        }
      } else if (timeRange === 'month') {
        // 过去30天，按周分组
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now)
          weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)
          
          labels.push(`第${4-i}周`)
          
          const weekActivities = validActivities.filter(activity => {
            const activityDate = new Date(activity.timestamp)
            return activityDate >= weekStart && activityDate <= weekEnd
          })
          
          const successful = weekActivities.filter(activity => activity.result === 'success').length
          const failed = weekActivities.filter(activity => activity.result === 'failure').length
          
          successData.push(successful)
          failureData.push(failed)
        }
      }

      return {
        labels,
        datasets: [
          {
            label: '验证成功',
            data: successData,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: '验证失败',
            data: failureData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    }

    // 生成时段分布数据
    const generateHourlyData = () => {
      const hours = ['6-8时', '8-10时', '10-12时', '12-14时', '14-16时', '16-18时', '18-20时', '20-22时']
      const hourlyCount = new Array(8).fill(0)
      
      validActivities.forEach(activity => {
        const hour = new Date(activity.timestamp).getHours()
        if (hour >= 6 && hour < 8) hourlyCount[0]++
        else if (hour >= 8 && hour < 10) hourlyCount[1]++
        else if (hour >= 10 && hour < 12) hourlyCount[2]++
        else if (hour >= 12 && hour < 14) hourlyCount[3]++
        else if (hour >= 14 && hour < 16) hourlyCount[4]++
        else if (hour >= 16 && hour < 18) hourlyCount[5]++
        else if (hour >= 18 && hour < 20) hourlyCount[6]++
        else if (hour >= 20 && hour < 22) hourlyCount[7]++
      })

      return {
        labels: hours,
        datasets: [
          {
            label: '访问次数',
            data: hourlyCount,
            backgroundColor: 'rgba(14, 165, 233, 0.8)',
            borderColor: 'rgb(14, 165, 233)',
            borderWidth: 1
          }
        ]
      }
    }

    // 生成识别准确率数据
    const generateAccuracyData = () => {
      const successful = validActivities.filter(activity => activity.result === 'success').length
      const failed = validActivities.filter(activity => activity.result === 'failure').length
      const pending = validActivities.filter(activity => activity.result === 'pending').length || 0
      
      const total = successful + failed + pending
      
      if (total === 0) {
        return {
          labels: ['暂无数据'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['rgba(156, 163, 175, 0.8)'],
              borderColor: ['rgb(156, 163, 175)'],
              borderWidth: 1
            }
          ]
        }
      }

      return {
        labels: ['成功', '失败', '待定'].filter((_, index) => [successful, failed, pending][index] > 0),
        datasets: [
          {
            data: [successful, failed, pending].filter(count => count > 0),
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)', 
              'rgba(251, 146, 60, 0.8)'
            ].slice(0, [successful, failed, pending].filter(count => count > 0).length),
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(239, 68, 68)',
              'rgb(251, 146, 60)'
            ].slice(0, [successful, failed, pending].filter(count => count > 0).length),
            borderWidth: 1
          }
        ]
      }
    }

    setChartData({
      visitTrend: generateVisitTrendData(),
      hourly: generateHourlyData(),
      accuracy: generateAccuracyData()
    })
  }

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      statistics: realTimeData,
      activities: activityLog
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gate-system-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = [
    { 
      label: '今日访问', 
      value: realTimeData.todayVisits.toString(), 
      change: '+12%', 
      trend: 'up',
      icon: Eye
    },
    { 
      label: '注册用户', 
      value: realTimeData.totalUsers.toString(), 
      change: '在院', 
      trend: 'up',
      icon: Users
    },
    { 
      label: '识别准确率', 
      value: `${realTimeData.successRate}%`, 
      change: '+2.1%', 
      trend: 'up',
      icon: CheckCircle
    },
    { 
      label: '平均响应时间', 
      value: `${realTimeData.averageTime}s`, 
      change: '-0.3s', 
      trend: 'down',
      icon: Clock
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-6 shadow-xl border border-indigo-100/50 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              数据统计分析
            </h1>
            <p className="text-gray-600 mt-2 font-medium">智能化系统运行数据监控与分析平台</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            >
              <option value="day">今日</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">本年</option>
            </select>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 font-medium shadow-sm hover:shadow-md ${
                  isAutoRefresh 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border-2 border-green-200' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <Activity className={`h-4 w-4 ${isAutoRefresh ? 'animate-pulse' : ''}`} />
                {isAutoRefresh ? '实时监控' : '手动刷新'}
              </button>
              <button 
                onClick={exportReport}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <Download className="h-4 w-4" />
                导出报告
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const gradientColors = [
            'from-blue-50 to-blue-100 border-blue-200',
            'from-green-50 to-green-100 border-green-200', 
            'from-purple-50 to-purple-100 border-purple-200',
            'from-amber-50 to-amber-100 border-amber-200'
          ]
          const iconColors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-amber-600']
          const valueColors = [
            'from-blue-600 to-blue-700',
            'from-green-600 to-green-700',
            'from-purple-600 to-purple-700', 
            'from-amber-600 to-amber-700'
          ]
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${gradientColors[index]} rounded-2xl p-6 shadow-xl border-2 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-white/80 rounded-xl shadow-md`}>
                    <stat.icon className={`h-6 w-6 ${iconColors[index]}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label === '注册用户' ? '当前状态' : '较上期'}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : stat.trend === 'down'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <p className={`text-4xl font-bold bg-gradient-to-r ${valueColors[index]} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                {stat.trend !== 'neutral' && (
                  <div className={`p-2 rounded-xl ${
                    stat.trend === 'up' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 访问趋势 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300"
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            访问趋势
          </h3>
          {chartData.visitTrend.labels.length > 0 ? (
            <Line 
              data={chartData.visitTrend}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>暂无访问数据</p>
                <p className="text-sm text-gray-400">进行步态识别后将显示访问趋势</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* 时段分布 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300"
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            时段分布
          </h3>
          {chartData.hourly.labels.length > 0 ? (
            <Bar 
              data={chartData.hourly}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>暂无时段数据</p>
                <p className="text-sm text-gray-400">进行步态识别后将显示时段分布</p>
              </div>
            </div>
          )}
        </motion.div>

      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300"
      >
        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          最近活动记录
        </h3>
        <div className="overflow-x-auto bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-xl border border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100/80 to-blue-100/60 backdrop-blur-sm">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 border-b border-gray-200/50">时间</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 border-b border-gray-200/50">人员</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 border-b border-gray-200/50">事件</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 border-b border-gray-200/50">结果</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 border-b border-gray-200/50">耗时</th>
              </tr>
            </thead>
            <tbody className="bg-white/60 backdrop-blur-sm">
              {activityLog.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full">
                        <Activity className="h-12 w-12 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-600 mb-1">暂无活动记录</p>
                        <p className="text-sm text-gray-400">使用步态检测功能后将显示记录</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                activityLog.map((activity, index) => (
                  <motion.tr 
                    key={activity.id || index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-200/30 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(activity.timestamp).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {(activity.userName || '未知').charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{activity.userName || '未知'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-600">{activity.event || '门禁验证'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        activity.result === 'success' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                          : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                      }`}>
                        {activity.result === 'success' 
                          ? <CheckCircle className="h-3.5 w-3.5" /> 
                          : <XCircle className="h-3.5 w-3.5" />
                        }
                        {activity.result === 'success' ? '成功' : '失败'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                        <Clock className="h-3 w-3" />
                        {activity.duration || '6.5'}s
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default Statistics
