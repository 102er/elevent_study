#!/bin/bash

echo "🌈 儿童识字乐园 - 快速启动脚本"
echo "================================"
echo ""
echo "💡 提示：如果是首次部署，请先运行: ./init-setup.sh"
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查前端依赖是否已安装
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  警告：未找到前端依赖！"
    echo ""
    read -p "是否现在安装前端依赖？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在安装前端依赖..."
        
        # 检查是否安装了 npm
        if command -v npm &> /dev/null; then
            echo "使用本地 npm 安装..."
            cd frontend && npm install && cd ..
        else
            echo "⚠️  未检测到 npm，使用 Docker 容器安装..."
            
            # 检查 Docker 是否可用
            if ! command -v docker &> /dev/null; then
                echo "❌ Docker 未安装，无法继续"
                echo "请先安装 Docker 或 Node.js"
                exit 1
            fi
            
            # 使用 Docker 容器安装依赖
            docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm install
        fi
        
        if [ $? -ne 0 ]; then
            echo "❌ 依赖安装失败"
            exit 1
        fi
        echo "✅ 依赖安装完成"
    else
        echo "⚠️  跳过依赖安装，Docker构建可能失败"
        if command -v npm &> /dev/null; then
            echo "建议先运行: cd frontend && npm install && cd .."
        else
            echo "建议先运行: docker run --rm -v \$(pwd)/frontend:/app -w /app node:18-alpine npm install"
        fi
    fi
    echo ""
fi

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  未找到.env文件，正在创建..."
    cat > .env << EOF
# MySQL数据库配置
MYSQL_ROOT_PASSWORD=literacy2024

# API配置
VITE_API_URL=/api
EOF
    echo "✅ 已创建.env文件，使用默认密码: literacy2024"
    echo "⚠️  请修改.env文件中的密码以提高安全性"
    echo ""
fi

echo "🚀 正在启动服务..."
docker compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "✅ 服务已启动！"
echo ""
echo "📊 服务状态："
docker compose ps
echo ""
echo "🌐 访问地址："
echo "   前端: http://localhost"
echo "   后端API: http://localhost:5000"
echo "   MySQL: localhost:3306"
echo ""
echo "📝 常用命令："
echo "   查看日志: docker compose logs -f"
echo "   停止服务: docker compose stop"
echo "   重启服务: docker compose restart"
echo "   删除服务: docker compose down"
echo ""
echo "🎉 祝您使用愉快！"

