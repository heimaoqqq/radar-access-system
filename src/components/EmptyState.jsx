import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Database, FileX } from 'lucide-react'

const EmptyState = ({ 
  title = '暂无数据', 
  description = '目前还没有任何内容', 
  icon: Icon = FileX,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

export const NoResidentsState = ({ onAddClick }) => (
  <EmptyState
    title="还没有住户信息"
    description="开始添加住户信息，建立完整的人员管理数据库"
    icon={Users}
    actionLabel="添加第一位住户"
    onAction={onAddClick}
  />
)

export const NoDataState = ({ title, description }) => (
  <EmptyState
    title={title || "暂无数据"}
    description={description || "当前没有可显示的数据"}
    icon={Database}
  />
)

export default EmptyState
