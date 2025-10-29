import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

const WordLibrary = ({ words, addWord, deleteWord, editWord }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ word: '', pinyin: '', meaning: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // 只需要汉字是必填的
    if (formData.word) {
      setLoading(true)
      try {
        if (editingId) {
          await editWord(editingId, formData)
          setEditingId(null)
        } else {
          await addWord(formData)
        }
        setFormData({ word: '', pinyin: '', meaning: '' })
        setShowAddForm(false)
      } catch (err) {
        // 错误已在父组件处理
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEdit = (word) => {
    setEditingId(word.id)
    setFormData({ word: word.word, pinyin: word.pinyin, meaning: word.meaning })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ word: '', pinyin: '', meaning: '' })
  }

  const handleDelete = async (word) => {
    if (window.confirm(`确定要删除"${word.word}"吗？`)) {
      try {
        await deleteWord(word.id)
      } catch (err) {
        // 错误已在父组件处理
      }
    }
  }

  const colors = ['bg-kid-blue', 'bg-kid-pink', 'bg-kid-green', 'bg-kid-yellow', 'bg-kid-purple', 'bg-kid-orange']

  return (
    <div className="space-y-6">
      {/* 添加按钮 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Plus size={28} />
          {showAddForm ? '取消添加' : '添加新汉字'}
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? '✏️ 编辑汉字' : '➕ 添加新汉字'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">汉字 📝</label>
              <input
                type="text"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                className="w-full text-4xl font-bold text-center px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                placeholder="输入汉字"
                maxLength="1"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                拼音 🔤 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <input
                type="text"
                value={formData.pinyin}
                onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
                className="w-full text-2xl px-6 py-4 border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="例如：rì（选填）"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                意思 💡 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <input
                type="text"
                value={formData.meaning}
                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                className="w-full text-2xl px-6 py-4 border-4 border-green-300 rounded-2xl focus:border-green-500 focus:outline-none transition-all"
                placeholder="例如：太阳（选填）"
                disabled={loading}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={24} />
                {loading ? '处理中...' : editingId ? '保存修改' : '确定添加'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={24} />
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 汉字列表 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">汉字库 ({words.length}个)</h2>
        {words.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">还没有添加任何汉字！</p>
            <p className="text-xl text-gray-400 mt-2">点击上面的按钮开始添加吧！🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {words.map((word, index) => {
              const bgColor = colors[index % colors.length]
              return (
                <div 
                  key={word.id}
                  className={`${bgColor} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all bounce-in relative group`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {word.learned && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ✓ 已学会
                    </div>
                  )}
                  <div className="text-white">
                    <div className="text-6xl font-bold text-center mb-3">{word.word}</div>
                    <div className="text-2xl text-center mb-2 opacity-90">{word.pinyin}</div>
                    <div className="text-xl text-center opacity-80">{word.meaning}</div>
                  </div>
                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(word)}
                      className="flex-1 bg-white bg-opacity-30 hover:bg-opacity-50 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(word)}
                      className="flex-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      删除
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WordLibrary
