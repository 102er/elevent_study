import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import WordLibrary from './components/WordLibrary'
import LearningMode from './components/LearningMode'
import SentencePractice from './components/SentencePractice'
import RewardSystem from './components/RewardSystem'
import WeeklyStats from './components/WeeklyStats'
import ReadingManagement from './components/ReadingManagement'
import TravelPlans from './components/TravelPlans'
import TravelFootprintMap from './components/TravelFootprintMap'
import PoemsManagement from './components/PoemsManagement'
import DailyTasks from './components/DailyTasks'
import MyRewards from './components/MyRewards'
import StarExchange from './components/StarExchange'
import { wordAPI, learningAPI, starAPI } from './services/api'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [words, setWords] = useState([])
  const [stars, setStars] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 从后端加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 并行加载汉字和星星数据
      const [wordsData, starsData] = await Promise.all([
        wordAPI.getAll(),
        starAPI.get()
      ])
      
      setWords(wordsData)
      setStars(starsData.stars)
    } catch (err) {
      console.error('加载数据失败:', err)
      setError('加载数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  // 添加新汉字
  const addWord = async (word) => {
    try {
      const newWord = await wordAPI.add(word)
      setWords([...words, newWord])
      return newWord
    } catch (err) {
      console.error('添加汉字失败:', err)
      alert('添加汉字失败，请重试')
      throw err
    }
  }

  // 删除汉字
  const deleteWord = async (id) => {
    try {
      await wordAPI.delete(id)
      setWords(words.filter(w => w.id !== id))
    } catch (err) {
      console.error('删除汉字失败:', err)
      alert('删除汉字失败，请重试')
      throw err
    }
  }

  // 编辑汉字
  const editWord = async (id, updatedWord) => {
    try {
      const updated = await wordAPI.update(id, updatedWord)
      setWords(words.map(w => w.id === id ? updated : w))
      return updated
    } catch (err) {
      console.error('编辑汉字失败:', err)
      alert('编辑汉字失败，请重试')
      throw err
    }
  }

  // 标记为已学习
  const markAsLearned = async (id) => {
    try {
      const result = await learningAPI.markAsLearned(id)
      
      // 更新本地状态
      setWords(words.map(w => 
        w.id === id 
          ? { ...w, learned: true, lastReviewed: new Date().toISOString() }
          : w
      ))
      setStars(result.stars)
      
      return result
    } catch (err) {
      console.error('标记学习失败:', err)
      alert('标记学习失败，请重试')
      throw err
    }
  }

  // 重置进度
  const resetProgress = async () => {
    try {
      await starAPI.reset()
      // 重新加载数据
      await loadData()
    } catch (err) {
      console.error('重置进度失败:', err)
      alert('重置进度失败，请重试')
      throw err
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌈</div>
          <div className="text-2xl font-bold text-white">加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-2xl font-bold text-gray-800 mb-4">出错了</div>
          <div className="text-lg text-gray-600 mb-6">{error}</div>
          <button
            onClick={loadData}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 左侧边栏 */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {currentView === 'dashboard' && (
            <Dashboard 
              words={words} 
              stars={stars}
              resetProgress={resetProgress}
            />
          )}
          
          {currentView === 'library' && (
            <WordLibrary 
              words={words}
              addWord={addWord}
              deleteWord={deleteWord}
              editWord={editWord}
            />
          )}
          
          {currentView === 'learning' && (
            <LearningMode 
              words={words}
              markAsLearned={markAsLearned}
            />
          )}

          {currentView === 'practice' && (
            <SentencePractice words={words} />
          )}
          
          {currentView === 'rewards' && (
            <RewardSystem stars={stars} />
          )}

          {currentView === 'reading' && (
            <ReadingManagement />
          )}

          {currentView === 'weekly' && (
            <WeeklyStats />
          )}

          {currentView === 'poems' && (
            <PoemsManagement />
          )}

          {currentView === 'travel' && (
            <TravelPlans />
          )}

          {currentView === 'travel-map' && (
            <TravelFootprintMap />
          )}

          {currentView === 'tasks' && (
            <DailyTasks />
          )}

          {currentView === 'my-rewards' && (
            <MyRewards stars={stars} onRefresh={loadData} />
          )}

          {currentView === 'star-exchange' && (
            <StarExchange stars={stars} onRefresh={loadData} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App

