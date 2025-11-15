import React, { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, Award } from 'lucide-react'

const TravelFootprintMap = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalStars, setTotalStars] = useState(0)

  useEffect(() => {
    loadPlans()
    loadStars()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/travel-plans')
      const data = await response.json()
      // 只显示已完成的旅行
      setPlans(data.filter(p => p.isCompleted))
    } catch (err) {
      console.error('加载旅行足迹失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStars = async () => {
    try {
      const response = await fetch('/api/stars')
      const data = await response.json()
      setTotalStars(data.stars || 0)
    } catch (err) {
      console.error('加载星星总数失败:', err)
    }
  }

  // 计算总统计
  const totalDestinations = plans.length
  const totalExpense = plans.reduce((sum, p) => sum + (p.totalExpense || 0), 0)

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题卡片 */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-lg text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🗺️</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">我们的旅行足迹</h2>
              <p className="text-lg opacity-90">记录一家三口的美好回忆</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{totalDestinations}</div>
            <div className="text-sm opacity-90">个目的地</div>
          </div>
        </div>

        {/* 三个小人 */}
        <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-8 mb-4">
            {/* 爸爸 */}
            <div className="text-center transform hover:scale-110 transition-all cursor-pointer">
              <div className="w-24 h-24 bg-blue-400 rounded-full flex items-center justify-center text-4xl mb-2 shadow-lg border-4 border-white">
                👨
              </div>
              <div className="font-bold text-white">爸爸</div>
              <div className="text-sm opacity-90">旅行队长</div>
            </div>

            {/* 妈妈 */}
            <div className="text-center transform hover:scale-110 transition-all cursor-pointer">
              <div className="w-24 h-24 bg-pink-400 rounded-full flex items-center justify-center text-4xl mb-2 shadow-lg border-4 border-white">
                👩
              </div>
              <div className="font-bold text-white">妈妈</div>
              <div className="text-sm opacity-90">后勤部长</div>
            </div>

            {/* 宝宝 */}
            <div className="text-center transform hover:scale-110 transition-all cursor-pointer">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl mb-2 shadow-lg border-4 border-white">
                👶
              </div>
              <div className="font-bold text-white">宝宝</div>
              <div className="text-sm opacity-90">快乐源泉</div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">¥{totalExpense.toFixed(0)}</div>
              <div className="text-sm opacity-90">总旅行花费</div>
            </div>
          </div>
        </div>
      </div>

      {/* 旅行线路图 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <MapPin size={28} className="text-red-500" />
          旅行线路图
        </h3>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧳</div>
            <p className="text-2xl text-gray-400">还没有完成的旅行哦！</p>
            <p className="text-xl text-gray-400 mt-2">快去"旅行计划"添加并完成旅行吧！</p>
          </div>
        ) : (
          <div className="relative">
            {/* 连接线 */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300"></div>

            {/* 旅行列表 */}
            <div className="space-y-6">
              {plans.map((plan, index) => (
                <div 
                  key={plan.id}
                  className="relative pl-20 bounce-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 位置标记 */}
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white z-10">
                    📍
                  </div>

                  {/* 旅行卡片 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-800 mb-2">
                          {plan.destination}
                        </h4>
                        {(plan.startDate || plan.endDate) && (
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <Calendar size={18} />
                            <span>
                              {plan.startDate && new Date(plan.startDate).toLocaleDateString('zh-CN')}
                              {plan.startDate && plan.endDate && ' - '}
                              {plan.endDate && new Date(plan.endDate).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        )}
                        {plan.notes && (
                          <p className="text-gray-600 text-sm mt-2">{plan.notes}</p>
                        )}
                      </div>

                      {/* 徽章 */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
                          <Award size={16} />
                          已完成
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.completedAt && new Date(plan.completedAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-sm text-gray-500 mb-1">预算</div>
                        <div className="text-lg font-bold text-blue-600">¥{plan.budget}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-sm text-gray-500 mb-1">实际花费</div>
                        <div className="text-lg font-bold text-orange-600">¥{plan.totalExpense}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-sm text-gray-500 mb-1">节省</div>
                        <div className={`text-lg font-bold ${
                          plan.budget - plan.totalExpense >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ¥{(plan.budget - plan.totalExpense).toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* 家庭成员标记 */}
                    <div className="mt-4 flex items-center gap-2 bg-white rounded-xl p-3">
                      <Users size={20} className="text-purple-600" />
                      <span className="text-sm text-gray-600">参与成员：</span>
                      <div className="flex gap-1">
                        <span className="text-xl">👨</span>
                        <span className="text-xl">👩</span>
                        <span className="text-xl">👶</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 成就卡片 */}
      {plans.length > 0 && (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl p-8 shadow-lg text-center text-white">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold mb-2">旅行成就</h3>
          <p className="text-xl mb-4">
            一家三口一起走过了 <span className="text-3xl font-bold">{totalDestinations}</span> 个地方！
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <div className="text-3xl mb-2">🌍</div>
              <div className="font-bold text-lg">探索家庭</div>
              <div className="text-sm opacity-90">足迹遍布各地</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold text-lg">理财小能手</div>
              <div className="text-sm opacity-90">记录每一笔花费</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-bold text-lg">星星收集者</div>
              <div className="text-sm opacity-90">获得 {totalStars} 颗星星</div>
            </div>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
          <MapPin size={20} className="text-red-500" />
          关于旅行足迹
        </h3>
        <ul className="text-gray-600 space-y-1">
          <li>• 显示一家三口已完成的所有旅行</li>
          <li>• 按时间顺序展示旅行线路</li>
          <li>• 记录每次旅行的预算、花费和获得的星星</li>
          <li>• 在"旅行计划"中完成旅行后，会自动显示在这里</li>
        </ul>
      </div>
    </div>
  )
}

export default TravelFootprintMap

