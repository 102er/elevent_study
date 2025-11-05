import React, { useState, useEffect } from 'react'
import { Plane, MapPin, DollarSign, Calendar, Plus, Trash2, Edit2, Star, CheckCircle } from 'lucide-react'

const TravelPlans = () => {
  const [plans, setPlans] = useState([])
  const [footprints, setFootprints] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showFootprintForm, setShowFootprintForm] = useState(false)
  const [formData, setFormData] = useState({
    destination: '',
    budget: '',
    startDate: '',
    endDate: '',
    notes: ''
  })
  const [footprintData, setFootprintData] = useState({
    expense: '',
    description: ''
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/travel-plans')
      const data = await response.json()
      setPlans(data)
    } catch (err) {
      console.error('加载旅行计划失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFootprints = async (planId) => {
    try {
      const response = await fetch(`/api/travel-plans/${planId}/footprints`)
      const data = await response.json()
      setFootprints(prev => ({ ...prev, [planId]: data }))
    } catch (err) {
      console.error('加载旅行足迹失败:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPlan 
        ? `/api/travel-plans/${editingPlan.id}`
        : '/api/travel-plans'
      
      const response = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadPlans()
        handleCancel()
      } else {
        alert('操作失败，请重试')
      }
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      destination: plan.destination,
      budget: plan.budget || '',
      startDate: plan.startDate || '',
      endDate: plan.endDate || '',
      notes: plan.notes || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (plan) => {
    if (window.confirm(`确定要删除"${plan.destination}"吗？`)) {
      try {
        const response = await fetch(`/api/travel-plans/${plan.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await loadPlans()
        }
      } catch (err) {
        alert('删除失败，请重试')
      }
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingPlan(null)
    setFormData({
      destination: '',
      budget: '',
      startDate: '',
      endDate: '',
      notes: ''
    })
  }

  const handleAddFootprint = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/travel-plans/${selectedPlan.id}/footprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footprintData)
      })
      
      if (response.ok) {
        await loadPlans()
        await loadFootprints(selectedPlan.id)
        setFootprintData({ expense: '', description: '' })
        setShowFootprintForm(false)
      } else {
        alert('添加失败，请重试')
      }
    } catch (err) {
      alert('添加失败，请重试')
    }
  }

  const handleViewFootprints = (plan) => {
    setSelectedPlan(plan)
    loadFootprints(plan.id)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">✈️</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题和添加按钮 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane size={32} />
            <div>
              <h2 className="text-2xl font-bold">旅行计划</h2>
              <p className="text-sm opacity-90">记录你的旅行梦想 ✈️</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            {showAddForm ? '取消' : '新增计划'}
          </button>
        </div>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingPlan ? '✏️ 编辑计划' : '➕ 新增计划'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">目的地 📍</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                placeholder="想去哪里玩呢？"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-2">预算 💰</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full text-xl px-6 py-4 border-4 border-green-300 rounded-2xl focus:border-green-500 focus:outline-none transition-all"
                  placeholder="预算多少元？"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-2">开始时间 📅</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full text-xl px-6 py-4 border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">结束时间 📅</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">备注 📝</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full text-lg px-6 py-4 border-4 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:outline-none transition-all"
                placeholder="记录一些想法..."
                rows="3"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {editingPlan ? '保存修改' : '确定添加'}
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

      {/* 旅行计划列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 shadow-lg text-center">
            <p className="text-2xl text-gray-400">还没有添加旅行计划哦！</p>
            <p className="text-xl text-gray-400 mt-2">点击上面的按钮开始计划吧！✈️</p>
          </div>
        ) : (
          plans.map((plan, index) => (
            <div 
              key={plan.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all bounce-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {plan.isCompleted && (
                <div className="mb-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1">
                  <CheckCircle size={16} />
                  已完成
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={24} className="text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">{plan.destination}</h3>
              </div>

              {plan.budget > 0 && (
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <DollarSign size={20} />
                  <span>预算: ¥{plan.budget}</span>
                </div>
              )}

              {plan.startDate && (
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <Calendar size={20} />
                  <span>{plan.startDate} {plan.endDate && `至 ${plan.endDate}`}</span>
                </div>
              )}

              {plan.notes && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.notes}</p>
              )}

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">旅行花费</span>
                  <div className="flex items-center gap-1 text-orange-600 font-bold">
                    <DollarSign size={18} />
                    <span>¥{plan.totalExpense}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">获得星星</span>
                  <div className="flex items-center gap-1 text-yellow-600 font-bold">
                    <Star size={16} />
                    <span>{plan.starsEarned}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleViewFootprints(plan)
                    setShowFootprintForm(true)
                  }}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  记录花费
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                >
                  <Edit2 size={16} />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                >
                  <Trash2 size={16} />
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 旅行足迹弹窗 */}
      {showFootprintForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto bounce-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              ✈️ {selectedPlan.destination} - 旅行足迹
            </h3>

            {/* 添加花费表单 */}
            <form onSubmit={handleAddFootprint} className="bg-blue-50 rounded-2xl p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-700 mb-4">记录新花费</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">花费金额 💰</label>
                  <input
                    type="number"
                    value={footprintData.expense}
                    onChange={(e) => setFootprintData({ ...footprintData, expense: e.target.value })}
                    className="w-full text-xl px-4 py-3 border-4 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="花了多少元？"
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-gray-500 mt-1">💡 1元 = 1颗星星</p>
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">描述 📝</label>
                  <input
                    type="text"
                    value={footprintData.description}
                    onChange={(e) => setFootprintData({ ...footprintData, description: e.target.value })}
                    className="w-full text-lg px-4 py-3 border-4 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                    placeholder="买了什么？"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                添加花费记录
              </button>
            </form>

            {/* 花费记录列表 */}
            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-700 mb-4">历史记录</h4>
              {footprints[selectedPlan.id] && footprints[selectedPlan.id].length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {footprints[selectedPlan.id].map((fp) => (
                    <div key={fp.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          <DollarSign size={18} className="text-green-600" />
                          ¥{fp.expense}
                        </div>
                        {fp.description && (
                          <div className="text-sm text-gray-600">{fp.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(fp.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 font-bold">
                        <Star size={18} />
                        <span>+{fp.starsEarned}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">还没有花费记录</p>
              )}
            </div>

            <button
              onClick={() => {
                setShowFootprintForm(false)
                setSelectedPlan(null)
                setFootprintData({ expense: '', description: '' })
              }}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 说明卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-2">💡 使用说明</h3>
        <ul className="text-gray-600 space-y-1">
          <li>• 添加你想去的旅行目的地和预算</li>
          <li>• 在旅行中记录每一笔花费</li>
          <li>• <span className="font-bold text-orange-600">1元 = 1颗星星</span>，记录花费就能获得星星奖励！</li>
          <li>• 查看旅行足迹，回顾美好时光</li>
        </ul>
      </div>
    </div>
  )
}

export default TravelPlans

