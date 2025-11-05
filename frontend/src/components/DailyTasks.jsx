import React, { useState, useEffect } from 'react'
import { CheckSquare, Plus, Trash2, Edit2, Star, Award, Clock } from 'lucide-react'

const DailyTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [completions, setCompletions] = useState([])
  const [formData, setFormData] = useState({
    taskName: '',
    rewardStars: '',
    description: ''
  })
  const [completeNotes, setCompleteNotes] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/daily-tasks')
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      console.error('加载任务失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCompletions = async (taskId) => {
    try {
      const response = await fetch(`/api/daily-tasks/${taskId}/completions`)
      const data = await response.json()
      setCompletions(data)
    } catch (err) {
      console.error('加载完成记录失败:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingTask 
        ? `/api/daily-tasks/${editingTask.id}`
        : '/api/daily-tasks'
      
      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadTasks()
        handleCancel()
      } else {
        const error = await response.json()
        alert(error.error || '操作失败，请重试')
      }
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      taskName: task.taskName,
      rewardStars: task.rewardStars || '',
      description: task.description || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (task) => {
    if (window.confirm(`确定要删除"${task.taskName}"吗？`)) {
      try {
        const response = await fetch(`/api/daily-tasks/${task.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await loadTasks()
        }
      } catch (err) {
        alert('删除失败，请重试')
      }
    }
  }

  const handleComplete = async (task) => {
    try {
      const response = await fetch(`/api/daily-tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: completeNotes })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setCompleteNotes('')
        await loadTasks()
        if (selectedTask && selectedTask.id === task.id) {
          await loadCompletions(task.id)
        }
      } else {
        const error = await response.json()
        alert(error.error || '操作失败')
      }
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingTask(null)
    setFormData({
      taskName: '',
      rewardStars: '',
      description: ''
    })
  }

  const handleViewCompletions = (task) => {
    setSelectedTask(task)
    loadCompletions(task.id)
  }

  const totalCompletions = tasks.reduce((sum, task) => sum + task.completionsCount, 0)

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">✅</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题和统计 */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare size={32} />
            <div>
              <h2 className="text-2xl font-bold">日常任务</h2>
              <p className="text-sm opacity-90">完成任务，获得奖励 🎯</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalCompletions}</div>
            <div className="text-sm opacity-90">累计完成</div>
          </div>
        </div>
      </div>

      {/* 添加按钮 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Plus size={28} />
          {showAddForm ? '取消添加' : '添加新任务'}
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingTask ? '✏️ 编辑任务' : '➕ 添加新任务'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">任务名称 📋</label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                className="w-full text-2xl px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                placeholder="例如：小小主持人、扫地"
                required
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">奖励星星 ⭐</label>
              <input
                type="number"
                value={formData.rewardStars}
                onChange={(e) => setFormData({ ...formData, rewardStars: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:outline-none transition-all"
                placeholder="完成任务可以获得多少星星？"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                任务描述 📝 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-lg px-6 py-4 border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="描述一下任务内容..."
                rows="3"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {editingTask ? '保存修改' : '确定添加'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 任务列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 shadow-lg text-center">
            <p className="text-2xl text-gray-400">还没有添加任何任务哦！</p>
            <p className="text-xl text-gray-400 mt-2">点击上面的按钮开始添加吧！📋</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div 
              key={task.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all bounce-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare size={24} className="text-green-600" />
                <h3 className="text-2xl font-bold text-gray-800 flex-1">{task.taskName}</h3>
              </div>

              {task.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
              )}

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">奖励</span>
                  <div className="flex items-center gap-1 text-yellow-600 font-bold text-lg">
                    <Star size={20} />
                    <span>{task.rewardStars} 颗星</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">已完成</span>
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <Award size={16} />
                    <span>{task.completionsCount} 次</span>
                  </div>
                </div>
                {task.lastCompletedAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock size={14} />
                    <span>最近：{new Date(task.lastCompletedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <textarea
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="完成备注（选填）"
                  className="w-full text-sm px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                  rows="2"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleComplete(task)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckSquare size={18} />
                  完成任务
                </button>
                <button
                  onClick={() => handleViewCompletions(task)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  查看记录
                </button>
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 完成记录弹窗 */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto bounce-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              📋 {selectedTask.taskName} - 完成记录
            </h3>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">{selectedTask.completionsCount}</div>
                  <div className="text-sm text-gray-600">累计完成</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {selectedTask.completionsCount * selectedTask.rewardStars}
                  </div>
                  <div className="text-sm text-gray-600">累计获得星星</div>
                </div>
              </div>
            </div>

            {completions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h4 className="text-lg font-bold text-gray-700 mb-3">历史记录</h4>
                {completions.map((comp) => (
                  <div key={comp.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                        <CheckSquare size={18} className="text-green-600" />
                        <span>{new Date(comp.completedAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 font-bold">
                        <Star size={18} />
                        <span>+{comp.starsEarned}</span>
                      </div>
                    </div>
                    {comp.notes && (
                      <p className="text-sm text-gray-600 mt-2 pl-6">{comp.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">还没有完成记录</p>
            )}

            <button
              onClick={() => {
                setSelectedTask(null)
                setCompletions([])
              }}
              className="w-full mt-6 bg-gray-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 成就卡片 */}
      {totalCompletions > 0 && (
        <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-3xl p-8 shadow-lg text-center text-white">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">太棒了！</h3>
          <p className="text-xl">
            你已经完成了 <span className="text-3xl font-bold">{totalCompletions}</span> 次任务！
          </p>
          <p className="text-lg opacity-90 mt-2">继续保持，养成好习惯！💪</p>
        </div>
      )}

      {/* 说明卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-2">💡 使用说明</h3>
        <ul className="text-gray-600 space-y-1">
          <li>• 添加日常需要完成的任务（如小小主持人、扫地等）</li>
          <li>• 设置完成任务后可以获得的星星数量</li>
          <li>• 完成任务后点击"完成任务"按钮即可获得星星奖励</li>
          <li>• 可以查看每个任务的完成历史记录</li>
          <li>• 培养好习惯，每天进步一点点！</li>
        </ul>
      </div>
    </div>
  )
}

export default DailyTasks

