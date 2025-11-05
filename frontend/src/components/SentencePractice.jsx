import React, { useState, useEffect } from 'react'
import { BookOpen, Check, X, Lightbulb, RefreshCw, Award } from 'lucide-react'

const SentencePractice = ({ words }) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [userInput, setUserInput] = useState([])
  const [showHint, setShowHint] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [availableSentences, setAvailableSentences] = useState([])

  // 预设的句子模板（使用常见汉字）
  const sentenceTemplates = [
    { sentence: '今天天气很好', words: ['今', '天', '气', '很', '好'] },
    { sentence: '我爱学习汉字', words: ['我', '爱', '学', '习', '汉', '字'] },
    { sentence: '太阳从东方升起', words: ['太', '阳', '从', '东', '方', '升', '起'] },
    { sentence: '小鸟在天上飞', words: ['小', '鸟', '在', '天', '上', '飞'] },
    { sentence: '我喜欢读书', words: ['我', '喜', '欢', '读', '书'] },
    { sentence: '月亮很圆很亮', words: ['月', '亮', '很', '圆', '亮'] },
    { sentence: '花儿开得很美', words: ['花', '儿', '开', '得', '很', '美'] },
    { sentence: '水从山上流下来', words: ['水', '从', '山', '上', '流', '下', '来'] },
    { sentence: '我爱我的家', words: ['我', '爱', '我', '的', '家'] },
    { sentence: '星星在夜空闪烁', words: ['星', '在', '夜', '空', '闪', '烁'] },
    { sentence: '春天来了很温暖', words: ['春', '天', '来', '了', '很', '温', '暖'] },
    { sentence: '大树长得很高', words: ['大', '树', '长', '得', '很', '高'] },
    { sentence: '小朋友在玩耍', words: ['小', '朋', '友', '在', '玩', '耍'] },
    { sentence: '妈妈给我做饭', words: ['妈', '给', '我', '做', '饭'] },
    { sentence: '风吹树叶沙沙响', words: ['风', '吹', '树', '叶', '沙', '响'] },
  ]

  // 根据已学汉字筛选可用的句子
  useEffect(() => {
    const learnedWords = words.filter(w => w.learned).map(w => w.word)
    
    if (learnedWords.length === 0) {
      setAvailableSentences([])
      return
    }

    // 计算已学汉字的总数
    const totalLearnedChars = learnedWords.length

    // 找出至少包含3个已学汉字的句子
    const available = sentenceTemplates.filter(template => {
      const matchedWords = template.words.filter(w => learnedWords.includes(w))
      return matchedWords.length >= Math.min(3, template.words.length)
    })

    setAvailableSentences(available)
    setCurrentSentenceIndex(0)
    setUserInput([])
    setIsCorrect(null)
  }, [words])

  const currentSentence = availableSentences[currentSentenceIndex]

  const handleCharClick = (char) => {
    if (isCorrect !== null) return // 已经检查过答案，不能再选择

    setUserInput([...userInput, char])
  }

  const handleRemoveLast = () => {
    if (isCorrect !== null) return
    setUserInput(userInput.slice(0, -1))
  }

  const handleCheck = () => {
    if (userInput.length === 0) return

    const userAnswer = userInput.join('')
    const correct = userAnswer === currentSentence.sentence

    setIsCorrect(correct)
    
    if (correct) {
      setCompletedCount(completedCount + 1)
      // 1秒后自动进入下一题
      setTimeout(() => {
        handleNext()
      }, 1500)
    }
  }

  const handleNext = () => {
    const nextIndex = (currentSentenceIndex + 1) % availableSentences.length
    setCurrentSentenceIndex(nextIndex)
    setUserInput([])
    setIsCorrect(null)
    setShowHint(false)
  }

  const handleReset = () => {
    setUserInput([])
    setIsCorrect(null)
    setShowHint(false)
  }

  const learnedCount = words.filter(w => w.learned).length

  if (learnedCount === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-6">📝</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">汉字练习</h2>
        <p className="text-xl text-gray-600 mb-2">还没有学习过任何汉字哦！</p>
        <p className="text-lg text-gray-500">先去"开始学习"学几个汉字吧！</p>
      </div>
    )
  }

  if (learnedCount < 30) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">汉字练习</h2>
        <p className="text-xl text-gray-600 mb-2">学过的汉字还不够多</p>
        <p className="text-lg text-gray-500">
          已学习 <span className="font-bold text-purple-600">{learnedCount}</span> 个汉字，
          再学 <span className="font-bold text-red-600">{30 - learnedCount}</span> 个就可以开启句子练习啦！🎉
        </p>
        <div className="mt-6 w-full max-w-md mx-auto">
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${(learnedCount / 30) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round((learnedCount / 30) * 100)}% 完成</p>
        </div>
      </div>
    )
  }

  if (availableSentences.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="text-6xl mb-6">📚</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">汉字练习</h2>
        <p className="text-xl text-gray-600 mb-2">暂时没有合适的句子练习</p>
        <p className="text-lg text-gray-500">继续学习更多汉字来解锁更多练习吧！</p>
      </div>
    )
  }

  // 获取已学过的汉字作为选项
  const learnedChars = words.filter(w => w.learned).map(w => ({
    word: w.word,
    pinyin: w.pinyin
  }))

  // 打乱汉字顺序（为了增加难度）
  const shuffledChars = [...learnedChars].sort(() => Math.random() - 0.5)

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <div>
              <h2 className="text-2xl font-bold">汉字组句练习</h2>
              <p className="text-sm opacity-90">用学过的汉字组成句子</p>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2">
              <Award size={24} />
              <span className="text-3xl font-bold">{completedCount}</span>
            </div>
            <div className="text-sm opacity-90">完成题数</div>
          </div>
        </div>
      </div>

      {/* 主练习区 */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-700">
              第 {currentSentenceIndex + 1} / {availableSentences.length} 题
            </h3>
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all"
            >
              <Lightbulb size={20} />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
          </div>

          {/* 提示区 */}
          {showHint && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-4 bounce-in">
              <p className="text-lg text-gray-700">
                <span className="font-bold text-yellow-700">提示：</span>
                {currentSentence.sentence}
              </p>
            </div>
          )}

          {/* 答案展示区 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 min-h-[120px] flex items-center justify-center">
            {userInput.length === 0 ? (
              <p className="text-2xl text-gray-400">请点击下方汉字组成句子</p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {userInput.map((char, index) => (
                  <div
                    key={index}
                    className={`
                      text-5xl font-bold px-4 py-2 rounded-xl shadow-md
                      ${isCorrect === true ? 'bg-green-400 text-white' : ''}
                      ${isCorrect === false ? 'bg-red-400 text-white' : ''}
                      ${isCorrect === null ? 'bg-white text-purple-700' : ''}
                      transition-all
                    `}
                  >
                    {char}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 结果提示 */}
          {isCorrect === true && (
            <div className="mt-4 bg-green-100 border-2 border-green-400 rounded-2xl p-4 text-center bounce-in">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Check size={32} />
                <span className="text-2xl font-bold">太棒了！答对了！🎉</span>
              </div>
            </div>
          )}

          {isCorrect === false && (
            <div className="mt-4 bg-red-100 border-2 border-red-400 rounded-2xl p-4 text-center bounce-in">
              <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                <X size={32} />
                <span className="text-2xl font-bold">再试一次吧！</span>
              </div>
              <p className="text-lg text-gray-600">
                正确答案：<span className="font-bold text-gray-800">{currentSentence.sentence}</span>
              </p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleRemoveLast}
            disabled={userInput.length === 0 || isCorrect !== null}
            className="flex-1 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X size={24} />
            删除
          </button>
          <button
            onClick={handleReset}
            disabled={isCorrect !== null}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw size={24} />
            重置
          </button>
          {isCorrect === null ? (
            <button
              onClick={handleCheck}
              disabled={userInput.length === 0}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={24} />
              检查答案
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw size={24} />
              下一题
            </button>
          )}
        </div>

        {/* 汉字选择区 */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-3">选择汉字：</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {shuffledChars.map((char, index) => (
              <button
                key={index}
                onClick={() => handleCharClick(char.word)}
                disabled={isCorrect !== null}
                className="bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bounce-in"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className="text-4xl font-bold text-purple-700">{char.word}</div>
                {char.pinyin && (
                  <div className="text-xs text-gray-600 mt-1">{char.pinyin}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-500" />
          练习说明
        </h3>
        <ul className="text-gray-600 space-y-1">
          <li>• 点击下方的汉字，按照提示组成完整的句子</li>
          <li>• 可以点击"显示提示"查看正确答案</li>
          <li>• 点击"删除"可以移除最后一个选择的汉字</li>
          <li>• 答对后会自动进入下一题</li>
        </ul>
      </div>
    </div>
  )
}

export default SentencePractice

