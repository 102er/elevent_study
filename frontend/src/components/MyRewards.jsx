import React, { useState, useEffect } from 'react'
import { Star, Award, Trophy, Crown, Sparkles, Zap, TrendingUp, History } from 'lucide-react'

const MyRewards = ({ stars, onRefresh }) => {
  const [stats, setStats] = useState(null)
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, redemptionsData] = await Promise.all([
        fetch('/api/star-redemptions/stats').then(r => r.json()),
        fetch('/api/star-redemptions').then(r => r.json())
      ])
      setStats(statsData)
      setRedemptions(redemptionsData.filter(r => r.status === 'completed'))
    } catch (err) {
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const achievements = [
    { 
      title: '初学者', 
      description: '学会第1个汉字', 
      threshold: 1, 
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      emoji: '🌟'
    },
    { 
      title: '勤奋宝贝', 
      description: '学会50个汉字', 
      threshold: 50, 
      icon: Award,
      color: 'from-green-400 to-green-600',
      emoji: '🏅'
    },
    { 
      title: '识字小能手', 
      description: '学会100个汉字', 
      threshold: 100, 
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-600',
      emoji: '🏆'
    },
    { 
      title: '汉字大师', 
      description: '学会300个汉字', 
      threshold: 300, 
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      emoji: '👑'
    },
    { 
      title: '超级学霸', 
      description: '学会600个汉字', 
      threshold: 600, 
      icon: Sparkles,
      color: 'from-pink-400 to-pink-600',
      emoji: '✨'
    },
    { 
      title: '识字王者', 
      description: '学会1000个汉字', 
      threshold: 1000, 
      icon: Zap,
      color: 'from-orange-400 to-orange-600',
      emoji: '⚡'
    },
    { 
      title: '终极目标', 
      description: '学会1500个汉字', 
      threshold: 1500, 
      icon: Crown,
      color: 'from-red-400 to-red-600',
      emoji: '🎯'
    },
  ]

  const getLevel = () => {
    if (stars >= 1500) return { name: '终极目标', color: 'text-red-500', emoji: '🎯' }
    if (stars >= 1000) return { name: '识字王者', color: 'text-orange-500', emoji: '⚡' }
    if (stars >= 600) return { name: '超级学霸', color: 'text-pink-500', emoji: '✨' }
    if (stars >= 300) return { name: '汉字大师', color: 'text-purple-500', emoji: '👑' }
    if (stars >= 100) return { name: '识字小能手', color: 'text-yellow-500', emoji: '🏆' }
    if (stars >= 50) return { name: '勤奋宝贝', color: 'text-green-500', emoji: '🏅' }
    if (stars >= 1) return { name: '初学者', color: 'text-blue-500', emoji: '🌟' }
    return { name: '新手', color: 'text-gray-500', emoji: '🔰' }
  }

  const level = getLevel()
  const nextAchievement = achievements.find(a => a.threshold > stars) || achievements[achievements.length - 1]
  const progressToNext = nextAchievement ? Math.min((stars / nextAchievement.threshold) * 100, 100) : 100

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">⭐</div>
        <div className="text-2xl font-bold text-gray-800">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 星星总数卡片 */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-12 shadow-2xl text-center bounce-in">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-3xl font-bold text-white mb-2">我的星星</h2>
        <div className="text-8xl font-bold text-white mb-4">{stars}</div>
        <div className={`text-3xl font-bold ${level.color} bg-white px-8 py-4 rounded-2xl inline-block`}>
          {level.emoji} {level.name}
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={32} />
              <div className="text-4xl font-bold">{stats.totalStarsEarned}</div>
            </div>
            <div className="text-lg opacity-90">累计获得星星</div>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Award size={32} />
              <div className="text-4xl font-bold">{stats.totalStarsSpent}</div>
            </div>
            <div className="text-lg opacity-90">已兑换星星</div>
          </div>
          <div className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <History size={32} />
              <div className="text-4xl font-bold">{stats.totalRedemptions}</div>
            </div>
            <div className="text-lg opacity-90">兑换次数</div>
          </div>
        </div>
      )}

      {/* 下一个成就进度 */}
      {stars < 1500 && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">下一个成就</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{nextAchievement.emoji}</div>
            <div className="flex-1">
              <div className="font-bold text-xl text-gray-800">{nextAchievement.title}</div>
              <div className="text-gray-600">{nextAchievement.description}</div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {stars}/{nextAchievement.threshold}⭐
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 成就列表 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">我的成就</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            const isUnlocked = stars >= achievement.threshold
            
            return (
              <div 
                key={index}
                className={`
                  rounded-2xl p-6 shadow-md transition-all
                  ${isUnlocked 
                    ? `bg-gradient-to-r ${achievement.color} text-white bounce-in` 
                    : 'bg-gray-100 text-gray-400 opacity-50'
                  }
                `}
                style={isUnlocked ? { animationDelay: `${index * 0.1}s` } : {}}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{achievement.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-xl">{achievement.title}</h4>
                      {isUnlocked && <Icon size={20} />}
                    </div>
                    <p className={`text-sm ${isUnlocked ? 'opacity-90' : ''}`}>
                      {achievement.description}
                    </p>
                    <p className="text-sm mt-2 font-semibold">
                      需要 {achievement.threshold} ⭐
                    </p>
                  </div>
                  {isUnlocked && (
                    <div className="text-3xl">✓</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 兑换历史 */}
      {redemptions.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <History size={28} />
            兑换历史
          </h3>
          <div className="space-y-3">
            {redemptions.map((redemption, index) => (
              <div 
                key={redemption.id}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 flex items-center justify-between bounce-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{redemption.itemIcon}</div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">{redemption.itemName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(redemption.redeemedAt).toLocaleString('zh-CN')}
                    </div>
                    {redemption.notes && (
                      <div className="text-sm text-gray-600 mt-1">{redemption.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-orange-600 font-bold text-xl">
                  <Star size={24} />
                  <span>-{redemption.starsSpent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 激励卡片 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-lg text-center">
        <div className="text-5xl mb-4">🎈</div>
        <h3 className="text-2xl font-bold text-white mb-2">继续加油！</h3>
        <p className="text-xl text-white opacity-90">
          通过学习、旅行、任务获得更多星星！
        </p>
        <p className="text-lg text-white opacity-75 mt-2">
          目标：收集 1500 颗星星 🎯
        </p>
      </div>
    </div>
  )
}

export default MyRewards

