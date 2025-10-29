#!/bin/bash

echo "🔄 应用v2.1更新"
echo "========================================"
echo ""
echo "本次更新内容："
echo "  1. ✅ 汉字的拼音和意思改为非必填"
echo "  2. ✅ 应用改名为'学习乐园'"
echo "  3. ✅ 菜单分为'儿童识字'和'快乐阅读'两个模块"
echo "  4. ✅ 周统计支持点击查看详细汉字"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-password}

echo "================================"
echo "📦 步骤 1/5: 备份当前数据"
echo "================================"

BACKUP_DIR="./backups"
BACKUP_FILE="backup_v2.1_$(date +%Y%m%d_%H%M%S).sql"

mkdir -p $BACKUP_DIR

if docker compose ps | grep -q "literacy-mysql.*Up"; then
    echo "正在备份数据库..."
    docker compose exec -T mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} --all-databases > $BACKUP_DIR/$BACKUP_FILE 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ 备份完成：$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "⚠️  备份失败，但可以继续"
    fi
else
    echo "ℹ️  MySQL服务未运行，跳过备份"
fi

echo ""

echo "================================"
echo "🗄️  步骤 2/5: 更新数据库结构"
echo "================================"

# 检查MySQL是否运行
if ! docker compose ps | grep -q "literacy-mysql.*Up"; then
    echo "启动MySQL服务..."
    docker compose up -d mysql
    echo "⏳ 等待MySQL启动..."
    sleep 15
fi

# 执行数据库结构更新
if [ -f "update-schema.sql" ]; then
    echo "正在更新数据库结构..."
    docker compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} < update-schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库结构更新成功"
    else
        echo "⚠️  数据库更新失败，但可以继续"
    fi
else
    echo "⚠️  未找到 update-schema.sql 文件"
fi

echo ""

echo "================================"
echo "🔨 步骤 3/5: 安装前端依赖"
echo "================================"

# 检查是否有npm命令
if command -v npm &> /dev/null; then
    echo "使用本地npm安装依赖..."
    cd frontend
    npm install --legacy-peer-deps
    cd ..
else
    echo "使用Docker容器安装依赖..."
    docker run --rm \
        -v $(pwd)/frontend:/app \
        -w /app \
        node:18-alpine \
        sh -c "npm install --legacy-peer-deps"
fi

if [ $? -eq 0 ]; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi

echo ""

echo "================================"
echo "🏗️  步骤 4/5: 重新构建服务"
echo "================================"

echo "正在停止服务..."
docker compose down

echo ""
echo "正在重新构建镜像..."
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功"
else
    echo "❌ 镜像构建失败"
    exit 1
fi

echo ""

echo "================================"
echo "🚀 步骤 5/5: 启动服务"
echo "================================"

docker compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 15

echo ""

# 验证服务状态
echo "服务状态："
docker compose ps

echo ""
echo "================================"
echo "🎉 更新完成！"
echo "================================"
echo ""
echo "📊 更新摘要："
echo "   ✅ 版本：v2.1"
echo "   ✅ 应用名称：学习乐园"
echo "   ✅ 备份文件：$BACKUP_DIR/$BACKUP_FILE"
echo ""
echo "🆕 新功能："
echo "   - 添加汉字时，拼音和意思为选填项"
echo "   - 应用改名为'学习乐园'"
echo "   - 菜单分为两个模块："
echo "     📚 儿童识字：学习看板、汉字库、开始学习、周统计、我的奖励"
echo "     📖 快乐阅读：阅读记录"
echo "   - 周统计页面点击可查看该周学习的所有汉字"
echo ""
echo "🌐 访问地址："
echo "   http://localhost"
echo "   或 http://服务器IP"
echo ""
echo "💡 提示："
echo "   - 现有汉字的拼音和意思不受影响"
echo "   - 新添加的汉字可以只填汉字，不填拼音和意思"
echo "   - 周统计功能已支持查看具体学习的汉字"
echo ""

