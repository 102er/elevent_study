#!/bin/bash

echo "🌈 儿童识字乐园 - CentOS 7 专用部署脚本"
echo "========================================"
echo ""
echo "💡 此脚本专为 CentOS 7 设计，无需安装 Node.js"
echo "   所有前端构建工作将在 Docker 容器内完成"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装"
    echo ""
    echo "请先安装Docker："
    echo "sudo yum install -y yum-utils"
    echo "sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo"
    echo "sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin"
    echo "sudo systemctl start docker"
    echo "sudo systemctl enable docker"
    exit 1
fi

echo "✅ Docker已安装: $(docker --version)"

# 检查Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose未安装"
    echo "请先安装Docker Compose插件"
    exit 1
fi

echo "✅ Docker Compose已安装: $(docker compose version)"
echo ""

# 检查Docker服务是否运行
if ! docker info &> /dev/null; then
    echo "⚠️  Docker服务未运行，正在启动..."
    sudo systemctl start docker
    sleep 2
    if ! docker info &> /dev/null; then
        echo "❌ Docker服务启动失败"
        exit 1
    fi
fi

echo "✅ Docker服务运行中"
echo ""

# 步骤1：使用Docker安装前端依赖
echo "📦 步骤 1/5: 安装前端依赖"
echo "------------------------"

if [ ! -d "frontend/node_modules" ]; then
    echo "使用 Docker 容器安装前端依赖（Node.js 18）..."
    echo "这可能需要几分钟，请耐心等待..."
    echo ""
    
    docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        echo ""
        echo "可能的原因："
        echo "1. 网络问题，可以尝试使用国内镜像"
        echo "2. 权限问题，可以尝试添加 sudo"
        exit 1
    fi
    echo "✅ 前端依赖安装完成"
else
    echo "✅ 前端依赖已存在，跳过安装"
fi

echo ""

# 步骤2：配置环境变量
echo "🔧 步骤 2/5: 配置环境变量"
echo "------------------------"

if [ ! -f ".env" ]; then
    echo "正在创建 .env 文件..."
    cat > .env << 'EOF'
# MySQL数据库配置
MYSQL_ROOT_PASSWORD=literacy2024

# API配置
VITE_API_URL=/api
EOF
    chmod 600 .env
    echo "✅ .env 文件已创建"
    echo "⚠️  默认MySQL密码: literacy2024"
    echo "⚠️  建议修改 .env 文件中的密码以提高安全性！"
else
    echo "✅ .env 文件已存在"
fi

echo ""

# 步骤3：检查项目文件
echo "📋 步骤 3/5: 检查项目文件"
echo "------------------------"

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

# 步骤4：配置防火墙
echo "🔥 步骤 4/5: 配置防火墙"
echo "------------------------"

if command -v firewall-cmd &> /dev/null; then
    echo "正在配置防火墙规则..."
    sudo firewall-cmd --permanent --add-port=80/tcp 2>/dev/null
    sudo firewall-cmd --permanent --add-port=5000/tcp 2>/dev/null
    sudo firewall-cmd --reload 2>/dev/null
    echo "✅ 防火墙配置完成（开放端口 80, 5000）"
else
    echo "⚠️  未检测到 firewall-cmd，跳过防火墙配置"
fi

echo ""

# 步骤5：启动服务
echo "🚀 步骤 5/5: 启动Docker服务"
echo "------------------------"
echo "正在启动服务，首次启动需要下载镜像..."
echo "这可能需要5-10分钟，请耐心等待..."
echo ""

docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ 服务启动失败"
    echo ""
    echo "查看错误日志："
    echo "docker compose logs"
    exit 1
fi

echo ""
echo "⏳ 等待服务启动完成（约30秒）..."
sleep 30

echo ""
echo "📊 服务状态："
docker compose ps

echo ""
echo "🎉 部署完成！"
echo "========================================"
echo ""
echo "🌐 访问地址："
echo "   前端: http://localhost"
echo "   后端API: http://localhost:5000/api/health"
echo ""

# 获取服务器IP
if command -v curl &> /dev/null; then
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "无法获取")
    if [ "$SERVER_IP" != "无法获取" ]; then
        echo "   外网访问: http://$SERVER_IP"
        echo ""
    fi
fi

echo "📝 常用命令："
echo "   查看日志: docker compose logs -f"
echo "   查看状态: docker compose ps"
echo "   停止服务: docker compose stop"
echo "   重启服务: docker compose restart"
echo "   删除服务: docker compose down"
echo ""

echo "🔍 验证部署："
echo "   测试后端: curl http://localhost:5000/api/health"
echo "   测试前端: curl http://localhost/"
echo ""

echo "💡 提示："
echo "   - 如需修改MySQL密码，请编辑 .env 文件"
echo "   - 数据存储在 Docker 数据卷中，重启不会丢失"
echo "   - 详细文档请查看 DEPLOYMENT.md"
echo ""
echo "🎈 祝您使用愉快！"

