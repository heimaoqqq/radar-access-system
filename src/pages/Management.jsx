import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AddResidentForm from '../components/AddResidentForm'
import EditResidentForm from '../components/EditResidentForm'
import { ToastContainer, useToast } from '../components/Toast'
import { NoResidentsState } from '../components/EmptyState'
import { 
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Calendar,
  Phone,
  Mail,
  Home,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
  UserCheck
} from 'lucide-react'

const Management = () => {
  const { toasts, removeToast, showSuccess, showError } = useToast()
  
  // 使用localStorage持久化数据
  const getInitialResidents = () => {
    const saved = localStorage.getItem('personnelData')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      {
        id: 'ID_1',
        name: '张三',
        age: 78,
        gender: '男',
        room: '101',
        phone: '138****5678',
        email: 'zhang@example.com',
        status: 'in_facility',
        joinDate: '2024-01-15',
        visits: 245,
        lastVisit: '2024-12-20 14:30'
      },
      {
        id: 'ID_2', 
        name: '李四',
        age: 82,
        gender: '女',
        room: '102',
        phone: '139****8765',
        email: 'li@example.com',
        status: 'in_facility',
        joinDate: '2024-02-20',
        visits: 189,
        lastVisit: '2024-12-20 09:15'
      },
      {
        id: 'ID_3',
        name: '王五',
        age: 75,
        gender: '男',
        room: '103',
        phone: '137****4321',
        email: 'wang@example.com',
        status: 'out_facility',
        joinDate: '2024-03-10',
        visits: 156,
        lastVisit: '2024-12-18 16:45'
      }
    ]
  }

  const [residents, setResidents] = useState(getInitialResidents)

  // 持久化数据到localStorage，同步给步态检测和统计模块
  useEffect(() => {
    localStorage.setItem('personnelData', JSON.stringify(residents))
    // 触发storage事件，通知其他模块数据变更
    window.dispatchEvent(new Event('storage'))
  }, [residents])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedResident, setSelectedResident] = useState(null)
  const [editingResident, setEditingResident] = useState(null)
  const [deletingResident, setDeletingResident] = useState(null)
  const [statusChangingResident, setStatusChangingResident] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  
  // 编辑相关状态

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // 生成新的住户ID
  const generateNewId = () => {
    const existingIds = residents.map(resident => {
      const num = parseInt(resident.id.replace('ID_', ''))
      return num
    })
    
    // 找到最小的可用ID（1-10）
    for (let i = 1; i <= 10; i++) {
      if (!existingIds.includes(i)) {
        return `ID_${i}`
      }
    }
    return null // 无可用ID
  }

  // 处理新表单组件的提交
  const handleAddResident = (newResident) => {
    setResidents([...residents, newResident])
    setShowAddModal(false)
    showSuccess(`成功添加住户 ${newResident.name}`)
  }


  // 删除住户
  const handleDeleteResident = () => {
    const deletedName = deletingResident.name
    const updatedResidents = residents.filter(resident => resident.id !== deletingResident.id)
    setResidents(updatedResidents)
    setShowDeleteModal(false)
    setDeletingResident(null)
    showSuccess(`已删除住户 ${deletedName}`)
  }

  // 打开编辑模态框
  const openEditModal = (resident) => {
    setEditingResident(resident)
    setShowEditModal(true)
  }

  // 处理编辑提交
  const handleEditResident = (updatedResident) => {
    const updatedResidents = residents.map(resident => 
      resident.id === updatedResident.id ? updatedResident : resident
    )
    
    setResidents(updatedResidents)
    setShowEditModal(false)
    setEditingResident(null)
    showSuccess(`已更新住户 ${updatedResident.name} 的信息`)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingResident(null)
  }

  // 打开删除确认框
  const openDeleteModal = (resident) => {
    setDeletingResident(resident)
    setShowDeleteModal(true)
  }

  // 打开详情模态框
  const openDetailModal = (resident) => {
    setSelectedResident(resident)
    setShowDetailModal(true)
  }

  // 取消添加表单
  const handleCancelAdd = () => {
    setShowAddModal(false)
  }

  // 打开状态切换确认框
  const openStatusModal = (resident) => {
    setStatusChangingResident(resident)
    setShowStatusModal(true)
  }

  // 处理状态切换
  const handleStatusToggle = () => {
    const newStatus = statusChangingResident.status === 'in_facility' ? 'out_facility' : 'in_facility'
    const updatedResidents = residents.map(resident => 
      resident.id === statusChangingResident.id 
        ? { ...resident, status: newStatus }
        : resident
    )
    
    setResidents(updatedResidents)
    setShowStatusModal(false)
    setStatusChangingResident(null)
    
    const statusText = newStatus === 'in_facility' ? '在院' : '不在院'
    showSuccess(`已将 ${statusChangingResident.name} 的状态更新为：${statusText}`)
  }



  const DeleteConfirmModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowDeleteModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">删除住户</h3>
          <p className="text-sm text-gray-500 mb-6">
            确定要删除住户 <span className="font-medium">{deletingResident?.name}</span> 吗？
            <br />此操作不可恢复。
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleDeleteResident}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              确认删除
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  const StatusToggleModal = () => {
    if (!statusChangingResident) return null
    
    const currentStatus = statusChangingResident.status === 'in_facility'
    const newStatusText = currentStatus ? '不在院' : '在院'
    const currentStatusText = currentStatus ? '在院' : '不在院'
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowStatusModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl p-8 max-w-md w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
              currentStatus ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <UserCheck className={`h-6 w-6 ${
                currentStatus ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">更改住户状态</h3>
            <p className="text-sm text-gray-500 mb-6">
              确定要将 <span className="font-medium">{statusChangingResident.name}</span> 的状态
              <br />从 <span className="font-medium text-blue-600">{currentStatusText}</span> 更改为 <span className="font-medium text-green-600">{newStatusText}</span> 吗？
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleStatusToggle}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  currentStatus ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                确认更改
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const DetailModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowDetailModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">住户详情</h3>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        {selectedResident && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {selectedResident.name[0]}
                </span>
              </div>
              <div>
                <h4 className="text-xl font-semibold">{selectedResident.name}</h4>
                <p className="text-gray-500">{selectedResident.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">年龄</p>
                <p className="text-lg font-semibold">{selectedResident.age}岁</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">性别</p>
                <p className="text-lg font-semibold">{selectedResident.gender}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">房间号</p>
                <p className="text-lg font-semibold">{selectedResident.room}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">状态</p>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  selectedResident.status === 'in_facility' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedResident.status === 'in_facility' ? '在院' : '不在院'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">联系电话</p>
                <p className="font-medium">{selectedResident.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">邮箱地址</p>
                <p className="font-medium">{selectedResident.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">入住日期</p>
                <p className="font-medium">{selectedResident.joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">访问次数</p>
                <p className="font-medium">{selectedResident.visits}次</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">最近访问</p>
                <p className="font-medium">{selectedResident.lastVisit}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-6 shadow-xl border border-blue-100/50 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              人员管理系统
            </h1>
            <p className="text-gray-600 mt-2 font-medium">智能化管理养老院住户信息与访问权限</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md">
              <Upload className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-700">导入</span>
            </button>
            <button className="px-4 py-2 border-2 border-green-200 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-green-50 hover:border-green-300 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md">
              <Download className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">导出</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <UserPlus className="h-4 w-4" />
              <span className="font-medium">添加住户</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">总人数</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{residents.length}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Active Residents</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-green-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">在院人数</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {residents.filter(r => r.status === 'in_facility').length}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">Present Today</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-amber-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">今日访问</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">42</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Daily Access</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl">
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">平均年龄</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {Math.round(residents.reduce((acc, r) => acc + r.age, 0) / residents.length)}
              </p>
              <p className="text-xs text-purple-600 font-medium mt-1">Average Age</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/50"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名或ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filterStatus === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:shadow-md'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('in_facility')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filterStatus === 'in_facility' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:shadow-md'
              }`}
            >
              在院
            </button>
            <button
              onClick={() => setFilterStatus('out_facility')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filterStatus === 'out_facility' 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:shadow-md'
              }`}
            >
              不在院
            </button>
          </div>
        </div>
      </motion.div>

      {/* 住户列表或空状态 */}
      {filteredResidents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm">
          {residents.length === 0 ? (
            <NoResidentsState onAddClick={() => setShowAddModal(true)} />
          ) : (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的住户</h3>
              <p className="text-gray-500">尝试调整搜索条件或筛选选项</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100/50">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住户信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年龄/性别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">访问记录</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResidents.map((resident, index) => (
                <motion.tr
                  key={resident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetailModal(resident)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {resident.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                        <div className="text-sm text-gray-500">{resident.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-900">
                      <Home className="h-4 w-4 mr-2 text-gray-400" />
                      {resident.room}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resident.age}岁 / {resident.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resident.phone}</div>
                    <div className="text-xs text-gray-500">{resident.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resident.visits}次</div>
                    <div className="text-xs text-gray-500">最近: {resident.lastVisit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resident.status === 'in_facility' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {resident.status === 'in_facility' ? '在院' : '不在院'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetailModal(resident)
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="查看详情"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openStatusModal(resident)
                        }}
                        className={`p-1 rounded transition-colors ${
                          resident.status === 'in_facility' 
                            ? 'text-green-600 hover:text-green-900 hover:bg-green-50' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        title={`切换为${resident.status === 'in_facility' ? '不在院' : '在院'}`}
                      >
                        {resident.status === 'in_facility' ? 
                          <ToggleRight className="h-4 w-4" /> : 
                          <ToggleLeft className="h-4 w-4" />
                        }
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(resident)
                        }}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50 transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(resident)
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddResidentForm 
          onSubmit={handleAddResident}
          onCancel={handleCancelAdd}
          residents={residents}
        />
      )}
      {showEditModal && editingResident && (
        <EditResidentForm 
          resident={editingResident}
          onSubmit={handleEditResident}
          onCancel={handleCancelEdit}
        />
      )}
      {showDeleteModal && <DeleteConfirmModal />}
      {showDetailModal && <DetailModal />}
      {showStatusModal && <StatusToggleModal />}
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Management
