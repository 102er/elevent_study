#!/bin/bash

echo "📦 MySQL数据迁移 - 从Docker卷到本地磁盘"
echo "========================================"
echo ""
echo "此脚本将把MySQL数据从Docker卷迁移到项目目录下的 ./data/mysql"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否有现有的Docker卷
VOLUME_NAME="eleven_study_mysql_data"
if ! docker volume inspect $VOLUME_NAME &> /dev/null; then
    echo "ℹ️  未找到现有的Docker数据卷，将创建新的本地目录"
    mkdir -p ./data/mysql
    echo "✅ 已创建 ./data/mysql 目录"
    echo ""
    echo "现在可以直接启动服务："
    echo "  docker compose up -d"
    exit 0
fi

echo "✅ 找到现有数据卷: $VOLUME_NAME"
echo ""

# 步骤1：备份当前数据
echo "📦 步骤 1/4: 备份当前数据"
echo "------------------------"

BACKUP_DIR="./backups"
BACKUP_FILE="backup_before_migration_$(date +%Y%m%d_%H%M%S).sql"

mkdir -p $BACKUP_DIR

# 检查服务是否运行
if docker compose ps | grep -q "literacy-mysql.*Up"; then
    echo "正在备份数据库..."
    docker compose exec -T mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD:-password} --all-databases > $BACKUP_DIR/$BACKUP_FILE 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ 备份完成：$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "⚠️  备份失败，但可以继续（数据仍在Docker卷中）"
    fi
else
    echo "⚠️  MySQL服务未运行，跳过备份"
fi

echo ""

# 步骤2：停止服务
echo "🛑 步骤 2/4: 停止服务"
echo "------------------------"
echo "正在停止服务..."
docker compose down

echo "✅ 服务已停止"
echo ""

# 步骤3：迁移数据
echo "📁 步骤 3/4: 迁移数据"
echo "------------------------"

# 创建目标目录
mkdir -p ./data/mysql

echo "正在从Docker卷复制数据到 ./data/mysql ..."
echo "这可能需要几分钟，请耐心等待..."
echo ""

# 使用临时容器复制数据
docker run --rm \
    -v ${VOLUME_NAME}:/source:ro \
    -v $(pwd)/data/mysql:/target \
    alpine \
    sh -c "cp -av /source/. /target/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据迁移成功"
else
    echo ""
    echo "❌ 数据迁移失败"
    exit 1
fi

echo ""

# 步骤4：更新配置并重启
echo "🚀 步骤 4/4: 重启服务"
echo "------------------------"
echo "正在使用新的本地挂载启动服务..."

docker compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 15

echo ""

# 验证数据
echo "🔍 验证数据完整性"
echo "------------------------"

docker compose exec mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-password} -e "USE literacy_db; SELECT COUNT(*) as word_count FROM words; SELECT COUNT(*) as learning_count FROM learning_records;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据验证成功"
else
    echo ""
    echo "⚠️  无法连接数据库，请稍等片刻再试"
fi

echo ""
echo "🎉 迁移完成！"
echo "========================================"
echo ""
echo "📊 当前配置："
echo "   数据位置: ./data/mysql"
echo "   备份位置: $BACKUP_DIR/$BACKUP_FILE"
echo ""
echo "💡 提示："
echo "   - 数据现在存储在项目目录下，方便备份"
echo "   - 可以直接复制 ./data/mysql 目录来备份整个数据库"
echo "   - 旧的Docker卷还保留着，确认无误后可以删除："
echo "     docker volume rm $VOLUME_NAME"
echo ""
echo "🌐 访问地址："
echo "   http://localhost"
echo ""

