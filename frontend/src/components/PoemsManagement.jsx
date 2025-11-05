import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Trash2, Edit2, CheckCircle, Star, Award } from 'lucide-react'

const PoemsManagement = () => {
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPoem, setEditingPoem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: ''
  })

  useEffect(() => {
    loadPoems()
  }, [])

  const loadPoems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/poems')
      const data = await response.json()
      setPoems(data)
    } catch (err) {
      console.error('加载古诗失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPoem 
        ? `/api/poems/${editingPoem.id}`
        : '/api/poems'
      
      const response = await fetch(url, {
        method: editingPoem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadPoems()
        handleCancel()
      } else {
        const error = await response.json()
        alert(error.error || '操作失败，请重试')
      }
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleEdit = (poem) => {
    setEditingPoem(poem)
    setFormData({
      title: poem.title,
      author: poem.author || '',
      content: poem.content
    })
    setShowAddForm(true)
  }

  const handleDelete = async (poem) => {
    if (window.confirm(`确定要删除《${poem.title}》吗？`)) {
      try {
        const response = await fetch(`/api/poems/${poem.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await loadPoems()
        }
      } catch (err) {
        alert('删除失败，请重试')
      }
    }
  }

  const handleComplete = async (poem) => {
    if (window.confirm(`确定已经背会《${poem.title}》了吗？完成后将获得5颗星星！`)) {
      try {
        const response = await fetch(`/api/poems/${poem.id}/complete`, {
          method: 'POST'
        })
        
        if (response.ok) {
          const result = await response.json()
          alert(result.message)
          await loadPoems()
        } else {
          const error = await response.json()
          alert(error.error || '操作失败')
        }
      } catch (err) {
        alert('操作失败，请重试')
      }
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingPoem(null)
    setFormData({
      title: '',
      author: '',
      content: ''
    })
  }

  const completedCount = poems.filter(p => p.isCompleted).length
  const totalCount = poems.length

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">📖</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题和统计 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <div>
              <h2 className="text-2xl font-bold">古诗词背诵</h2>
              <p className="text-sm opacity-90">腹有诗书气自华 📖</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{completedCount} / {totalCount}</div>
            <div className="text-sm opacity-90">已完成</div>
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
          {showAddForm ? '取消录入' : '录入新古诗'}
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingPoem ? '✏️ 编辑古诗' : '➕ 录入新古诗'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">诗名 📜</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-2xl px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                placeholder="例如：静夜思"
                required
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                作者 ✍️ <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="例如：李白"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">诗词内容 📝</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full text-lg px-6 py-4 border-4 border-green-300 rounded-2xl focus:border-green-500 focus:outline-none transition-all font-serif"
                placeholder="床前明月光，疑是地上霜。举头望明月，低头思故乡。"
                rows="6"
                required
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {editingPoem ? '保存修改' : '确定录入'}
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

      {/* 古诗列表 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Award size={32} className="text-yellow-500" />
          我的诗集 ({totalCount}首)
        </h3>
        {poems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">还没有录入任何古诗哦！</p>
            <p className="text-xl text-gray-400 mt-2">点击上面的按钮开始录入吧！📜</p>
          </div>
        ) : (
          <div className="space-y-4">
            {poems.map((poem, index) => (
              <div 
                key={poem.id}
                className={`
                  rounded-2xl p-6 shadow-md hover:shadow-xl transition-all bounce-in
                  ${poem.isCompleted 
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300' 
                    : 'bg-gradient-to-r from-orange-50 to-yellow-50'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-2xl font-bold text-gray-800">{poem.title}</h4>
                      {poem.isCompleted && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <CheckCircle size={16} />
                          已完成
                        </div>
                      )}
                    </div>
                    {poem.author && (
                      <p className="text-lg text-gray-600 mb-3">作者：{poem.author}</p>
                    )}
                    <div className="bg-white bg-opacity-60 rounded-xl p-4 mb-3">
                      <pre className="text-lg text-gray-700 whitespace-pre-wrap font-serif leading-relaxed">
                        {poem.content}
                      </pre>
                    </div>
                    {poem.isCompleted && poem.completedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star size={16} className="text-yellow-500" />
                        <span>完成时间：{new Date(poem.completedAt).toLocaleString('zh-CN')}</span>
                        <span className="ml-2 text-yellow-600 font-bold">+5 ⭐</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!poem.isCompleted && (
                    <button
                      onClick={() => handleComplete(poem)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      背会了！
                      <span className="text-yellow-300">+5⭐</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(poem)}
                    className="flex-1 bg-purple-500 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={20} />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(poem)}
                    className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 成就卡片 */}
      {completedCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 shadow-lg text-center text-white">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">太棒了！</h3>
          <p className="text-xl">
            你已经背会了 <span className="text-3xl font-bold">{completedCount}</span> 首古诗！
          </p>
          <p className="text-lg opacity-90 mt-2">
            共获得 <span className="text-2xl font-bold">{completedCount * 5}</span> 颗星星 ⭐
          </p>
          <p className="text-lg opacity-90 mt-2">继续加油，诗词满腹！📖</p>
        </div>
      )}

      {/* 说明卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-2">💡 使用说明</h3>
        <ul className="text-gray-600 space-y-1">
          <li>• 录入你要背诵的古诗词</li>
          <li>• 背会后点击"背会了"按钮</li>
          <li>• <span className="font-bold text-orange-600">每完成一首古诗奖励5颗星星</span> ⭐</li>
          <li>• 可以随时查看完成时间和获得的星星</li>
        </ul>
      </div>
    </div>
  )
}

export default PoemsManagement

