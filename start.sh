#!/bin/bash

echo "🌈 儿童识字乐园 - 快速启动脚本"
echo "================================"
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

