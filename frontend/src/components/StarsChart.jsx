import React, { useState, useEffect } from 'react'
import { TrendingUp, Star, Award, BookOpen, PenTool, CheckSquare } from 'lucide-react'

const StarsChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7) // 7天或30天

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stars/daily-stats')
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('加载星星统计失败:', err)
    } finally {
      setLoading(false)
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

  // 根据period筛选数据
  const displayData = period === 7 ? data.slice(-7) : data

  // 计算最大值用于比例
  const maxValue = Math.max(...displayData.map(d => d.total), 10)

  // 计算总统计
  const totalStats = displayData.reduce((acc, day) => ({
    characters: acc.characters + day.characters,
    poems: acc.poems + day.poems,
    tasks: acc.tasks + day.tasks,
    total: acc.total + day.total
  }), { characters: 0, poems: 0, tasks: 0, total: 0 })

  return (
    <div className="space-y-6">
      {/* 标题卡片 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={32} />
            <div>
              <h2 className="text-2xl font-bold">星星获取统计</h2>
              <p className="text-sm opacity-90">每天努力都有收获</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod(7)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                period === 7
                  ? 'bg-white text-orange-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              最近7天
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                period === 30
                  ? 'bg-white text-orange-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              最近30天
            </button>
          </div>
        </div>
      </div>

      {/* 总计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Star size={28} />
            <div className="text-4xl font-bold">{totalStats.total}</div>
          </div>
          <div className="text-lg font-semibold">总获得</div>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <PenTool size={28} />
            <div className="text-4xl font-bold">{totalStats.characters}</div>
          </div>
          <div className="text-lg font-semibold">识字</div>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen size={28} />
            <div className="text-4xl font-bold">{totalStats.poems}</div>
          </div>
          <div className="text-lg font-semibold">古诗</div>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckSquare size={28} />
            <div className="text-4xl font-bold">{totalStats.tasks}</div>
          </div>
          <div className="text-lg font-semibold">任务</div>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">每日获取趋势</h3>
        
        {displayData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-2xl text-gray-400">还没有星星记录哦！</p>
            <p className="text-xl text-gray-400 mt-2">快去学习汉字、背古诗吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayData.map((day, index) => {
              const date = new Date(day.date)
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
              const percentage = (day.total / maxValue) * 100

              return (
                <div key={day.date} className="bounce-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-center gap-4">
                    {/* 日期 */}
                    <div className="w-16 text-sm font-bold text-gray-600">
                      {dateStr}
                    </div>
                    
                    {/* 柱状图 */}
                    <div className="flex-1 relative">
                      <div className="h-12 bg-gray-100 rounded-xl overflow-hidden relative">
                        {/* 总计柱子 */}
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${percentage}%` }}
                        >
                          {day.total > 0 && (
                            <span className="text-white font-bold text-sm">
                              {day.total}
                            </span>
                          )}
                        </div>
                        
                        {/* 详细分类（悬停显示） */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity bg-white bg-opacity-95 rounded-xl flex items-center justify-center gap-4 text-sm font-semibold">
                          {day.characters > 0 && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <PenTool size={16} />
                              <span>{day.characters}</span>
                            </div>
                          )}
                          {day.poems > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <BookOpen size={16} />
                              <span>{day.poems}</span>
                            </div>
                          )}
                          {day.tasks > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckSquare size={16} />
                              <span>{day.tasks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 星星图标 */}
                    <div className="w-12 flex justify-center">
                      {day.total > 0 && <Star size={20} className="text-yellow-500" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 图例说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-4">📖 图例说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <PenTool size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800">识字奖励</div>
              <div className="text-sm text-gray-600">1个汉字 = 1⭐</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800">古诗奖励</div>
              <div className="text-sm text-gray-600">1首古诗 = 5⭐</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckSquare size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800">任务奖励</div>
              <div className="text-sm text-gray-600">自定义⭐数量</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          💡 鼠标悬停在柱状图上可以查看详细分类
        </div>
      </div>
    </div>
  )
}

export default StarsChart

