import React, { useState, useEffect } from 'react'
import { Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { weeklyAPI } from '../services/api'

const WeeklyStats = () => {
  const [weeklyStats, setWeeklyStats] = useState([])
  const [currentWeek, setCurrentWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedWeek, setExpandedWeek] = useState(null)

  useEffect(() => {
    loadWeeklyStats()
  }, [])

  const loadWeeklyStats = async () => {
    try {
      setLoading(true)
      const [stats, current] = await Promise.all([
        weeklyAPI.getStats(),
        weeklyAPI.getCurrentWeek()
      ])
      // 后端API现在返回包含words的完整数据
      setWeeklyStats(stats)
      setCurrentWeek(current)
    } catch (err) {
      console.error('加载周统计失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWeek = (year, week) => {
    const key = `${year}-${week}`
    if (expandedWeek === key) {
      setExpandedWeek(null)
    } else {
      setExpandedWeek(key)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">📊</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  const colors = ['bg-kid-blue', 'bg-kid-pink', 'bg-kid-green', 'bg-kid-yellow', 'bg-kid-purple', 'bg-kid-orange']

  return (
    <div className="space-y-6">
      {/* 当前周统计 */}
      {currentWeek && (
        <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-8 shadow-lg bounce-in text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={32} />
                <h2 className="text-3xl font-bold">本周学习</h2>
              </div>
              <p className="text-xl opacity-90">
                {currentWeek.startDate} ~ {currentWeek.endDate}
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold">{currentWeek.count}</div>
              <div className="text-xl">个汉字</div>
            </div>
          </div>
        </div>
      )}

      {/* 周统计列表 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={32} className="text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">历史周统计</h2>
        </div>

        {weeklyStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">还没有学习记录哦！</p>
            <p className="text-xl text-gray-400 mt-2">快去"开始学习"开始吧！📚</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weeklyStats.map((stat, index) => {
              const bgColor = colors[index % colors.length]
              const isExpanded = expandedWeek === `${stat.year}-${stat.week}`
              
              return (
                <div key={`${stat.year}-${stat.week}`} className="bounce-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => toggleWeek(stat.year, stat.week)}
                    className={`w-full ${bgColor} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-102 active:scale-98 text-white`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-2xl font-bold mb-1">{stat.label}</div>
                        <div className="text-lg opacity-90">
                          {stat.startDate} ~ {stat.endDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-5xl font-bold">{stat.count}</div>
                          <div className="text-lg">个汉字</div>
                        </div>
                        {isExpanded ? <ChevronUp size={32} /> : <ChevronDown size={32} />}
                      </div>
                    </div>
                  </button>

                  {/* 展开的汉字列表 */}
                  {isExpanded && stat.words && stat.words.length > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-2xl p-6 bounce-in">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        📝 本周学习的汉字（{stat.words.length}个）
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {stat.words.map((word, wordIndex) => (
                          <div 
                            key={word.id}
                            className={`${bgColor} rounded-xl p-4 text-center shadow-md text-white bounce-in hover:scale-105 transition-transform`}
                            style={{ animationDelay: `${wordIndex * 0.05}s` }}
                          >
                            <div className="text-5xl font-bold mb-2">{word.word}</div>
                            {word.pinyin && <div className="text-lg opacity-90">{word.pinyin}</div>}
                            {word.meaning && <div className="text-sm opacity-80 mt-1 line-clamp-2">{word.meaning}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 统计总结 */}
      {weeklyStats.length > 0 && (
        <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-8 shadow-lg text-white text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">总计学习</h3>
          <div className="text-6xl font-bold mb-2">
            {weeklyStats.reduce((sum, stat) => sum + stat.count, 0)}
          </div>
          <p className="text-xl">个汉字</p>
          <p className="text-lg opacity-90 mt-2">跨越 {weeklyStats.length} 周</p>
        </div>
      )}
    </div>
  )
}

export default WeeklyStats

