import React, { useState } from 'react'
import { BookOpen, Library, GraduationCap, Star, Calendar, Book, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Menu, PenTool, Plane, FileText, CheckSquare, Gift, Award, MapPin, TrendingUp } from 'lucide-react'

const Sidebar = ({ currentView, setCurrentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSection, setExpandedSection] = useState('literacy')

  // 菜单配置
  const menuSections = [
    {
      id: 'literacy',
      title: '儿童识字',
      icon: BookOpen,
      items: [
        { id: 'dashboard', label: '学习看板', icon: BookOpen },
        { id: 'library', label: '汉字库', icon: Library },
        { id: 'learning', label: '开始学习', icon: GraduationCap },
        { id: 'practice', label: '汉字练习', icon: PenTool },
        { id: 'weekly', label: '周统计', icon: Calendar },
      ]
    },
    {
      id: 'reading',
      title: '快乐阅读',
      icon: Book,
      items: [
        { id: 'reading', label: '阅读记录', icon: Book },
      ]
    },
    {
      id: 'poems',
      title: '古诗词',
      icon: FileText,
      items: [
        { id: 'poems', label: '古诗背诵', icon: FileText },
      ]
    },
    {
      id: 'life',
      title: '生活记录',
      icon: Sparkles,
      items: [
        { id: 'travel', label: '旅行计划', icon: Plane },
        { id: 'travel-map', label: '旅行足迹', icon: MapPin },
        { id: 'tasks', label: '日常任务', icon: CheckSquare },
      ]
    },
          {
            id: 'rewards',
            title: '我的奖励',
            icon: Award,
            items: [
              { id: 'my-rewards', label: '成就徽章', icon: Star },
              { id: 'stars-chart', label: '星星统计', icon: TrendingUp },
              { id: 'star-exchange', label: '星星兑换', icon: Gift },
            ]
          }
  ]

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <div 
      className={`
        bg-gradient-to-b from-purple-600 to-pink-600 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        min-h-screen flex flex-col shadow-2xl
      `}
    >
      {/* 顶部标题区 */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-white animate-fade-in">
              <Sparkles size={24} className="text-yellow-300" />
              <h1 className="text-xl font-bold">学习乐园</h1>
            </div>
          )}
          {isCollapsed && (
            <Menu size={24} className="text-white mx-auto" />
          )}
        </div>
      </div>

      {/* 菜单区域 */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuSections.map((section) => {
          const SectionIcon = section.icon
          const isExpanded = expandedSection === section.id
          
          return (
            <div key={section.id} className="mb-2">
              {/* 一级菜单 */}
              <button
                onClick={() => !isCollapsed && toggleSection(section.id)}
                className={`
                  w-full px-4 py-3 flex items-center justify-between
                  text-white hover:bg-white/10 transition-all
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <SectionIcon size={20} />
                  {!isCollapsed && (
                    <span className="font-semibold">{section.title}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                )}
              </button>

              {/* 二级菜单 */}
              {!isCollapsed && isExpanded && (
                <div className="bg-white/5 animate-slide-down">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon
                    const isActive = currentView === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`
                          w-full px-8 py-2.5 flex items-center gap-3
                          text-white/90 hover:bg-white/10 transition-all
                          ${isActive ? 'bg-white/20 font-semibold border-l-4 border-yellow-300' : ''}
                        `}
                      >
                        <ItemIcon size={18} />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 折叠状态下点击一级菜单的项 */}
              {isCollapsed && (
                <div className="absolute left-16 top-0 hidden group-hover:block bg-purple-700 rounded-r-lg shadow-xl z-50">
                  <div className="p-2 min-w-[150px]">
                    <div className="font-semibold text-white mb-2 px-2">{section.title}</div>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          className="w-full px-2 py-1.5 flex items-center gap-2 text-white/90 hover:bg-white/10 rounded text-sm"
                        >
                          <ItemIcon size={16} />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 底部折叠按钮 */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full py-2 flex items-center justify-center gap-2 text-white hover:bg-white/10 rounded-lg transition-all"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span className="text-sm">收起菜单</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
