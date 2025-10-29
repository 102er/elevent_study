#!/bin/bash

# 快速修复脚本 - 最常见的情况

echo "🔧 快速修复MySQL数据问题"
echo "========================================"
echo ""

MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-password}

# 步骤1：停止所有服务
echo "步骤 1/5: 停止所有服务..."
docker compose down

# 步骤2：清理损坏的数据
echo ""
echo "步骤 2/5: 清理损坏的数据目录..."
sudo rm -rf ./data/mysql
mkdir -p ./data/mysql

# 步骤3：尝试从Docker卷迁移
echo ""
echo "步骤 3/5: 尝试从Docker卷迁移数据..."

VOLUME_NAME="eleven_study_mysql_data"
if docker volume inspect $VOLUME_NAME &> /dev/null; then
    echo "找到旧数据卷，正在迁移..."
    docker run --rm \
        -v ${VOLUME_NAME}:/source:ro \
        -v $(pwd)/data/mysql:/target \
        alpine \
        sh -c "cp -av /source/. /target/"
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据迁移成功"
        # 修复权限
        sudo chown -R 999:999 ./data/mysql 2>/dev/null || chown -R 999:999 ./data/mysql
        sudo chmod -R 750 ./data/mysql 2>/dev/null || chmod -R 750 ./data/mysql
    else
        echo "⚠️  迁移失败，将使用空数据库"
        rm -rf ./data/mysql/*
    fi
else
    echo "未找到旧数据卷，将初始化新数据库"
fi

# 步骤4：确保权限正确
echo ""
echo "步骤 4/5: 设置正确的权限..."
sudo chown -R 999:999 ./data/mysql 2>/dev/null || chown -R 999:999 ./data/mysql
sudo chmod -R 750 ./data/mysql 2>/dev/null || chmod -R 750 ./data/mysql

# 步骤5：启动服务
echo ""
echo "步骤 5/5: 启动所有服务..."
docker compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 20

# 验证
echo ""
echo "🔍 验证服务状态..."
docker compose ps

echo ""
echo "✅ 修复完成！"
echo ""
echo "🌐 访问地址：http://localhost 或 http://服务器IP"
echo ""
echo "💡 如果还有问题，请查看日志："
echo "   docker compose logs mysql"
echo ""

