# 🌈 学习乐园

一个为儿童设计的学习管理平台，包含识字学习和阅读记录两大模块。

## ✨ 主要特性

### 📚 儿童识字模块
- **学习看板** - 查看整体学习进度和统计
- **汉字库** - 管理所有汉字（添加、编辑、删除）
- **开始学习** - 学习新汉字，获得星星奖励
- **汉字练习** - 用学过的汉字组成句子进行练习 🆕
- **周统计** - 按周查看学习统计，展开查看具体汉字
- **我的奖励** - 查看获得的星星奖励

### 📖 快乐阅读模块
- **阅读记录** - 管理阅读书籍和进度

## 🎨 界面特点

- ✅ 左侧可折叠菜单栏设计
- ✅ 一级和二级菜单结构
- ✅ 儿童友好的色彩和动画
- ✅ 响应式设计，支持手机、平板、电脑
- ✅ 流畅的交互动画

## 🚀 快速开始

### 前置要求
- Docker
- Docker Compose

### 部署步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd eleven_study
```

2. **启动服务**
```bash
# 初始化并启动（首次部署）
./init-setup.sh

# 或者直接启动
./start.sh
```

3. **访问应用**
```
http://localhost
或
http://服务器IP
```

### 端口说明
- **80** - 前端访问端口
- **5000** - 后端API端口
- **3306** - MySQL数据库端口

## 📊 技术栈

### 前端
- React 18
- Vite
- Tailwind CSS
- Lucide React（图标）

### 后端
- Python 3.11
- Flask
- Flask-SQLAlchemy
- Flask-CORS

### 数据库
- MySQL 8.0
- 数据挂载到 `./data/mysql`

### 部署
- Docker
- Docker Compose
- Nginx

## 📁 项目结构

```
eleven_study/
├── backend/                # 后端服务
│   ├── app.py             # Flask应用主文件
│   ├── requirements.txt   # Python依赖
│   └── Dockerfile         # 后端Docker配置
├── frontend/              # 前端服务
│   ├── src/
│   │   ├── components/    # React组件
│   │   │   ├── Dashboard.jsx          # 学习看板
│   │   │   ├── WordLibrary.jsx        # 汉字库
│   │   │   ├── LearningMode.jsx       # 开始学习
│   │   │   ├── SentencePractice.jsx   # 汉字练习 🆕
│   │   │   ├── WeeklyStats.jsx        # 周统计
│   │   │   ├── RewardSystem.jsx       # 奖励系统
│   │   │   ├── ReadingManagement.jsx  # 阅读记录
│   │   │   └── Header.jsx             # 侧边栏菜单
│   │   ├── services/      # API服务
│   │   ├── App.jsx        # 主应用组件
│   │   └── index.css      # 全局样式
│   ├── package.json       # Node依赖
│   └── Dockerfile         # 前端Docker配置
├── data/                  # 数据目录
│   └── mysql/            # MySQL数据存储
├── docker-compose.yml     # Docker编排配置
├── init.sql              # 数据库初始化脚本
├── init-setup.sh         # 初始化脚本
├── start.sh              # 启动脚本
├── CHANGELOG.md          # 版本更新日志
└── README.md             # 项目文档
```

## 🎯 功能详解

### 汉字学习
1. **添加汉字**
   - 汉字：必填
   - 拼音：选填
   - 意思：选填

2. **学习汉字**
   - 显示未学习的汉字
   - 简洁的学习界面，只显示汉字
   - 标记"已学会"或"跳过"
   - 学习后获得1颗星星
   - 自动记录学习时间
   - 目标：收集1500颗星星

3. **汉字练习** 🆕
   - 使用已学过的汉字
   - 按顺序点击汉字组成句子
   - 可显示提示
   - 答对自动进入下一题
   - 实时统计完成题数

### 周统计
- 显示每周学习的汉字数量
- 点击展开查看该周学习的具体汉字
- 显示汉字的拼音和意思
- 支持查看历史周数据

### 阅读管理
1. **添加书籍**
   - 书名：必填
   - 作者：选填
   - 封面颜色：选填
   - 总页数：选填
   - 简介：选填

2. **阅读记录**
   - 开始阅读
   - 更新进度
   - 标记完成
   - 阅读统计

## 🔧 API接口

### 汉字管理
- `GET /api/words` - 获取所有汉字
- `POST /api/words` - 添加新汉字
- `PUT /api/words/:id` - 更新汉字
- `DELETE /api/words/:id` - 删除汉字

### 学习记录
- `POST /api/learn/:id` - 标记汉字为已学习
- `GET /api/weekly-stats` - 获取周统计（含具体汉字）
- `GET /api/weekly-words/:year/:week` - 查询指定周的汉字
- `GET /api/current-week` - 获取当前周统计

### 星星系统
- `GET /api/stars` - 获取星星总数
- `POST /api/stars/reset` - 重置进度

### 书籍管理
- `GET /api/books` - 获取所有书籍
- `POST /api/books` - 添加新书籍
- `PUT /api/books/:id` - 更新书籍
- `DELETE /api/books/:id` - 删除书籍

### 阅读记录
- `POST /api/reading/:id/start` - 开始阅读
- `POST /api/reading/:id/complete` - 完成阅读
- `POST /api/reading/:id/progress` - 更新进度
- `GET /api/reading/stats` - 获取阅读统计

## 💾 数据管理

### 数据备份
```bash
# SQL导出
docker compose exec mysql mysqldump -uroot -ppassword literacy_db > backup.sql

# 目录备份（需先停服）
docker compose stop mysql
tar -czf mysql_backup.tar.gz ./data/mysql/
docker compose start mysql
```

### 数据恢复
```bash
# 从SQL恢复
docker compose exec -T mysql mysql -uroot -ppassword literacy_db < backup.sql

# 从目录恢复
docker compose down
tar -xzf mysql_backup.tar.gz
docker compose up -d
```

## 🔄 版本更新

### 部署新版本
```bash
# 停止服务
docker compose down

# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build
```

### 查看日志
```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务日志
docker compose logs frontend
docker compose logs backend
docker compose logs mysql

# 实时查看日志
docker compose logs -f
```

## 🐛 故障排查

### 服务无法启动
```bash
# 查看服务状态
docker compose ps

# 查看详细日志
docker compose logs
```

### 数据库连接失败
```bash
# 检查MySQL容器状态
docker compose ps mysql

# 查看MySQL日志
docker compose logs mysql
```

### 前端无法访问
```bash
# 检查端口占用
netstat -tlnp | grep 80

# 重启服务
docker compose restart frontend
```

## 📝 更新日志

### v2.2 (2025-10-29)
- ✨ 新增汉字练习功能
- 🎨 重构为左侧可折叠菜单栏
- 🗂️ 菜单分为一级和二级结构
- 🧹 清理不必要的脚本和文档

### v2.1 (2025-10-29)
- ✨ 优化表单验证（拼音和意思改为选填）
- 📊 周统计支持展开查看具体汉字
- 🎨 应用更名为"学习乐园"
- 🔧 优化API性能

### v2.0 (2025-10-28)
- ✨ 新增阅读记录管理模块
- 💾 数据挂载到本地目录
- 📚 完善文档

### v1.0 (2025-10-27)
- 🎉 初始版本发布
- ✨ 汉字学习管理
- ⭐ 星星奖励系统
- 📊 每周学习统计

## 📜 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**学习乐园** - 让孩子快乐学习，健康成长！ 🌈
