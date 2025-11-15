import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react'

const LearningMode = ({ words, markAsLearned }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [celebrationMode, setCelebrationMode] = useState(false)
  const [stars, setStars] = useState([])
  const [loading, setLoading] = useState(false)

  // 只显示未学习的汉字
  const unlearnedWords = words.filter(w => !w.learned)

  // 当unlearnedWords变化时（比如某个字被标记为已学习），自动调整索引
  useEffect(() => {
    // 使用函数式更新来访问最新的currentIndex值
    setCurrentIndex(prevIndex => {
      // 如果当前索引超出范围，重置为最后一个有效索引（或0）
      if (unlearnedWords.length > 0 && prevIndex >= unlearnedWords.length) {
        return Math.max(0, unlearnedWords.length - 1)
      }
      // 否则保持索引不变（这样会自动显示下一个字）
      return prevIndex
    })
  }, [unlearnedWords.length]) // 只依赖数组长度，避免循环

  const handleNext = () => {
    if (currentIndex < unlearnedWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(unlearnedWords.length - 1)
    }
  }

  const handleMarkAsLearned = async () => {
    const word = unlearnedWords[currentIndex]
    setLoading(true)
    
    try {
      await markAsLearned(word.id)
      
      // 触发庆祝动画
      setCelebrationMode(true)
      createStars()
      
      setTimeout(() => {
        setCelebrationMode(false)
        setStars([])
        // 标记为已学习后，当前字会被从unlearnedWords中移除
        // useEffect会自动调整currentIndex，所以这里不需要手动调用handleNext()
      }, 2000)
    } catch (err) {
      // 错误已在父组件处理
    } finally {
      setLoading(false)
    }
  }

  const createStars = () => {
    const newStars = []
    for (let i = 0; i < 20; i++) {
      newStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 0.5
      })
    }
    setStars(newStars)
  }

  if (unlearnedWords.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">太棒了！</h2>
        <p className="text-2xl text-gray-600 mb-6">你已经学完所有汉字啦！</p>
        <p className="text-xl text-gray-500">可以去汉字库添加更多汉字继续学习哦！</p>
      </div>
    )
  }

  const currentWord = unlearnedWords[currentIndex]

  return (
    <div className="space-y-6">
      {/* 进度指示器 */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-gray-700">学习进度</span>
          <span className="text-2xl font-bold text-purple-600">
            {currentIndex + 1} / {unlearnedWords.length}
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / unlearnedWords.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 学习卡片 */}
      <div className="relative">
        {celebrationMode && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {stars.map(star => (
              <div
                key={star.id}
                className="absolute text-4xl star-burst"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  animationDelay: `${star.delay}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
        )}
        
        <div className={`bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-3xl p-12 shadow-2xl ${celebrationMode ? 'wiggle' : ''}`}>
          <div className="bg-white rounded-3xl p-12 min-h-[400px] flex flex-col items-center justify-center">
            {/* 汉字显示 */}
            <div className="text-center mb-8">
              <div className="text-9xl font-bold text-gray-800 mb-6 bounce-in">
                {currentWord.word}
              </div>
              
              <div className="text-2xl text-gray-500 mb-8">
                认识这个汉字了吗？
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                跳过
              </button>
              <button
                onClick={handleMarkAsLearned}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={24} />
                {loading ? '学习中...' : '已学会 ✓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={loading}
          className="bg-white text-purple-600 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} />
          上一个
        </button>
        
        <div className="text-white text-lg font-bold bg-white bg-opacity-20 px-6 py-4 rounded-2xl">
          还有 {unlearnedWords.length} 个汉字待学习
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className="bg-white text-purple-600 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一个
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}

export default LearningMode
