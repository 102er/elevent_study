import React, { useState } from 'react'
import { BookOpen, Library, GraduationCap, Star, Calendar, Book, Sparkles } from 'lucide-react'

const Header = ({ currentView, setCurrentView }) => {
  // 按模块分组的菜单项
  const menuSections = {
    literacy: {
      title: '📚 儿童识字',
      items: [
        { id: 'dashboard', label: '学习看板', icon: BookOpen, color: 'bg-kid-blue' },
        { id: 'library', label: '汉字库', icon: Library, color: 'bg-kid-green' },
        { id: 'learning', label: '开始学习', icon: GraduationCap, color: 'bg-kid-pink' },
        { id: 'weekly', label: '周统计', icon: Calendar, color: 'bg-kid-orange' },
        { id: 'rewards', label: '我的奖励', icon: Star, color: 'bg-kid-yellow' },
      ]
    },
    reading: {
      title: '📖 快乐阅读',
      items: [
        { id: 'reading', label: '阅读记录', icon: Book, color: 'bg-kid-purple' },
      ]
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 bounce-in">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text flex items-center justify-center gap-3">
        <Sparkles className="text-yellow-400" size={40} />
        🌈 学习乐园 🌈
        <Sparkles className="text-yellow-400" size={40} />
      </h1>
      
      <div className="space-y-6">
        {/* 儿童识字模块 */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-600 mb-3 text-center">
            {menuSections.literacy.title}
          </h2>
          <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {menuSections.literacy.items.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    ${item.color} 
                    ${currentView === item.id ? 'ring-4 ring-purple-500 scale-105' : 'hover:scale-105'}
                    text-white rounded-2xl p-4 md:p-6 
                    transition-all duration-300 
                    flex flex-col items-center gap-2
                    shadow-lg hover:shadow-xl
                    active:scale-95
                  `}
                >
                  <Icon size={32} className="md:w-12 md:h-12" />
                  <span className="font-bold text-base md:text-xl">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* 快乐阅读模块 */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-pink-600 mb-3 text-center">
            {menuSections.reading.title}
          </h2>
          <nav className="grid grid-cols-1 md:grid-cols-1 gap-3 md:gap-4 max-w-md mx-auto">
            {menuSections.reading.items.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    ${item.color} 
                    ${currentView === item.id ? 'ring-4 ring-pink-500 scale-105' : 'hover:scale-105'}
                    text-white rounded-2xl p-4 md:p-6 
                    transition-all duration-300 
                    flex flex-col items-center gap-2
                    shadow-lg hover:shadow-xl
                    active:scale-95
                  `}
                >
                  <Icon size={32} className="md:w-12 md:h-12" />
                  <span className="font-bold text-base md:text-xl">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Header
