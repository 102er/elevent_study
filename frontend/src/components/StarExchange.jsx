import React, { useState, useEffect } from 'react'
import { Gift, Star, ShoppingCart, Plus, Edit2, Trash2, Check, X } from 'lucide-react'

const StarExchange = ({ stars, onRefresh }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costStars: '',
    icon: '🎁'
  })
  const [selectedItem, setSelectedItem] = useState(null)

  const iconOptions = ['🎢', '🧸', '🍕', '🎬', '🍬', '✈️', '🎁', '🎮', '📚', '🎨', '⚽', '🎵']

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reward-items')
      const data = await response.json()
      setItems(data)
    } catch (err) {
      console.error('加载奖励商品失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingItem 
        ? `/api/reward-items/${editingItem.id}`
        : '/api/reward-items'
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadItems()
        handleCancel()
      } else {
        const error = await response.json()
        alert(error.error || '操作失败，请重试')
      }
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      costStars: item.costStars,
      icon: item.icon
    })
    setShowAddForm(true)
  }

  const handleDelete = async (item) => {
    if (window.confirm(`确定要删除"${item.name}"吗？`)) {
      try {
        const response = await fetch(`/api/reward-items/${item.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await loadItems()
        }
      } catch (err) {
        alert('删除失败，请重试')
      }
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      costStars: '',
      icon: '🎁'
    })
  }

  const handleRedeem = async (item) => {
    if (stars < item.costStars) {
      alert(`星星不足！还需要 ${item.costStars - stars} 颗星星`)
      return
    }

    if (window.confirm(`确定要兑换"${item.name}"吗？\n需要消耗 ${item.costStars} 颗星星`)) {
      try {
        const response = await fetch('/api/star-redemptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id })
        })
        
        if (response.ok) {
          const result = await response.json()
          alert(result.message)
          await loadItems()
          if (onRefresh) onRefresh()
        } else {
          const error = await response.json()
          alert(error.error || '兑换失败')
        }
      } catch (err) {
        alert('兑换失败，请重试')
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">🎁</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部卡片 */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl p-8 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Gift size={48} />
            <div>
              <h2 className="text-3xl font-bold mb-2">星星兑换</h2>
              <p className="text-lg opacity-90">用辛苦获得的星星兑换奖励吧！</p>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Star size={32} className="text-yellow-300" />
              <span className="text-5xl font-bold">{stars}</span>
            </div>
            <div className="text-sm opacity-90">我的星星</div>
          </div>
        </div>
      </div>

      {/* 添加商品按钮 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Plus size={28} />
          {showAddForm ? '取消添加' : '添加奖励商品'}
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingItem ? '✏️ 编辑商品' : '➕ 添加新商品'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">商品名称 📝</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                placeholder="例如：去游乐园、买玩具"
                required
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">所需星星 ⭐</label>
              <input
                type="number"
                value={formData.costStars}
                onChange={(e) => setFormData({ ...formData, costStars: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:outline-none transition-all"
                placeholder="需要多少颗星星？"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">图标 🎨</label>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`text-4xl p-3 rounded-xl transition-all hover:scale-110 ${
                      formData.icon === icon 
                        ? 'bg-purple-500 ring-4 ring-purple-300' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                商品描述 📄 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-lg px-6 py-4 border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="简单描述一下这个奖励..."
                rows="3"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={24} />
                {editingItem ? '保存修改' : '确定添加'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <X size={24} />
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 商品列表 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <ShoppingCart size={28} />
          奖励商城 ({items.length}件商品)
        </h3>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">还没有添加任何奖励商品！</p>
            <p className="text-xl text-gray-400 mt-2">点击上面的按钮添加吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const canAfford = stars >= item.costStars
              const progressPercent = Math.min((stars / item.costStars) * 100, 100)

              return (
                <div 
                  key={item.id}
                  className={`
                    rounded-2xl p-6 shadow-md hover:shadow-xl transition-all bounce-in
                    ${canAfford 
                      ? 'bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{item.icon}</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                  </div>

                  {/* 价格和进度 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star size={24} className="text-yellow-500" />
                      <span className="text-2xl font-bold text-gray-800">{item.costStars}</span>
                      <span className="text-sm text-gray-500">颗星</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          canAfford ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    {!canAfford && (
                      <p className="text-xs text-gray-500 text-center mt-1">
                        还需要 {item.costStars - stars} 颗星
                      </p>
                    )}
                  </div>

                  {/* 统计信息 */}
                  {item.redemptionCount > 0 && (
                    <div className="text-center text-sm text-gray-500 mb-3">
                      已兑换 {item.redemptionCount} 次
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford}
                      className={`
                        flex-1 px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                        ${canAfford 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <Gift size={18} />
                      兑换
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-purple-500 text-white px-3 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="bg-red-500 text-white px-3 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-2">💡 使用说明</h3>
        <ul className="text-gray-600 space-y-1">
          <li>• 添加你喜欢的奖励（游乐园、玩具、旅行等）</li>
          <li>• 设置每个奖励需要的星星数量</li>
          <li>• 当星星足够时，就可以兑换奖励啦</li>
          <li>• 兑换后星星会自动扣除</li>
          <li>• 在"我的奖励"中可以查看兑换历史</li>
        </ul>
      </div>
    </div>
  )
}

export default StarExchange

