import React, { useState } from 'react'
import { Star, Award, Trophy, Crown, Sparkles, Zap, BookOpen, PenTool, Plane, DollarSign, List, Info } from 'lucide-react'

const RewardSystem = ({ stars }) => {
  const [showRules, setShowRules] = useState(false)
  
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

      {/* 星星奖励规则按钮 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowRules(!showRules)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Info size={28} />
          {showRules ? '收起规则' : '查看星星奖励规则'}
        </button>
      </div>

      {/* 星星奖励规则 */}
      {showRules && (
        <div className="bg-white rounded-3xl p-8 shadow-lg bounce-in">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">⭐ 星星奖励规则 ⭐</h3>
          
          <div className="space-y-6">
            {/* 识字奖励 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <PenTool size={32} className="text-purple-600" />
                <h4 className="text-2xl font-bold text-gray-800">识字奖励</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    <span className="text-lg font-semibold text-gray-700">学会一个汉字</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 font-bold text-xl">
                    <Star size={24} />
                    <span>+1 颗星</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 古诗奖励 */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen size={32} className="text-orange-600" />
                <h4 className="text-2xl font-bold text-gray-800">古诗奖励</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📖</span>
                    <span className="text-lg font-semibold text-gray-700">背会一首古诗</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 font-bold text-xl">
                    <Star size={24} />
                    <span>+5 颗星</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 旅行足迹奖励 */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Plane size={32} className="text-blue-600" />
                <h4 className="text-2xl font-bold text-gray-800">旅行足迹奖励</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">💰</span>
                    <span className="text-lg font-semibold text-gray-700">记录旅行花费</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 font-bold text-xl">
                    <DollarSign size={24} />
                    <span>1元 = 1颗星</span>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-xl p-3 text-sm text-gray-700">
                  <p>💡 <strong>举例：</strong>旅行花了100元，就能获得100颗星星！</p>
                </div>
              </div>
            </div>

            {/* 日常任务奖励 */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <List size={32} className="text-green-600" />
                <h4 className="text-2xl font-bold text-gray-800">日常任务奖励</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <span className="text-lg font-semibold text-gray-700">完成日常任务</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 font-bold text-xl">
                    <Star size={24} />
                    <span>自定义星星数</span>
                  </div>
                </div>
                <div className="bg-green-100 rounded-xl p-3 text-sm text-gray-700">
                  <p>💡 <strong>说明：</strong>每个任务可以设置不同的星星奖励，完成任务即可获得相应星星！</p>
                  <p className="mt-1">例如：小小主持人 +10⭐、扫地 +5⭐</p>
                </div>
              </div>
            </div>

            {/* 总结卡片 */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-4 border-yellow-400">
              <div className="text-center">
                <div className="text-4xl mb-3">🌟</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">星星获取途径总结</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl mb-1">📝</div>
                    <div className="font-bold text-purple-600">学汉字</div>
                    <div className="text-xs text-gray-600">1字=1星</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl mb-1">📖</div>
                    <div className="font-bold text-orange-600">背古诗</div>
                    <div className="text-xs text-gray-600">1首=5星</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl mb-1">✈️</div>
                    <div className="font-bold text-blue-600">旅行足迹</div>
                    <div className="text-xs text-gray-600">1元=1星</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="font-bold text-green-600">做任务</div>
                    <div className="text-xs text-gray-600">自定义</div>
                  </div>
                </div>
              </div>
            </div>
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

export default RewardSystem
