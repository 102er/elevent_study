#!/bin/bash

echo "🚀 儿童识字乐园 - 升级并迁移数据"
echo "========================================"
echo ""
echo "此脚本将完成："
echo "  1. ✅ 更新到v2.0版本（包含阅读记录功能）"
echo "  2. ✅ 将MySQL数据迁移到本地磁盘 (./data/mysql)"
echo "  3. ✅ 保留所有现有数据"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 设置MySQL密码
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-password}

echo "================================"
echo "📦 步骤 1/6: 备份当前数据"
echo "================================"

BACKUP_DIR="./backups"
BACKUP_FILE="backup_before_upgrade_$(date +%Y%m%d_%H%M%S).sql"

mkdir -p $BACKUP_DIR

# 检查服务是否运行
if docker compose ps | grep -q "literacy-mysql.*Up"; then
    echo "正在备份数据库..."
    docker compose exec -T mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} --all-databases > $BACKUP_DIR/$BACKUP_FILE 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ 备份完成：$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "⚠️  备份失败，请检查MySQL密码是否正确"
        echo "提示：可以设置环境变量 MYSQL_ROOT_PASSWORD=你的密码"
        read -p "是否继续？(y/n): " continue
        if [ "$continue" != "y" ]; then
            exit 1
        fi
    fi
else
    echo "ℹ️  MySQL服务未运行，跳过备份"
fi

echo ""

echo "================================"
echo "🛑 步骤 2/6: 停止服务"
echo "================================"
echo "正在停止服务..."
docker compose down

if [ $? -eq 0 ]; then
    echo "✅ 服务已停止"
else
    echo "⚠️  停止服务失败，但可以继续"
fi

echo ""

echo "================================"
echo "📁 步骤 3/6: 迁移数据到本地磁盘"
echo "================================"

# 检查是否有现有的Docker卷
VOLUME_NAME="eleven_study_mysql_data"
if docker volume inspect $VOLUME_NAME &> /dev/null; then
    echo "找到现有数据卷：$VOLUME_NAME"
    echo "正在迁移数据到 ./data/mysql ..."
    
    # 创建目标目录
    mkdir -p ./data/mysql
    
    # 使用临时容器复制数据
    docker run --rm \
        -v ${VOLUME_NAME}:/source:ro \
        -v $(pwd)/data/mysql:/target \
        alpine \
        sh -c "cp -av /source/. /target/" 2>&1 | tail -5
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据迁移成功"
    else
        echo "❌ 数据迁移失败"
        exit 1
    fi
else
    echo "ℹ️  未找到现有Docker卷，将创建新的数据目录"
    mkdir -p ./data/mysql
    echo "✅ 已创建 ./data/mysql 目录"
fi

echo ""

echo "================================"
echo "🔄 步骤 4/6: 更新数据库结构"
echo "================================"
echo "正在启动MySQL服务..."

# 临时启动MySQL以执行迁移SQL
docker compose up -d mysql

echo "⏳ 等待MySQL启动..."
sleep 20

# 检查MySQL是否就绪
for i in {1..30}; do
    if docker compose exec mysql mysqladmin ping -h localhost -uroot -p${MYSQL_ROOT_PASSWORD} &> /dev/null; then
        echo "✅ MySQL已就绪"
        break
    fi
    echo "等待MySQL启动... ($i/30)"
    sleep 2
done

# 执行数据库迁移
if [ -f "migrate-add-reading.sql" ]; then
    echo "正在添加阅读记录表..."
    docker compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} literacy_db < migrate-add-reading.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库结构更新成功"
    else
        echo "⚠️  数据库更新失败，但可能是表已存在"
    fi
else
    echo "⚠️  未找到 migrate-add-reading.sql 文件"
fi

# 验证新表
echo ""
echo "验证数据库表..."
docker compose exec mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "USE literacy_db; SHOW TABLES;" 2>/dev/null

echo ""

echo "================================"
echo "🔨 步骤 5/6: 重新构建并启动所有服务"
echo "================================"
echo "正在停止MySQL..."
docker compose stop mysql

echo "正在重新构建服务..."

# 检查是否有npm命令
if command -v npm &> /dev/null; then
    echo "检测到npm，正在安装前端依赖..."
    cd frontend
    npm install --legacy-peer-deps
    cd ..
else
    echo "未检测到npm，使用Docker容器安装前端依赖..."
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
echo "正在构建镜像..."
docker compose build --no-cache

echo ""
echo "正在启动所有服务..."
docker compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 15

echo ""

echo "================================"
echo "🔍 步骤 6/6: 验证升级结果"
echo "================================"

# 检查服务状态
echo "服务状态："
docker compose ps

echo ""

# 验证数据
echo "验证数据完整性："
docker compose exec mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "
USE literacy_db; 
SELECT '汉字总数:' as '', COUNT(*) FROM words;
SELECT '学习记录数:' as '', COUNT(*) FROM learning_records;
SELECT '书籍总数:' as '', COUNT(*) FROM books;
SELECT '阅读记录数:' as '', COUNT(*) FROM reading_records;
" 2>/dev/null

echo ""
echo "================================"
echo "🎉 升级完成！"
echo "================================"
echo ""
echo "📊 升级摘要："
echo "   ✅ 版本：v2.0"
echo "   ✅ 数据位置：./data/mysql"
echo "   ✅ 备份文件：$BACKUP_DIR/$BACKUP_FILE"
echo "   ✅ 新功能：阅读记录管理"
echo ""
echo "🌐 访问地址："
echo "   http://localhost"
echo "   或 http://服务器IP"
echo ""
echo "📖 新功能："
echo "   - 添加和管理阅读书籍"
echo "   - 记录阅读进度"
echo "   - 追踪完成状态"
echo "   - 阅读统计"
echo ""
echo "💡 提示："
echo "   - 数据现在存储在 ./data/mysql 目录"
echo "   - 可以直接复制该目录来备份数据"
echo "   - 旧的Docker卷还保留着，确认无误后可以删除："
echo "     docker volume rm $VOLUME_NAME"
echo ""
echo "📚 查看详细说明："
echo "   - 阅读记录功能说明.md"
echo "   - 数据挂载说明.md"
echo ""

