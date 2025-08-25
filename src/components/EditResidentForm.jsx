import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const EditResidentForm = ({ resident, onSubmit, onCancel }) => {
  const [editFormState, setEditFormState] = useState({
    name: '',
    age: '',
    gender: '男',
    room: '',
    phone: '',
    email: '',
    type: 'resident',
    position: '住户'
  })
  const [formErrors, setFormErrors] = useState({})

  // 初始化表单数据
  useEffect(() => {
    if (resident) {
      setEditFormState({
        name: resident.name,
        age: resident.age.toString(),
        gender: resident.gender,
        room: resident.room,
        phone: resident.phone,
        email: resident.email || '',
        type: resident.type || 'resident',
        position: resident.position || '住户'
      })
      setFormErrors({})
    }
  }, [resident])

  const handleEditInputChange = (field, value) => {
    setEditFormState(prev => ({
      ...prev,
      [field]: value
    }))
    // 清除该字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 表单验证
    const errors = {}
    if (!editFormState.name.trim()) errors.name = '姓名不能为空'
    if (!editFormState.age || editFormState.age < 1 || editFormState.age > 120) errors.age = '请输入有效年龄(1-120)'
    if (!editFormState.room.trim()) errors.room = '房间号不能为空'
    if (!editFormState.phone.trim()) errors.phone = '联系电话不能为空'
    if (editFormState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormState.email)) {
      errors.email = '请输入有效的邮箱地址'
    }
    if (!editFormState.position.trim()) {
      errors.position = '职务不能为空'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // 提交数据
    const updatedResident = {
      ...resident,
      name: editFormState.name.trim(),
      age: parseInt(editFormState.age),
      gender: editFormState.gender,
      room: editFormState.room.trim(),
      phone: editFormState.phone.trim(),
      email: editFormState.email.trim(),
      type: editFormState.type,
      position: editFormState.position.trim()
    }

    onSubmit(updatedResident)
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
        <h3 className="text-2xl font-bold mb-6">编辑人员信息</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              姓名<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={editFormState.name}
              onChange={(e) => handleEditInputChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请输入姓名"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* 人员类型 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              人员类型<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={editFormState.type}
              onChange={(e) => {
                const newType = e.target.value
                handleEditInputChange('type', newType)
                // 根据类型自动设置职务
                if (newType === 'resident') {
                  handleEditInputChange('position', '住户')
                } else if (editFormState.position === '住户') {
                  handleEditInputChange('position', '')
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
                value={editFormState.age}
                onChange={(e) => handleEditInputChange('age', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  formErrors.age ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="年龄"
                min="1"
                max="120"
              />
              {formErrors.age && (
                <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>
              )}
            </div>
            
            {/* 性别 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                性别<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={editFormState.gender}
                onChange={(e) => handleEditInputChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
          </div>

          {/* 职务 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              职务<span className="text-red-500 ml-1">*</span>
            </label>
            {editFormState.type === 'staff' ? (
              <select
                value={editFormState.position}
                onChange={(e) => handleEditInputChange('position', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  formErrors.position ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择职务</option>
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
                value={editFormState.position}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            )}
            {formErrors.position && (
              <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>
            )}
          </div>

          {/* 房间号/工作地点 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {editFormState.type === 'staff' ? '工作地点' : '房间号'}<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={editFormState.room}
              onChange={(e) => handleEditInputChange('room', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                formErrors.room ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={editFormState.type === 'staff' ? '如：医务室、护士站' : '如：101'}
            />
            {formErrors.room && (
              <p className="text-red-500 text-sm mt-1">{formErrors.room}</p>
            )}
          </div>

          {/* 联系电话 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              联系电话<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              value={editFormState.phone}
              onChange={(e) => handleEditInputChange('phone', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请输入手机号"
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
            )}
          </div>

          {/* 邮箱地址 */}
          <div>
            <label className="block text-sm font-medium mb-2">邮箱地址</label>
            <input
              type="email"
              value={editFormState.email}
              onChange={(e) => handleEditInputChange('email', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="可选"
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
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
              确认修改
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default EditResidentForm
