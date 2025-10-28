#!/bin/bash

echo "🌈 儿童识字乐园 - 初始化设置"
echo "================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 步骤 1/4: 准备前端依赖"
echo "------------------------"
cd frontend

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 未找到 package.json"
    exit 1
fi

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    
    # 检查是否安装了 npm
    if command -v npm &> /dev/null; then
        echo "使用本地 npm 安装..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ npm 安装失败"
            exit 1
        fi
    else
        echo "⚠️  未检测到 npm，使用 Docker 容器安装..."
        
        # 检查 Docker 是否可用
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker 未安装，无法继续"
            echo "请先安装 Docker 或 Node.js"
            exit 1
        fi
        
        # 使用 Docker 容器安装依赖
        docker run --rm -v $(pwd):/app -w /app node:18-alpine npm install
        if [ $? -ne 0 ]; then
            echo "❌ Docker 安装依赖失败"
            exit 1
        fi
        echo "✅ 使用 Docker 安装依赖成功"
    fi
    echo "✅ 前端依赖安装完成"
else
    echo "✅ 前端依赖已存在"
fi

# 生成package-lock.json（如果不存在）
if [ ! -f "package-lock.json" ]; then
    echo "正在生成 package-lock.json..."
    if command -v npm &> /dev/null; then
        npm install
    else
        docker run --rm -v $(pwd):/app -w /app node:18-alpine npm install
    fi
    echo "✅ package-lock.json 已生成"
fi

cd ..

echo ""
echo "🔧 步骤 2/4: 配置环境变量"
echo "------------------------"

# 创建.env文件
if [ ! -f ".env" ]; then
    echo "正在创建 .env 文件..."
    cat > .env << 'EOF'
# MySQL数据库配置
MYSQL_ROOT_PASSWORD=literacy2024

# API配置
VITE_API_URL=/api
EOF
    echo "✅ .env 文件已创建"
    echo "⚠️  默认MySQL密码: literacy2024"
    echo "⚠️  建议修改密码以提高安全性！"
else
    echo "✅ .env 文件已存在"
fi

echo ""
echo "📋 步骤 3/4: 验证Docker环境"
echo "------------------------"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装"
    echo "请访问 https://docs.docker.com/engine/install/ 安装Docker"
    exit 1
fi
echo "✅ Docker已安装: $(docker --version)"

# 检查Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose未安装"
    echo "请安装Docker Compose v2"
    exit 1
fi
echo "✅ Docker Compose已安装: $(docker compose version)"

# 检查Docker服务是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker服务未运行"
    echo "请启动Docker服务"
    exit 1
fi
echo "✅ Docker服务运行中"

echo ""
echo "🎯 步骤 4/4: 项目结构检查"
echo "------------------------"

# 检查关键文件
files_to_check=(
    "docker-compose.yml"
    "init.sql"
    "frontend/Dockerfile"
    "frontend/nginx.conf"
    "frontend/package.json"
    "backend/Dockerfile"
    "backend/app.py"
    "backend/requirements.txt"
)

all_ok=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
        all_ok=false
    fi
done

if [ "$all_ok" = false ]; then
    echo ""
    echo "❌ 有文件缺失，请检查项目结构"
    exit 1
fi

echo ""
echo "🎉 初始化完成！"
echo "================================"
echo ""
echo "接下来的步骤："
echo ""
echo "1️⃣  启动服务："
echo "   docker compose up -d"
echo ""
echo "2️⃣  查看日志："
echo "   docker compose logs -f"
echo ""
echo "3️⃣  访问应用："
echo "   浏览器打开: http://localhost"
echo ""
echo "4️⃣  查看服务状态："
echo "   docker compose ps"
echo ""
echo "💡 提示："
echo "   - 首次启动可能需要几分钟下载镜像"
echo "   - 数据库会自动初始化"
echo "   - 如遇问题请查看 DEPLOYMENT.md"
echo ""

