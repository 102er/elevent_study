import React from 'react'
import { TrendingUp, Award, Target, RotateCcw } from 'lucide-react'

const Dashboard = ({ words, stars, resetProgress }) => {
  const totalWords = words.length
  const learnedWords = words.filter(w => w.learned).length
  const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0

  const stats = [
    { 
      label: '学习进度', 
      value: `${progress}%`, 
      icon: TrendingUp, 
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-kid-blue'
    },
    { 
      label: '已学汉字', 
      value: `${learnedWords}/${totalWords}`, 
      icon: Award, 
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-kid-green'
    },
    { 
      label: '获得星星', 
      value: stars, 
      icon: Target, 
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-kid-yellow'
    },
  ]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index}
              className={`${stat.bgColor} rounded-3xl p-6 shadow-lg bounce-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-lg font-semibold opacity-90">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon size={48} className="opacity-80" />
              </div>
            </div>
          )
        })}
      </div>

      {/* 进度条 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">整体进度</h2>
          <span className="text-3xl font-bold text-purple-600">{progress}%</span>
        </div>
        <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 最近学习的汉字 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">最近学习的汉字</h2>
        {learnedWords === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">还没有学习任何汉字哦！</p>
            <p className="text-xl text-gray-400 mt-2">快去"开始学习"开始吧！🎈</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {words
              .filter(w => w.learned)
              .sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed))
              .slice(0, 12)
              .map((word, index) => (
                <div 
                  key={word.id}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all hover:scale-105 bounce-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="text-5xl font-bold text-purple-700 mb-2">{word.word}</div>
                  <div className="text-lg text-gray-600">{word.pinyin}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* 重置按钮 */}
      {learnedWords > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (window.confirm('确定要重置所有学习进度吗？')) {
                resetProgress()
              }
            }}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <RotateCcw size={24} />
            重置进度
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
