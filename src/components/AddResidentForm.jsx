import React, { useState } from 'react'
import { motion } from 'framer-motion'

const AddResidentForm = ({ onSubmit, onCancel, residents }) => {
  const [formState, setFormState] = useState({
    name: '',
    age: '',
    gender: '男',
    room: '',
    phone: '',
    email: '',
    type: 'resident',
    position: '住户'
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formState.name.trim()) {
      newErrors.name = '姓名不能为空'
    }
    
    if (!formState.age || formState.age < 1 || formState.age > 120) {
      newErrors.age = '请输入有效年龄（1-120）'
    }
    
    if (!formState.room.trim()) {
      newErrors.room = '房间号不能为空'
    }
    
    if (!formState.phone.trim()) {
      newErrors.phone = '联系电话不能为空'
    } else if (!/^1[3-9]\d{9}$/.test(formState.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = '请输入有效的手机号码'
    }
    
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    if (!formState.position.trim()) {
      newErrors.position = '信息不能为空'
    }

    return newErrors
  }

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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 检查人数限制
    if (residents.length >= 10) {
      setErrors({ general: '最多只能添加10位住户' })
      return
    }
    
    // 验证表单
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // 生成新ID
    const newId = generateNewId()
    if (!newId) {
      setErrors({ general: '无可用的用户ID' })
      return
    }

    // 创建新住户对象
    const newResident = {
      id: newId,
      name: formState.name,
      age: parseInt(formState.age),
      gender: formState.gender,
      room: formState.room,
      phone: formState.phone,
      email: formState.email,
      type: formState.type,
      position: formState.position,
      status: 'in_facility',
      joinDate: new Date().toISOString().split('T')[0],
      visits: 0,
      lastVisit: '-'
    }

    // 调用父组件的提交处理函数
    onSubmit(newResident)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-6">添加新人员</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {errors.general}
            </div>
          )}
          
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              姓名<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请输入姓名"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* 人员类型 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              人员类型<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formState.type}
              onChange={(e) => {
                const newType = e.target.value
                handleInputChange('type', newType)
                // 根据类型自动设置职务
                if (newType === 'resident') {
                  handleInputChange('position', '住户')
                } else {
                  handleInputChange('position', '')
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="resident">住户</option>
              <option value="staff">职工</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 年龄 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                年龄<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                value={formState.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.age ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="年龄"
                min="1"
                max="120"
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">{errors.age}</p>
              )}
            </div>
            
            {/* 性别 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                性别<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formState.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
          </div>

          {/* 信息 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              信息<span className="text-red-500 ml-1">*</span>
            </label>
            {formState.type === 'staff' ? (
              <select
                value={formState.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择信息</option>
                <option value="医生">医生</option>
                <option value="主治医生">主治医生</option>
                <option value="副主任医师">副主任医师</option>
                <option value="主任医师">主任医师</option>
                <option value="护士">护士</option>
                <option value="护士长">护士长</option>
                <option value="康复师">康复师</option>
                <option value="营养师">营养师</option>
                <option value="心理咨询师">心理咨询师</option>
                <option value="社工">社工</option>
                <option value="行政人员">行政人员</option>
                <option value="保洁员">保洁员</option>
                <option value="保安">保安</option>
                <option value="厨师">厨师</option>
                <option value="维修工">维修工</option>
              </select>
            ) : (
              <input
                type="text"
                value={formState.position}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            )}
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position}</p>
            )}
          </div>

          {/* 房间号 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              房间号<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formState.room}
              onChange={(e) => handleInputChange('room', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.room ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formState.type === 'staff' ? '如：医务室、护士站' : '如：101'}
            />
            {errors.room && (
              <p className="text-red-500 text-sm mt-1">{errors.room}</p>
            )}
          </div>

          {/* 联系电话 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              联系电话<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              value={formState.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请输入手机号"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 邮箱地址 */}
          <div>
            <label className="block text-sm font-medium mb-2">邮箱地址</label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="可选"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              确认添加
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default AddResidentForm
