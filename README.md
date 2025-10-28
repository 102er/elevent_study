# 🌈 儿童识字乐园

一个专为儿童设计的识字进度表管理web平台，具有色彩丰富、界面友好、易于操作的特点。

## 🏗️ 技术架构

### 前端
- **React 18** + **Vite** - 现代化的前端框架和构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Lucide React** - 精美的图标库
- **Nginx** - 高性能Web服务器

### 后端
- **Python 3.11** + **Flask** - 轻量级Web框架
- **Flask-SQLAlchemy** - ORM数据库操作
- **Flask-CORS** - 跨域资源共享

### 数据库
- **MySQL 8.0** - 关系型数据库
- UTF8MB4字符集支持

### 部署
- **Docker** + **Docker Compose** - 容器化部署
- **Linux** - 生产环境服务器

## ✨ 功能特性

### 🎯 核心功能
- **学习看板**：直观显示学习进度、已学汉字数量和获得的星星奖励
- **汉字库管理**：轻松添加、编辑、删除汉字，每个汉字包含字、拼音、意思
- **学习模式**：卡片式学习，支持翻看答案和标记学习状态
- **奖励系统**：星星积分系统，解锁多个成就徽章

### 🎨 儿童友好设计
- **色彩丰富**：使用明亮、活泼的颜色搭配
- **大字体**：易于阅读的超大字体显示
- **趣味动画**：学习成功时的庆祝动画和星星特效
- **简单操作**：大按钮设计，易于点击和操作
- **成就系统**：通过等级和徽章激励持续学习

### 📊 周统计功能（新增）
- **当前周统计**：实时显示本周学习的汉字数量
- **历史周统计**：按周查看历史学习记录
- **周汉字详情**：查看每周具体学习了哪些汉字
- **学习总结**：统计总学习汉字数和学习周数

### 🏆 成就系统
- 🌟 初学者（10星）
- 🏅 勤奋宝贝（50星）
- 🏆 识字小能手（100星）
- 👑 汉字大师（200星）
- ✨ 超级学霸（300星）
- ⚡ 识字王者（500星）

## 🚀 快速开始

### 方式一：Docker部署（推荐）

适用于生产环境，在Linux服务器上一键部署。

```bash
# 1. 克隆代码
git clone <repository-url>
cd eleven_study

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件，设置MySQL密码

# 3. 启动所有服务
docker compose up -d

# 4. 访问应用
# 浏览器打开: http://your-server-ip/
```

详细部署文档请查看：[DEPLOYMENT.md](./DEPLOYMENT.md)

### 方式二：本地开发

#### 前端开发

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

#### 后端开发

```bash
cd backend
pip install -r requirements.txt
python app.py
# API运行在 http://localhost:5000
```

#### 数据库配置

确保MySQL已安装并运行，然后执行：

```bash
mysql -u root -p < init.sql
```

## 📱 使用说明

### 1. 学习看板
- 查看整体学习进度
- 查看已学汉字数量
- 查看获得的星星总数
- 查看最近学习的汉字

### 2. 汉字库
- 点击"添加新汉字"按钮添加汉字
- 填写汉字、拼音和意思
- 鼠标悬停在汉字卡片上可以编辑或删除
- 已学会的汉字会显示"✓ 已学会"标记

### 3. 开始学习
- 按顺序学习未掌握的汉字
- 点击"显示答案"查看拼音和意思
- 学会后点击"学会了！"按钮获得星星奖励
- 使用"上一个"/"下一个"按钮切换汉字

### 4. 周统计（新增）
- 查看本周学习统计
- 浏览历史各周的学习记录
- 点击展开查看每周学习的具体汉字
- 查看总学习汉字数统计

### 5. 我的奖励
- 查看获得的星星总数
- 查看当前等级
- 查看已解锁和未解锁的成就
- 追踪下一个成就的进度

## 🛠️ 技术栈详情

### 前端技术
- **React 18**：现代化的UI库
- **Vite 5**：极速的开发构建工具
- **Tailwind CSS 3**：实用优先的CSS框架
- **Lucide React**：精美的图标库
- **Nginx**：生产环境Web服务器

### 后端技术
- **Python 3.11**：现代Python版本
- **Flask 3.0**：轻量级Web框架
- **Flask-SQLAlchemy**：数据库ORM
- **Flask-CORS**：跨域支持
- **PyMySQL**：MySQL数据库驱动

### 数据库
- **MySQL 8.0**：企业级关系型数据库
- **UTF8MB4**：完整Unicode支持

### DevOps
- **Docker**：应用容器化
- **Docker Compose**：多容器编排
- **Git**：版本控制

## 📂 项目结构

```
eleven_study/
├── frontend/                    # 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # 头部导航组件
│   │   │   ├── Dashboard.jsx       # 学习看板组件
│   │   │   ├── WordLibrary.jsx     # 汉字库管理组件
│   │   │   ├── LearningMode.jsx    # 学习模式组件
│   │   │   ├── RewardSystem.jsx    # 奖励系统组件
│   │   │   └── WeeklyStats.jsx     # 周统计组件（新增）
│   │   ├── services/
│   │   │   └── api.js              # API请求封装
│   │   ├── App.jsx                 # 主应用组件
│   │   ├── main.jsx                # 入口文件
│   │   ├── config.js               # 配置文件
│   │   └── index.css               # 全局样式
│   ├── Dockerfile                  # 前端Docker配置
│   ├── nginx.conf                  # Nginx配置
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                     # 后端API
│   ├── app.py                      # Flask应用主文件
│   ├── requirements.txt            # Python依赖
│   ├── Dockerfile                  # 后端Docker配置
│   └── config.example.env          # 环境变量示例
├── docker-compose.yml           # Docker编排配置
├── init.sql                     # 数据库初始化脚本
├── DEPLOYMENT.md                # 部署文档
└── README.md                    # 项目说明
```

## 🎨 自定义配置

### 修改颜色主题

在 `tailwind.config.js` 中修改颜色配置：

```javascript
colors: {
  'kid-blue': '#4FC3F7',
  'kid-pink': '#F06292',
  'kid-yellow': '#FFD54F',
  'kid-green': '#81C784',
  'kid-purple': '#BA68C8',
  'kid-orange': '#FFB74D',
}
```

### 修改奖励规则

在 `src/App.jsx` 中的 `markAsLearned` 函数修改星星奖励数量：

```javascript
setStars(stars + 10) // 每学会一个字奖励10颗星
```

### 添加默认汉字

在 `src/App.jsx` 的 `useEffect` 中修改默认汉字列表。

## 💾 数据存储

### 生产环境（Docker部署）
所有数据存储在MySQL数据库中，包括：
- **words表**：汉字库（汉字、拼音、意思）
- **learning_records表**：学习记录（按周统计）
- **star_records表**：星星积分

数据持久化通过Docker数据卷实现，重启容器不会丢失数据。

### 开发环境
开发时前端可独立运行，数据临时存储在LocalStorage中。

## 🔌 API接口

### 汉字管理
- `GET /api/words` - 获取所有汉字
- `POST /api/words` - 添加新汉字
- `PUT /api/words/:id` - 更新汉字
- `DELETE /api/words/:id` - 删除汉字

### 学习记录
- `POST /api/learn/:id` - 标记汉字为已学习

### 星星管理
- `GET /api/stars` - 获取星星数量
- `POST /api/stars/reset` - 重置进度

### 周统计
- `GET /api/weekly-stats` - 获取所有周统计
- `GET /api/weekly-words/:year/:week` - 获取指定周的汉字
- `GET /api/current-week` - 获取当前周统计

### 系统
- `GET /api/health` - 健康检查

## 📝 后续开发建议

1. **音频功能**：为每个汉字添加发音音频
2. **打印功能**：支持打印学习进度报告
3. **多用户支持**：支持多个儿童账号管理
4. **学习提醒**：添加每日学习提醒功能
5. **导入导出**：支持汉字库的批量导入导出
6. **学习计划**：制定个性化学习计划
7. **家长监控**：家长端查看学习进度

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

💖 专为儿童打造，让学习变得更有趣！

