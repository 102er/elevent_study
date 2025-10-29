import React, { useState, useEffect } from 'react'
import { Book, BookOpen, Plus, Trash2, Edit2, Check, CheckCircle } from 'lucide-react'
import { bookAPI, readingAPI } from '../services/api'

const ReadingManagement = () => {
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverColor: 'blue',
    totalPages: '',
    description: ''
  })

  const colorOptions = [
    { name: 'blue', label: '蓝色', class: 'bg-kid-blue' },
    { name: 'pink', label: '粉色', class: 'bg-kid-pink' },
    { name: 'green', label: '绿色', class: 'bg-kid-green' },
    { name: 'yellow', label: '黄色', class: 'bg-kid-yellow' },
    { name: 'purple', label: '紫色', class: 'bg-kid-purple' },
    { name: 'orange', label: '橙色', class: 'bg-kid-orange' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [booksData, statsData] = await Promise.all([
        bookAPI.getAll(),
        readingAPI.getStats()
      ])
      setBooks(booksData)
      setStats(statsData)
    } catch (err) {
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBook) {
        await bookAPI.update(editingBook.id, formData)
      } else {
        await bookAPI.add(formData)
      }
      await loadData()
      handleCancel()
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author || '',
      coverColor: book.coverColor,
      totalPages: book.totalPages || '',
      description: book.description || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (book) => {
    if (window.confirm(`确定要删除《${book.title}》吗？`)) {
      try {
        await bookAPI.delete(book.id)
        await loadData()
      } catch (err) {
        alert('删除失败，请重试')
      }
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      coverColor: 'blue',
      totalPages: '',
      description: ''
    })
  }

  const handleStartReading = async (book) => {
    try {
      await readingAPI.start(book.id)
      await loadData()
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  const handleCompleteReading = async (book) => {
    try {
      await readingAPI.complete(book.id)
      await loadData()
    } catch (err) {
      alert('操作失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">📚</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-kid-blue rounded-3xl p-6 shadow-lg text-white bounce-in">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-2xl font-bold">{stats.totalBooks || 0}</div>
          <div className="text-sm opacity-90">全部书籍</div>
        </div>
        <div className="bg-kid-green rounded-3xl p-6 shadow-lg text-white bounce-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-4xl mb-2">✅</div>
          <div className="text-2xl font-bold">{stats.completedBooks || 0}</div>
          <div className="text-sm opacity-90">已读完</div>
        </div>
        <div className="bg-kid-yellow rounded-3xl p-6 shadow-lg text-white bounce-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-4xl mb-2">📖</div>
          <div className="text-2xl font-bold">{stats.readingBooks || 0}</div>
          <div className="text-sm opacity-90">正在读</div>
        </div>
        <div className="bg-kid-pink rounded-3xl p-6 shadow-lg text-white bounce-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-2xl font-bold">{stats.unreadBooks || 0}</div>
          <div className="text-sm opacity-90">计划读</div>
        </div>
      </div>

      {/* 添加书籍按钮 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Plus size={28} />
          {showAddForm ? '取消添加' : '添加新书籍'}
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingBook ? '✏️ 编辑书籍' : '➕ 添加新书籍'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">书名 📖</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-2xl px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                placeholder="输入书名"
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
                placeholder="输入作者（选填）"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                封面颜色 🎨 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {colorOptions.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, coverColor: color.name })}
                    className={`${color.class} text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 ${
                      formData.coverColor === color.name ? 'ring-4 ring-purple-500' : ''
                    }`}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                总页数 📄 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <input
                type="number"
                value={formData.totalPages}
                onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                className="w-full text-xl px-6 py-4 border-4 border-green-300 rounded-2xl focus:border-green-500 focus:outline-none transition-all"
                placeholder="输入总页数（选填）"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                简介 📝 <span className="text-sm text-gray-400">(选填)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-lg px-6 py-4 border-4 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:outline-none transition-all"
                placeholder="输入书籍简介（选填）"
                rows="3"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={24} />
                {editingBook ? '保存修改' : '确定添加'}
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

      {/* 书籍列表 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Book size={32} />
          我的书架 ({books.length}本)
        </h2>
        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">还没有添加任何书籍！</p>
            <p className="text-xl text-gray-400 mt-2">点击上面的按钮开始添加吧！📚</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => {
              const colorClass = colorOptions.find(c => c.name === book.coverColor)?.class || 'bg-kid-blue'
              const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0
              
              return (
                <div 
                  key={book.id}
                  className={`${colorClass} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group bounce-in relative`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {book.isCompleted && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle size={16} />
                      已读完
                    </div>
                  )}
                  
                  <div className="text-white mb-4">
                    <div className="text-3xl font-bold mb-2">{book.title}</div>
                    {book.author && <div className="text-lg opacity-90">作者：{book.author}</div>}
                    {book.totalPages > 0 && (
                      <div className="text-sm opacity-80 mt-2">共 {book.totalPages} 页</div>
                    )}
                  </div>

                  {/* 阅读进度 */}
                  {book.hasRecord && (
                    <div className="bg-white bg-opacity-20 rounded-xl p-3 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-bold">阅读进度</span>
                        <span className="text-white text-sm font-bold">{progress}%</span>
                      </div>
                      <div className="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-white text-xs mt-1 opacity-80">
                        第 {book.currentPage} / {book.totalPages} 页
                      </div>
                    </div>
                  )}

                  {book.description && (
                    <div className="text-white text-sm opacity-80 mb-4 line-clamp-2">
                      {book.description}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2 flex-wrap">
                    {!book.isCompleted && (
                      <button
                        onClick={() => handleCompleteReading(book)}
                        className="flex-1 bg-green-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                      >
                        <CheckCircle size={16} />
                        读完了
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(book)}
                      className="flex-1 bg-white bg-opacity-30 hover:bg-opacity-50 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                    >
                      <Edit2 size={16} />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(book)}
                      className="flex-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                    >
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 阅读进度总结 */}
      {stats.completedBooks > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-lg text-center text-white">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">太棒了！</h3>
          <p className="text-xl">
            你已经读完了 <span className="text-3xl font-bold">{stats.completedBooks}</span> 本书！
          </p>
          <p className="text-lg opacity-90 mt-2">继续加油，多读好书！📚</p>
        </div>
      )}
    </div>
  )
}

export default ReadingManagement

