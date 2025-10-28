import React from 'react'
import { Star, Award, Trophy, Crown, Sparkles, Zap } from 'lucide-react'

const RewardSystem = ({ stars }) => {
  const achievements = [
    { 
      title: '初学者', 
      description: '学会第一个汉字', 
      threshold: 10, 
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      emoji: '🌟'
    },
    { 
      title: '勤奋宝贝', 
      description: '学会5个汉字', 
      threshold: 50, 
      icon: Award,
      color: 'from-green-400 to-green-600',
      emoji: '🏅'
    },
    { 
      title: '识字小能手', 
      description: '学会10个汉字', 
      threshold: 100, 
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-600',
      emoji: '🏆'
    },
    { 
      title: '汉字大师', 
      description: '学会20个汉字', 
      threshold: 200, 
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      emoji: '👑'
    },
    { 
      title: '超级学霸', 
      description: '学会30个汉字', 
      threshold: 300, 
      icon: Sparkles,
      color: 'from-pink-400 to-pink-600',
      emoji: '✨'
    },
    { 
      title: '识字王者', 
      description: '学会50个汉字', 
      threshold: 500, 
      icon: Zap,
      color: 'from-orange-400 to-orange-600',
      emoji: '⚡'
    },
  ]

  const getLevel = () => {
    if (stars >= 500) return { name: '识字王者', color: 'text-orange-500', emoji: '⚡' }
    if (stars >= 300) return { name: '超级学霸', color: 'text-pink-500', emoji: '✨' }
    if (stars >= 200) return { name: '汉字大师', color: 'text-purple-500', emoji: '👑' }
    if (stars >= 100) return { name: '识字小能手', color: 'text-yellow-500', emoji: '🏆' }
    if (stars >= 50) return { name: '勤奋宝贝', color: 'text-green-500', emoji: '🏅' }
    if (stars >= 10) return { name: '初学者', color: 'text-blue-500', emoji: '🌟' }
    return { name: '新手', color: 'text-gray-500', emoji: '🔰' }
  }

  const level = getLevel()
  const nextAchievement = achievements.find(a => a.threshold > stars) || achievements[achievements.length - 1]
  const progressToNext = nextAchievement ? Math.min((stars / nextAchievement.threshold) * 100, 100) : 100

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

      {/* 下一个成就进度 */}
      {stars < 500 && (
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

      {/* 激励卡片 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-lg text-center">
        <div className="text-5xl mb-4">🎈</div>
        <h3 className="text-2xl font-bold text-white mb-2">继续加油！</h3>
        <p className="text-xl text-white opacity-90">
          每学会一个汉字就能获得 10 颗星星哦！
        </p>
      </div>
    </div>
  )
}

export default RewardSystem
